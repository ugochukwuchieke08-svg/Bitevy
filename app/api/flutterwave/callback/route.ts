import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const transactionId = searchParams.get("transaction_id");
    const txRef = searchParams.get("tx_ref");
    const status = searchParams.get("status");

    console.log("FLUTTERWAVE CALLBACK:", {
      transactionId,
      txRef,
      status,
    });

    if (!transactionId || !txRef) {
      return NextResponse.redirect(
        new URL("/payment/failed", req.url)
      );
    }

    if (status !== "successful") {
      return NextResponse.redirect(
        new URL(
          `/payment/failed?tx_ref=${encodeURIComponent(txRef)}`,
          req.url
        )
      );
    }

    const secretKey = process.env.FLW_SECRET_KEY;

    if (!secretKey) {
      console.error("FLW_SECRET_KEY is missing.");

      return NextResponse.redirect(
        new URL("/payment/failed", req.url)
      );
    }

    // ============================================================
    // VERIFY PAYMENT WITH FLUTTERWAVE
    // ============================================================

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

    console.log("FLUTTERWAVE VERIFICATION:", data);

    if (
      !response.ok ||
      data.status !== "success" ||
      data.data?.status !== "successful"
    ) {
      return NextResponse.redirect(
        new URL(
          `/payment/failed?tx_ref=${encodeURIComponent(txRef)}`,
          req.url
        )
      );
    }

    // ============================================================
    // FIND ORDER
    // ============================================================

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        total,
        payment_reference,
        payment_status
      `)
      .eq("payment_reference", txRef)
      .single();

    if (orderError || !order) {
      console.error("Order lookup failed:", orderError);

      return NextResponse.redirect(
        new URL("/payment/failed", req.url)
      );
    }

    // ============================================================
    // VERIFY AMOUNT AND CURRENCY
    // ============================================================

    const paidAmount = Number(data.data?.amount);
    const orderTotal = Number(order.total);
    const paidCurrency = data.data?.currency;

    if (
      paidCurrency !== "NGN" ||
      !Number.isFinite(paidAmount) ||
      paidAmount < orderTotal
    ) {
      console.error("PAYMENT AMOUNT/CURRENCY MISMATCH:", {
        orderId: order.id,
        orderTotal,
        paidAmount,
        paidCurrency,
      });

      return NextResponse.redirect(
        new URL(
          `/payment/failed?tx_ref=${encodeURIComponent(txRef)}`,
          req.url
        )
      );
    }

    // ============================================================
    // VERIFY TRANSACTION REFERENCE
    // ============================================================

    if (data.data?.tx_ref !== order.payment_reference) {
      console.error("TRANSACTION REFERENCE MISMATCH:", {
        flutterwaveTxRef: data.data?.tx_ref,
        orderReference: order.payment_reference,
      });

      return NextResponse.redirect(
        new URL("/payment/failed", req.url)
      );
    }

    // ============================================================
    // MARK ORDER AS PAID
    // ============================================================

    if (order.payment_status !== "paid") {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_method: "flutterwave",
        })
        .eq("id", order.id);

      if (updateError) {
        console.error(
          "Failed to update payment status:",
          updateError
        );

        return NextResponse.redirect(
          new URL("/payment/failed", req.url)
        );
      }
    }

    // ============================================================
    // REDIRECT TO ORDER SUCCESS PAGE
    // ============================================================

    return NextResponse.redirect(
      new URL(
        `/order-success?orderId=${encodeURIComponent(order.id)}`,
        req.url
      )
    );
  } catch (error) {
    console.error(
      "Flutterwave callback error:",
      error
    );

    return NextResponse.redirect(
      new URL("/payment/failed", req.url)
    );
  }
}