import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@/lib/sendNotification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const authSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAYOUT_SERVER_URL = "https://payout.bitevy.app/create-transfer";

export async function POST(req: NextRequest) {
  try {
   const { orderId, riderId, deliveryPin } = await req.json();

    if (!orderId || !riderId || !deliveryPin) {
      return NextResponse.json(
        { error: "Missing orderId, riderId, or delivery PIN." },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    if (String(user.id) !== String(riderId)) {
      return NextResponse.json(
        { error: "Unauthorized rider." },
        { status: 403 }
      );
    }

    if (!orderId || !riderId || !deliveryPin) {
      return NextResponse.json(
        { error: "Missing orderId, riderId, or delivery PIN." },
        { status: 400 }
      );
    }

    // ============================================================
    // GET ORDER
    // ============================================================

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        rider_id,
        restaurant_id,
        status,
        payment_status,
        rider_amount,
        delivery_pin,
        delivery_pin_verified,
        restaurants (
          name,
          owner_id
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order lookup failed:", orderError);

      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // ============================================================
    // RIDER SECURITY
    // ============================================================

    if (String(order.rider_id) !== String(riderId)) {
      return NextResponse.json(
        { error: "You are not assigned to this order." },
        { status: 403 }
      );
    }

    // ============================================================
    // PAYMENT CHECK
    // ============================================================

    if (order.payment_status !== "paid") {
      return NextResponse.json(
        {
          error:
            "This order has not been successfully paid for. Rider payout cannot be processed.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // GET EXISTING PAYOUT
    // ============================================================

    const { data: existingPayout, error: existingPayoutError } =
      await supabase
        .from("rider_payouts")
        .select(`
          id,
          status,
          flutterwave_reference,
          flutterwave_transfer_id,
          failure_reason
        `)
        .eq("order_id", order.id)
        .maybeSingle();

    if (existingPayoutError) {
      console.error(
        "Existing payout lookup failed:",
        existingPayoutError
      );

      return NextResponse.json(
        { error: "Failed to check rider payout." },
        { status: 500 }
      );
    }

    // ============================================================
    // DELIVERY STATE SECURITY
    // ============================================================

    const alreadyDelivered =
      order.status === "delivered" &&
      order.delivery_pin_verified === true;

    const currentlyOutForDelivery =
      order.status === "out_for_delivery" &&
      order.delivery_pin_verified === false;

    if (!currentlyOutForDelivery && !alreadyDelivered) {
      return NextResponse.json(
        { error: "This order is not ready to be completed." },
        { status: 400 }
      );
    }

    // ============================================================
    // DELIVERY PIN
    // ============================================================

    // A delivery that was already verified can only reach this
    // route again for a payout retry.
    if (!alreadyDelivered) {
      if (String(order.delivery_pin) !== String(deliveryPin)) {
        return NextResponse.json(
          { error: "Incorrect delivery PIN." },
          { status: 400 }
        );
      }
    }

    // ============================================================
    // RIDER PAYOUT
    // ============================================================

    let payoutStatus = "failed";
    let payoutErrorMessage: string | null = null;

    try {
     const amount = Number(order.rider_amount);

      if (!Number.isFinite(amount) || amount < 100) {
        throw new Error(
          "Rider payout must be at least ₦100."
        );
      }

      // ----------------------------------------------------------
      // GET RIDER PAYOUT BENEFICIARY
      // ----------------------------------------------------------

      const { data: riderApplication, error: riderError } =
        await supabase
          .from("rider_applications")
          .select(`
            user_id,
            status,
            flutterwave_beneficiary_id
          `)
          .eq("user_id", order.rider_id)
          .eq("status", "active")
          .maybeSingle();

      if (riderError) {
        console.error(
          "Rider payout details lookup failed:",
          riderError
        );

        throw new Error(
          "Failed to find rider payout details."
        );
      }

      if (!riderApplication) {
        throw new Error(
          "Active rider application not found."
        );
      }

      if (!riderApplication.flutterwave_beneficiary_id) {
        throw new Error(
          "This rider does not have a Flutterwave payout beneficiary."
        );
      }

      // ----------------------------------------------------------
      // PAYOUT REFERENCE
      // ----------------------------------------------------------
      // IMPORTANT:
      // Stable per order. Never use Date.now() here.
      //
      // This prevents duplicate transfers if the delivery endpoint
      // is called again.

      const reference = `BTV-R-${order.id}`;

      // ----------------------------------------------------------
      // EXISTING PAYOUT
      // ----------------------------------------------------------

      if (existingPayout) {
        // Already submitted to Flutterwave.
        // DO NOT create another transfer.
        if (
          ["processing", "pending", "successful"].includes(
            existingPayout.status
          )
        ) {
          payoutStatus = existingPayout.status;
          payoutErrorMessage = null;
        } else if (existingPayout.status === "failed") {
          // A failed payout can be retried using the SAME
          // reference. The payout server's idempotency key
          // protects against duplicate creation.
          const payoutSecret =
            process.env.BITEVY_PAYOUT_SECRET;

          if (!payoutSecret) {
            throw new Error(
              "Payout server configuration error."
            );
          }

          const payoutResponse = await fetch(
            PAYOUT_SERVER_URL,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-bitevy-secret": payoutSecret,
              },
              body: JSON.stringify({
                recipientId:
                  riderApplication.flutterwave_beneficiary_id,
                amount,
                reference,
                narration:
                  `Bitevy rider payout for order ${order.id}`,
              }),
            }
          );

          const payoutData =
            await payoutResponse.json();

          console.log(
            "BITEVY PAYOUT RETRY RESPONSE:",
            {
              status: payoutResponse.status,
              data: payoutData,
            }
          );

          if (
            !payoutResponse.ok ||
            !payoutData.ok ||
            !payoutData.transfer
          ) {
            const failureReason =
              payoutData.error ||
              "Flutterwave transfer failed.";

            await supabase
              .from("rider_payouts")
              .update({
                status: "failed",
                failure_reason: failureReason,
                updated_at:
                  new Date().toISOString(),
              })
              .eq("id", existingPayout.id);

            throw new Error(failureReason);
          }

          const transfer =
            payoutData.transfer;

          const transferId = transfer.id
            ? String(transfer.id)
            : existingPayout.flutterwave_transfer_id;

          const transferStatus =
            String(transfer.status || "").toUpperCase();

          let databaseStatus = "processing";

          if (transferStatus === "SUCCESSFUL") {
            databaseStatus = "successful";
          } else if (transferStatus === "FAILED") {
            databaseStatus = "failed";
          } else if (
            ["NEW", "PENDING", "PROCESSING"].includes(
              transferStatus
            )
          ) {
            databaseStatus = "processing";
          }

          await supabase
            .from("rider_payouts")
            .update({
              flutterwave_transfer_id:
                transferId,
              flutterwave_reference:
                reference,
              status: databaseStatus,
              failure_reason:
                databaseStatus === "failed"
                  ? "Flutterwave transfer failed."
                  : null,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", existingPayout.id);

          payoutStatus = databaseStatus;

          if (databaseStatus === "failed") {
            throw new Error(
              "Flutterwave transfer failed."
            );
          }
        }
      } else {
        // --------------------------------------------------------
        // CREATE NEW PAYOUT RECORD
        // --------------------------------------------------------

        const { data: payout, error: payoutInsertError } =
          await supabase
            .from("rider_payouts")
            .insert({
              rider_id: order.rider_id,
              order_id: order.id,
              amount,
              currency: "NGN",
              flutterwave_reference: reference,
              status: "processing",
            })
            .select()
            .single();

        if (payoutInsertError || !payout) {
          console.error(
            "Payout insert failed:",
            payoutInsertError
          );

          throw new Error(
            "Could not create rider payout record."
          );
        }

        // --------------------------------------------------------
        // SEND PAYOUT TO DEDICATED PAYOUT SERVER
        // --------------------------------------------------------

        const payoutSecret =
          process.env.BITEVY_PAYOUT_SECRET;

        if (!payoutSecret) {
          throw new Error(
            "Payout server configuration error."
          );
        }

        const payoutResponse = await fetch(
          PAYOUT_SERVER_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-bitevy-secret": payoutSecret,
            },
            body: JSON.stringify({
              recipientId:
                riderApplication.flutterwave_beneficiary_id,
              amount,
              reference,
              narration:
                `Bitevy rider payout for order ${order.id}`,
            }),
          }
        );

        const payoutData =
          await payoutResponse.json();

        console.log(
          "BITEVY RIDER PAYOUT RESPONSE:",
          {
            status: payoutResponse.status,
            data: payoutData,
          }
        );

        if (
          !payoutResponse.ok ||
          !payoutData.ok ||
          !payoutData.transfer
        ) {
          const failureReason =
            payoutData.error ||
            "Flutterwave transfer failed.";

          await supabase
            .from("rider_payouts")
            .update({
              status: "failed",
              failure_reason: failureReason,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", payout.id);

          throw new Error(failureReason);
        }

        // --------------------------------------------------------
        // SAVE FLUTTERWAVE TRANSFER
        // --------------------------------------------------------

        const transfer =
          payoutData.transfer;

        const transferId = transfer.id
          ? String(transfer.id)
          : null;

        const transferStatus =
          String(transfer.status || "").toUpperCase();

        let databaseStatus = "processing";

        if (transferStatus === "SUCCESSFUL") {
          databaseStatus = "successful";
        } else if (transferStatus === "FAILED") {
          databaseStatus = "failed";
        } else if (
          ["NEW", "PENDING", "PROCESSING"].includes(
            transferStatus
          )
        ) {
          databaseStatus = "processing";
        }

        await supabase
          .from("rider_payouts")
          .update({
            flutterwave_transfer_id:
              transferId,
            status: databaseStatus,
            failure_reason:
              databaseStatus === "failed"
                ? "Flutterwave transfer failed."
                : null,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", payout.id);

        payoutStatus = databaseStatus;

        if (databaseStatus === "failed") {
          throw new Error(
            "Flutterwave transfer failed."
          );
        }
      }
    } catch (payoutError) {
      console.error(
        "RIDER PAYOUT ERROR:",
        payoutError
      );

      payoutErrorMessage =
        payoutError instanceof Error
          ? payoutError.message
          : "Rider payout failed.";

      payoutStatus = "failed";
    }

    // ============================================================
    // MARK ORDER AS DELIVERED
    // ============================================================
    //
    // Delivery itself should not depend on payout success.
    // The rider has physically completed the delivery.
    //
    // If payout fails, the order remains delivered and the
    // endpoint can safely be called again to retry ONLY the payout.

    if (!alreadyDelivered) {
      const { data: updatedOrder, error: updateError } =
        await supabase
          .from("orders")
          .update({
            status: "delivered",
            delivery_pin_verified: true,
            delivered_at:
              new Date().toISOString(),
          })
          .eq("id", order.id)
          .eq("rider_id", riderId)
          .eq("status", "out_for_delivery")
          .eq("delivery_pin_verified", false)
          .select(
            "id, status, delivered_at"
          )
          .single();

      if (updateError || !updatedOrder) {
        console.error(
          "Failed to mark delivered:",
          updateError
        );

        return NextResponse.json(
          {
            error:
              "Delivery was not completed. Please retry.",
          },
          { status: 400 }
        );
      }
    }

    // ============================================================
    // CUSTOMER NOTIFICATION
    // ============================================================

    const customerTitle =
      "Order Delivered 🎉";

    const customerMessage =
      "Your food has been delivered. Enjoy your meal!";

    await supabase
      .from("notifications")
      .insert({
        user_id: order.user_id,
        order_id: order.id,
        title: customerTitle,
        message: customerMessage,
        link: `/orders/${order.id}`,
      });

    await sendNotification({
      userId: order.user_id,
      title: customerTitle,
      body: customerMessage,
      data: {
        orderId: order.id.toString(),
        type: "order_delivered",
      },
    });

    // ============================================================
    // RESTAURANT NOTIFICATION
    // ============================================================

    const restaurant = Array.isArray(
      order.restaurants
    )
      ? order.restaurants[0]
      : order.restaurants;

    if (restaurant?.owner_id) {
      const restaurantTitle =
        "Order Delivered 🎉";

      const restaurantMessage =
        `Order #${order.id
          .toString()
          .slice(0, 8)} has been delivered successfully.`;

      await supabase
        .from("notifications")
        .insert({
          user_id: restaurant.owner_id,
          order_id: order.id,
          title: restaurantTitle,
          message: restaurantMessage,
          link: `/restaurant/orders/${order.id}`,
        });

      await sendNotification({
        userId: restaurant.owner_id,
        title: restaurantTitle,
        body: restaurantMessage,
        data: {
          orderId: order.id.toString(),
          type: "order_delivered",
        },
      });
    }

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,
      message: alreadyDelivered
        ? "Rider payout retry processed."
        : "Order delivered successfully.",
      payout: {
        status: payoutStatus,
        error: payoutErrorMessage,
      },
    });
  } catch (error) {
    console.error(
      "Deliver order error:",
      error
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}