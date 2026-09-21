import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    // 1. Check logged-in admin
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    // 2. Check admin permission
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 403 }
      );
    }

    // 3. Get order ID
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    // 4. Get order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        rider_id,
        rider_amount,
        status
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order lookup error:", orderError);

      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    // 5. Make sure rider exists
    if (!order.rider_id) {
      return NextResponse.json(
        { error: "This order has no assigned rider." },
        { status: 400 }
      );
    }

    // 6. Only pay after delivery
    if (order.status !== "delivered") {
      return NextResponse.json(
        {
          error:
            "Rider can only be paid after the order is delivered.",
        },
        { status: 400 }
      );
    }

    // 7. Validate payout amount
    const amount = Number(order.rider_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid rider payout amount." },
        { status: 400 }
      );
    }

    // 8. Check for an existing payout
    const { data: existingPayout, error: existingPayoutError } =
      await supabaseAdmin
        .from("rider_payouts")
        .select(
          "id, status, flutterwave_reference, flutterwave_transfer_id"
        )
        .eq("order_id", order.id)
        .maybeSingle();

    if (existingPayoutError) {
      console.error(
        "Existing payout lookup error:",
        existingPayoutError
      );

      return NextResponse.json(
        { error: "Failed to check existing rider payout." },
        { status: 500 }
      );
    }

    if (
      existingPayout &&
      ["pending", "processing", "successful"].includes(
        existingPayout.status
      )
    ) {
      return NextResponse.json(
        {
          error: "This order already has a rider payout.",
          payout: existingPayout,
        },
        { status: 409 }
      );
    }

    // 9. Get rider Flutterwave beneficiary
    const { data: riderApplication, error: riderError } =
      await supabaseAdmin
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
      console.error("Rider lookup error:", riderError);

      return NextResponse.json(
        { error: "Failed to find rider payout details." },
        { status: 500 }
      );
    }

    if (!riderApplication) {
      return NextResponse.json(
        { error: "Active rider application not found." },
        { status: 404 }
      );
    }

    if (!riderApplication.flutterwave_beneficiary_id) {
      return NextResponse.json(
        {
          error:
            "This rider does not have a Flutterwave payout beneficiary.",
        },
        { status: 400 }
      );
    }

    // 10. Make sure Flutterwave secret exists
    const secretKey = process.env.FLW_SECRET_KEY;

    if (!secretKey) {
      console.error("FLW_SECRET_KEY is missing.");

      return NextResponse.json(
        { error: "Flutterwave configuration error." },
        { status: 500 }
      );
    }

    // 11. Create unique reference
    const reference = `BTV-RIDER-${order.id}-${Date.now()}`;

    // 12. Create payout record first
    const { data: payout, error: payoutInsertError } =
      await supabaseAdmin
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
        "Payout record creation error:",
        payoutInsertError
      );

      return NextResponse.json(
        {
          error:
            "Could not create payout record. No money was sent.",
        },
        { status: 500 }
      );
    }

    // 13. Initiate Flutterwave transfer
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

    const flutterwaveData = await flutterwaveResponse.json();

    console.log("FLUTTERWAVE RIDER PAYOUT RESPONSE:", {
      status: flutterwaveResponse.status,
      data: flutterwaveData,
    });

    // 14. Flutterwave rejected the transfer
    if (
      !flutterwaveResponse.ok ||
      flutterwaveData.status !== "success"
    ) {
      const failureReason =
        flutterwaveData.message ||
        "Flutterwave transfer failed.";

      await supabaseAdmin
        .from("rider_payouts")
        .update({
          status: "failed",
          failure_reason: failureReason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payout.id);

      return NextResponse.json(
        {
          error: failureReason,
        },
        { status: 400 }
      );
    }

    // 15. Save Flutterwave transfer ID
    const transferId = flutterwaveData.data?.id
      ? String(flutterwaveData.data.id)
      : null;

    await supabaseAdmin
      .from("rider_payouts")
      .update({
        flutterwave_transfer_id: transferId,
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payout.id);

    return NextResponse.json({
      success: true,
      message: "Rider payout initiated successfully.",
      payout: {
        id: payout.id,
        orderId: order.id,
        riderId: order.rider_id,
        amount,
        currency: "NGN",
        reference,
        flutterwaveTransferId: transferId,
        status: "processing",
      },
    });
  } catch (error) {
    console.error("Rider payout error:", error);

    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}