import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@/lib/sendNotification";

export async function POST(req: Request) {
  try {
    const secretHash = process.env.FLW_SECRET_HASH;
    const secretKey = process.env.FLW_SECRET_KEY;

    if (!secretHash || !secretKey) {
      console.error("FLW_SECRET_HASH is missing");

      return NextResponse.json(
        { success: false },
        { status: 500 }
      );
    }

    // Verify Flutterwave webhook signature
    const signature = req.headers.get("verif-hash");

    if (!signature || signature !== secretHash) {
      console.error("INVALID FLUTTERWAVE WEBHOOK SIGNATURE");

      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const payload = await req.json();

    console.log("FLUTTERWAVE WEBHOOK:", payload);

   const transaction = payload?.data;

      if (!transaction) {
        return NextResponse.json({ success: true });
      }

      const transactionId = transaction.id;

      if (!transactionId) {
        console.error("Webhook transaction has no ID");

        return NextResponse.json({ success: true });
      }

      // Re-verify the transaction directly with Flutterwave
      const verifyResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const verifyData = await verifyResponse.json();

      console.log(
        "FLUTTERWAVE WEBHOOK RE-VERIFICATION:",
        verifyData
      );

      if (
        !verifyResponse.ok ||
        verifyData.status !== "success" ||
        verifyData.data?.status !== "successful"
      ) {
        console.error("Webhook transaction verification failed");

        return NextResponse.json(
          { success: false },
          { status: 400 }
        );
      }

      const verifiedTransaction = verifyData.data;

    const txRef = verifiedTransaction.tx_ref;

    if (!txRef) {
      console.error("Webhook transaction has no tx_ref");
      return NextResponse.json({ success: true });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find the Bitevy order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        total,
        payment_status,
        payment_reference,
        payment_method,
        restaurant_id,
        customer_name
      `)
      .eq("payment_reference", txRef)
      .single();

    if (orderError || !order) {
      console.error("Webhook order lookup failed:", orderError);

      return NextResponse.json({ success: true });
    }

    // Already processed — safely ignore duplicate webhook
    if (order.payment_status === "paid") {
      return NextResponse.json({ success: true });
    }

    // Verify the amount
    if (Number(verifiedTransaction.amount) !== Number(order.total)) {
      console.error("WEBHOOK PAYMENT AMOUNT MISMATCH:", {
        orderId: order.id,
        orderTotal: order.total,
        flutterwaveAmount: verifiedTransaction.amount,
      });

      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    // Verify currency
    if (verifiedTransaction.currency !== "NGN") {
      console.error("WEBHOOK INVALID CURRENCY:",
        verifiedTransaction.currency
      );

      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    // Mark order as paid
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_method: "flutterwave",
        paid_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("payment_status", "pending");

    if (updateError) {
      console.error(
        "WEBHOOK ORDER UPDATE FAILED:",
        updateError
      );

      return NextResponse.json(
        { success: false },
        { status: 500 }
      );
    }

    // Notify restaurant only after successful payment update
    const { data: restaurant, error: restaurantError } =
      await supabase
        .from("restaurants")
        .select("owner_id, name")
        .eq("id", order.restaurant_id)
        .single();

    if (restaurantError) {
      console.error(
        "WEBHOOK RESTAURANT LOOKUP FAILED:",
        restaurantError
      );
    } else if (restaurant?.owner_id) {
      try {
        await sendNotification({
          userId: restaurant.owner_id,
          title: "New Order Received 🍔",
          body: `${order.customer_name} placed a new order.`,
          data: {
            orderId: order.id.toString(),
            type: "new_order",
          },
        });
      } catch (notificationError) {
        console.error(
          "WEBHOOK NOTIFICATION FAILED:",
          notificationError
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FLUTTERWAVE WEBHOOK ERROR:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}