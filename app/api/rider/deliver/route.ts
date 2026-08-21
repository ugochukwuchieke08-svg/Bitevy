import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@/lib/sendNotification";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { orderId, riderId } = await req.json();

    if (!orderId || !riderId) {
      return NextResponse.json(
        { error: "Missing orderId or riderId." },
        { status: 400 }
      );
    }

    // Get the order and verify this rider owns it
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        rider_id,
        restaurant_id,
        status,
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

    // Security check
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

    // Mark delivered
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "delivered",
      })
      .eq("id", orderId)
      .eq("rider_id", riderId);

    if (updateError) {
      console.error("Failed to mark delivered:", updateError);

      return NextResponse.json(
        { error: "Failed to mark order as delivered." },
        { status: 400 }
      );
    }

    const restaurant = Array.isArray(order.restaurants)
      ? order.restaurants[0]
      : order.restaurants;

    // ==========================
    // CUSTOMER NOTIFICATION
    // ==========================

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

    // ==========================
    // RESTAURANT NOTIFICATION
    // ==========================

    if (restaurant?.owner_id) {
      const restaurantTitle = "Order Delivered 🎉";
      const restaurantMessage =
        `Order #${order.id.toString().slice(0, 8)} has been delivered successfully.`;

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

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error("Deliver order error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}