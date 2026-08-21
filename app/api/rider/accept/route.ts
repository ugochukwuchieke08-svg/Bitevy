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

    // Claim the order atomically
    const { data: order, error: claimError } =
      await supabase.rpc("claim_order", {
        p_order_id: orderId,
        p_rider_id: riderId,
      });

    if (claimError) {
      console.error("Claim order error:", claimError);

      return NextResponse.json(
        { error: "Unable to accept delivery." },
        { status: 400 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "This order is no longer available." },
        { status: 409 }
      );
    }

    // Get full order information
    const { data: orderData, error: orderError } =
      await supabase
        .from("orders")
        .select(`
          id,
          user_id,
          restaurant_id,
          rider_id,
          restaurants (
            id,
            name,
            owner_id
          )
        `)
        .eq("id", orderId)
        .single();

    if (orderError || !orderData) {
      console.error("Order lookup failed:", orderError);

      return NextResponse.json(
        { error: "Order could not be found." },
        { status: 404 }
      );
    }

    const restaurant = Array.isArray(orderData.restaurants)
      ? orderData.restaurants[0]
      : orderData.restaurants;

    const customerId = orderData.user_id;
    const restaurantOwnerId = restaurant?.owner_id;

    // ==========================
    // CUSTOMER NOTIFICATION
    // ==========================

    const customerTitle = "Rider Assigned 🚴";
    const customerMessage =
      "Your rider has accepted the delivery and is on the way.";

    await supabase.from("notifications").insert({
      user_id: customerId,
      order_id: orderId,
      title: customerTitle,
      message: customerMessage,
      link: `/orders/${orderId}`,
    });

    await sendNotification({
      userId: customerId,
      title: customerTitle,
      body: customerMessage,
      data: {
        orderId: orderId.toString(),
        type: "rider_assigned",
      },
    });

    // ==========================
    // RESTAURANT NOTIFICATION
    // ==========================

    if (restaurantOwnerId) {
      const restaurantTitle = "Rider Assigned 🚴";
      const restaurantMessage =
        `A rider has accepted order #${orderId.toString().slice(0, 8)}.`;

      await supabase.from("notifications").insert({
        user_id: restaurantOwnerId,
        order_id: orderId,
        title: restaurantTitle,
        message: restaurantMessage,
        link: `/restaurant/orders/${orderId}`,
      });

      await sendNotification({
        userId: restaurantOwnerId,
        title: restaurantTitle,
        body: restaurantMessage,
        data: {
          orderId: orderId.toString(),
          type: "rider_assigned",
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: orderData,
    });

  } catch (error) {
    console.error("Rider accept error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}