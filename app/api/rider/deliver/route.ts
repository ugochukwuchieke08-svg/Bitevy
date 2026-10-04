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

export async function POST(req: NextRequest) {
  try {
    const { orderId, riderId, deliveryPin } = await req.json();

    // ============================================================
    // INPUT VALIDATION
    // ============================================================

    if (!orderId || !riderId || !deliveryPin) {
      return NextResponse.json(
        { error: "Missing orderId, riderId, or delivery PIN." },
        { status: 400 }
      );
    }

    // ============================================================
    // AUTHENTICATE RIDER
    // ============================================================

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
            "This order has not been successfully paid for. Delivery cannot be completed.",
        },
        { status: 400 }
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

    if (!alreadyDelivered) {
      if (String(order.delivery_pin) !== String(deliveryPin)) {
        return NextResponse.json(
          { error: "Incorrect delivery PIN." },
          { status: 400 }
        );
      }
    }

    // ============================================================
    // RIDER PAYOUT AMOUNT
    // ============================================================

    const amount = Number(order.rider_amount);

    if (!Number.isFinite(amount) || amount < 100) {
      console.error("Invalid rider payout amount:", {
        orderId: order.id,
        riderAmount: order.rider_amount,
      });

      return NextResponse.json(
        {
          error:
            "This order cannot be completed because the rider payout amount is invalid.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // SHORT FLUTTERWAVE REFERENCE
    // ============================================================
    //
    // Flutterwave references must stay within their length limit.
    //
    // Example:
    // BTV-R-398e968f-R1
    //
    // ============================================================

    const reference = `BTV-R-${String(order.id).slice(0, 8)}-R1`;

    // ============================================================
    // CHECK EXISTING PAYOUT
    // ============================================================

    const {
      data: existingPayout,
      error: existingPayoutError,
    } = await supabase
      .from("rider_payouts")
      .select(`
        id,
        status,
        flutterwave_reference,
        flutterwave_transfer_id,
        failure_reason,
        next_attempt_at
      `)
      .eq("order_id", order.id)
      .maybeSingle();

    if (existingPayoutError) {
      console.error(
        "Existing payout lookup failed:",
        existingPayoutError
      );

      return NextResponse.json(
        {
          error: "Failed to check rider payout status.",
        },
        { status: 500 }
      );
    }

    // ============================================================
    // MARK ORDER AS DELIVERED FIRST
    // ============================================================
    //
    // Delivery must never depend on Flutterwave payout.
    //
    // ============================================================

    if (!alreadyDelivered) {
      const {
        data: updatedOrder,
        error: updateError,
      } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          delivery_pin_verified: true,
          delivered_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("rider_id", riderId)
        .eq("status", "out_for_delivery")
        .eq("delivery_pin_verified", false)
        .select("id, status, delivered_at")
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
    // CREATE / UPDATE RIDER PAYOUT QUEUE
    // ============================================================
    //
    // IMPORTANT:
    //
    // This route DOES NOT transfer money.
    //
    // It only creates/queues the payout.
    //
    // The DigitalOcean worker handles Flutterwave transfers.
    //
    // ============================================================

    let payoutStatus = "pending";
    let payoutErrorMessage: string | null = null;

    // ============================================================
    // EXISTING PAYOUT
    // ============================================================

    if (existingPayout) {
      // ----------------------------------------------------------
      // ALREADY PAID
      // ----------------------------------------------------------

      if (existingPayout.status === "paid") {
        payoutStatus = "paid";
        payoutErrorMessage = null;
      }

      // ----------------------------------------------------------
      // PROCESSING
      // ----------------------------------------------------------

      else if (existingPayout.status === "processing") {
        payoutStatus = "processing";
        payoutErrorMessage = null;
      }

      // ----------------------------------------------------------
      // PENDING
      // ----------------------------------------------------------

      else if (existingPayout.status === "pending") {
        payoutStatus = "pending";
        payoutErrorMessage = existingPayout.failure_reason;

        const { error: queueError } = await supabase
          .from("rider_payouts")
          .update({
            next_attempt_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingPayout.id);

        if (queueError) {
          console.error(
            "Failed to refresh payout queue:",
            queueError
          );
        }
      }

      // ----------------------------------------------------------
      // FAILED
      // ----------------------------------------------------------

      else if (existingPayout.status === "failed") {
        const { error: retryError } = await supabase
          .from("rider_payouts")
          .update({
            status: "pending",
            failure_reason: null,
            next_attempt_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingPayout.id);

        if (retryError) {
          console.error(
            "Failed to requeue rider payout:",
            retryError
          );

          payoutStatus = "failed";
          payoutErrorMessage =
            "Order delivered, but rider payout could not be queued.";
        } else {
          payoutStatus = "pending";
          payoutErrorMessage = null;
        }
      }
    }

    // ============================================================
    // NO EXISTING PAYOUT
    // ============================================================

    else {
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

      let initialFailureReason: string | null = null;

      if (riderError) {
        console.error(
          "Rider payout details lookup failed:",
          riderError
        );

        initialFailureReason =
          "Failed to verify rider payout details.";
      } else if (!riderApplication) {
        initialFailureReason =
          "Active rider application not found.";
      } else if (
        !riderApplication.flutterwave_beneficiary_id
      ) {
        initialFailureReason =
          "This rider does not have a Flutterwave payout beneficiary.";
      }

      const {
        data: payout,
        error: payoutInsertError,
      } = await supabase
        .from("rider_payouts")
        .insert({
          rider_id: order.rider_id,
          order_id: order.id,
          amount,
          currency: "NGN",
          flutterwave_reference: reference,
          status: "pending",
          failure_reason: initialFailureReason,
          next_attempt_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (payoutInsertError || !payout) {
        console.error(
          "Payout insert failed:",
          payoutInsertError
        );

        return NextResponse.json(
          {
            error:
              "Order was delivered, but rider payout could not be queued.",
          },
          { status: 500 }
        );
      }

      payoutStatus = "pending";
      payoutErrorMessage = initialFailureReason;
    }

    // ============================================================
    // CUSTOMER NOTIFICATION
    // ============================================================

    if (!alreadyDelivered) {
      const customerTitle = "Order Delivered 🎉";

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

      try {
        await sendNotification({
          userId: order.user_id,
          title: customerTitle,
          body: customerMessage,
          data: {
            orderId: order.id.toString(),
            type: "order_delivered",
          },
        });
      } catch (notificationError) {
        console.error(
          "Customer push notification failed:",
          notificationError
        );
      }
    }

    // ============================================================
    // RESTAURANT NOTIFICATION
    // ============================================================

    if (!alreadyDelivered) {
      const restaurant = Array.isArray(order.restaurants)
        ? order.restaurants[0]
        : order.restaurants;

      if (restaurant?.owner_id) {
        const restaurantTitle = "Order Delivered 🎉";

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

        try {
          await sendNotification({
            userId: restaurant.owner_id,
            title: restaurantTitle,
            body: restaurantMessage,
            data: {
              orderId: order.id.toString(),
              type: "order_delivered",
            },
          });
        } catch (notificationError) {
          console.error(
            "Restaurant push notification failed:",
            notificationError
          );
        }
      }
    }

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,
      message: alreadyDelivered
        ? "Order is already delivered. Rider payout is queued."
        : "Order delivered successfully. Rider payout is pending.",
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