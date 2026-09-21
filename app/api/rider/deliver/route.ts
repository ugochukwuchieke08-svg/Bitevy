import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@/lib/sendNotification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { orderId, riderId, deliveryPin } = await req.json();

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
    // SECURITY CHECK
    // ============================================================

    if (String(order.rider_id) !== String(riderId)) {
      return NextResponse.json(
        { error: "You are not assigned to this order." },
        { status: 403 }
      );
    }

    if (order.status !== "out_for_delivery") {
      return NextResponse.json(
        { error: "This order is not currently out for delivery." },
        { status: 400 }
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
    // DELIVERY PIN SECURITY
    // ============================================================

    if (order.delivery_pin_verified) {
      return NextResponse.json(
        { error: "This delivery has already been verified." },
        { status: 400 }
      );
    }

    if (String(order.delivery_pin) !== String(deliveryPin)) {
      return NextResponse.json(
        { error: "Incorrect delivery PIN." },
        { status: 400 }
      );
    }

    // ============================================================
    // MARK ORDER AS DELIVERED
    // ============================================================

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "delivered",
        delivery_pin_verified: true,
        delivered_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("rider_id", riderId)
      .eq("status", "out_for_delivery")
      .eq("delivery_pin_verified", false)
      .select("id, status, delivered_at")
      .single();

    if (updateError || !updatedOrder) {
      console.error("Failed to mark delivered:", updateError);

      return NextResponse.json(
        { error: "Failed to mark order as delivered." },
        { status: 400 }
      );
    }

    // ============================================================
    // RIDER PAYOUT
    // ============================================================

    let payoutStatus = "failed";
    let payoutErrorMessage: string | null = null;

    try {
      const amount = Number(order.rider_amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Invalid rider payout amount.");
      }

      // Get rider's active payout beneficiary
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
        throw new Error("Failed to find rider payout details.");
      }

      if (!riderApplication) {
        throw new Error("Active rider application not found.");
      }

      if (!riderApplication.flutterwave_beneficiary_id) {
        throw new Error(
          "This rider does not have a Flutterwave payout beneficiary."
        );
      }

      const secretKey = process.env.FLW_SECRET_KEY;

      if (!secretKey) {
        throw new Error("Flutterwave configuration error.");
      }

      // ==========================================================
      // CHECK FOR EXISTING PAYOUT
      // ==========================================================

      const { data: existingPayout, error: existingPayoutError } =
        await supabase
          .from("rider_payouts")
          .select(`
            id,
            status,
            flutterwave_reference,
            flutterwave_transfer_id
          `)
          .eq("order_id", order.id)
          .maybeSingle();

      if (existingPayoutError) {
        throw new Error("Failed to check existing rider payout.");
      }

      if (existingPayout) {
        if (
          ["pending", "processing", "successful"].includes(
            existingPayout.status
          )
        ) {
          payoutStatus = existingPayout.status;
        } else if (existingPayout.status === "failed") {
          throw new Error(
            "A rider payout for this order already failed."
          );
        }
      } else {
        // ========================================================
        // CREATE PAYOUT RECORD
        // ========================================================

        const reference =
          `BTV-RIDER-${order.id}-${Date.now()}`;

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
          throw new Error(
            "Could not create rider payout record."
          );
        }

        // ========================================================
        // SEND FLUTTERWAVE TRANSFER
        // ========================================================

        const flutterwaveResponse = await fetch(
          "https://api.flutterwave.com/v3/transfers",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${secretKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              beneficiary: Number(
                riderApplication.flutterwave_beneficiary_id
              ),
              amount,
              currency: "NGN",
              debit_currency: "NGN",
              reference,
              narration: `Bitevy rider payout for order ${order.id}`,
            }),
          }
        );

        const flutterwaveData =
          await flutterwaveResponse.json();

        console.log(
          "FLUTTERWAVE RIDER PAYOUT RESPONSE:",
          {
            status: flutterwaveResponse.status,
            data: flutterwaveData,
          }
        );

        if (
          !flutterwaveResponse.ok ||
          flutterwaveData.status !== "success"
        ) {
          const failureReason =
            flutterwaveData.message ||
            "Flutterwave transfer failed.";

          await supabase
            .from("rider_payouts")
            .update({
              status: "failed",
              failure_reason: failureReason,
              updated_at: new Date().toISOString(),
            })
            .eq("id", payout.id);

          throw new Error(failureReason);
        }

        const transferId =
          flutterwaveData.data?.id
            ? String(flutterwaveData.data.id)
            : null;

        await supabase
          .from("rider_payouts")
          .update({
            flutterwave_transfer_id: transferId,
            status: "processing",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payout.id);

        payoutStatus = "processing";
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
    // CUSTOMER NOTIFICATION
    // ============================================================

    const customerTitle = "Order Delivered 🎉";

    const customerMessage =
      "Your food has been delivered. Enjoy your meal!";

    await supabase.from("notifications").insert({
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

    const restaurant = Array.isArray(order.restaurants)
      ? order.restaurants[0]
      : order.restaurants;

    if (restaurant?.owner_id) {
      const restaurantTitle = "Order Delivered 🎉";

      const restaurantMessage =
        `Order #${order.id
          .toString()
          .slice(0, 8)} has been delivered successfully.`;

      await supabase.from("notifications").insert({
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
      message: "Order delivered successfully.",
      payout: {
        status: payoutStatus,
        error: payoutErrorMessage,
      },
    });
  } catch (error) {
    console.error("Deliver order error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}