import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { transactionId, txRef } = await req.json();

    if (!transactionId || !txRef) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing transaction information.",
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.FLW_SECRET_KEY;

    if (!secretKey) {
      console.error("FLW_SECRET_KEY is missing");

      return NextResponse.json(
        {
          success: false,
          error: "Payment configuration error.",
        },
        { status: 500 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Find the Bitevy order using Flutterwave's transaction reference
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, total, payment_status, payment_reference, payment_method"
      )
      .eq("payment_reference", txRef)
      .single();

    if (orderError || !order) {
      console.error("Order lookup failed:", orderError);

      return NextResponse.json(
        {
          success: false,
          error: "Order associated with this payment was not found.",
        },
        { status: 404 }
      );
    }

    // Don't process the same payment twice
    if (order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment has already been verified.",
        orderId: order.id,
      });
    }

    // Ask Flutterwave directly about the transaction
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    console.log("Flutterwave verification response:", data);

    if (!response.ok || data.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Unable to verify payment.",
        },
        { status: 400 }
      );
    }

    const transaction = data.data;

    // Payment must actually be successful
    if (transaction.status !== "successful") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment was not successful.",
        },
        { status: 400 }
      );
    }

    // Must be NGN
    if (transaction.currency !== "NGN") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment currency.",
        },
        { status: 400 }
      );
    }

    // Make sure the Flutterwave reference belongs to this order
    if (transaction.tx_ref !== order.payment_reference) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment reference does not match the order.",
        },
        { status: 400 }
      );
    }

    // VERY IMPORTANT:
    // The amount paid must match the amount Bitevy expected.
    if (Number(transaction.amount) !== Number(order.total)) {
      console.error("PAYMENT AMOUNT MISMATCH:", {
        orderTotal: order.total,
        flutterwaveAmount: transaction.amount,
        orderId: order.id,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Payment amount does not match the order.",
        },
        { status: 400 }
      );
    }

    // Mark the order as paid
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
      console.error("Failed to update order:", updateError);

      return NextResponse.json(
        {
          success: false,
          error: "Payment verified but order could not be updated.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      orderId: order.id,
    });
  } catch (error) {
    console.error("Flutterwave verification error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}