import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@/lib/sendNotification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { orderId, status } = await req.json();

    // Update order
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select("id, user_id, restaurant_id")
      .single();

    if (updateError || !order) {
      return NextResponse.json(
        { error: "Failed to update order." },
        { status: 400 }
      );
    }

    // Get restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("name")
      .eq("id", order.restaurant_id)
      .single();

    if (restaurantError) {
      console.error("Restaurant lookup failed:", restaurantError);
    }

    let title = "";
    let message = "";

    switch (status) {
      case "preparing":
        title = "Order Accepted 🍽️";
        message = `${restaurant?.name} accepted your order and is preparing it.`;
        break;

      case "ready":
        title = "Order Ready 📦";
        message = "Your order is ready for pickup.";
        break;

      case "cancelled":
        title = "Order Cancelled ❌";
        message = "Unfortunately your order was cancelled.";
        break;
    }

    // Customer notification
    if (title) {
      await supabase.from("notifications").insert({
        user_id: order.user_id,
        order_id: order.id,
        title,
        message,
        link: `/orders/${order.id}`,
      });

      await sendNotification({
        userId: order.user_id,
        title,
        body: message,
        data: {
          orderId: order.id.toString(),
          type: status,
        },
      });
    }

    // ==========================
    // Notify all riders
    // ==========================
    if (status === "ready") {
      const { data: riders, error: ridersError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "rider");

      if (ridersError) {
        console.error("Failed to fetch riders:", ridersError);
      } else if (riders && riders.length > 0) {
        for (const rider of riders) {
          // Save rider notification
          await supabase.from("notifications").insert({
            user_id: rider.id,
            order_id: order.id,
            title: "New Delivery Available 🚴",
            message: `${restaurant?.name} has an order ready for pickup.`,
            link: `/rider/orders/${order.id}`,
          });

          // Push notification
          await sendNotification({
            userId: rider.id,
            title: "New Delivery Available 🚴",
            body: `${restaurant?.name} has an order ready for pickup.`,
            data: {
              orderId: order.id.toString(),
              type: "delivery_available",
            },
          });
        }

        console.log(`Sent notifications to ${riders.length} rider(s).`);
      }
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}