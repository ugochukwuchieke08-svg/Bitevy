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

    // 2. Check admin
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

    const { payoutId } = await req.json();

    if (!payoutId) {
      return NextResponse.json(
        { error: "Payout ID is required." },
        { status: 400 }
      );
    }

    // 3. Get payout
    const { data: payout, error: payoutError } =
      await supabaseAdmin
        .from("rider_payouts")
        .select(`
          id,
          order_id,
          amount,
          status,
          flutterwave_transfer_id,
          flutterwave_reference
        `)
        .eq("id", payoutId)
        .single();

    if (payoutError || !payout) {
      return NextResponse.json(
        { error: "Payout not found." },
        { status: 404 }
      );
    }

    if (!payout.flutterwave_transfer_id) {
      return NextResponse.json(
        {
          error:
            "This payout does not have a Flutterwave transfer ID.",
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.FLW_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Flutterwave configuration error." },
        { status: 500 }
      );
    }

    // 4. Ask Flutterwave for the transfer status
    const response = await fetch(
      `https://api.flutterwave.com/v3/transfers/${payout.flutterwave_transfer_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    console.log("FLUTTERWAVE TRANSFER VERIFICATION:", {
      status: response.status,
      data,
    });

    if (!response.ok || data.status !== "success") {
      return NextResponse.json(
        {
          error:
            data.message ||
            "Unable to verify Flutterwave transfer.",
        },
        { status: 400 }
      );
    }

    const transferStatus =
      String(data.data?.status || "").toLowerCase();

    let newStatus = payout.status;

    if (
      transferStatus === "successful" ||
      transferStatus === "completed"
    ) {
      newStatus = "successful";
    } else if (
      transferStatus === "failed" ||
      transferStatus === "cancelled"
    ) {
      newStatus = "failed";
    } else {
      newStatus = "processing";
    }

    // 5. Save verified status
    const { error: updateError } = await supabaseAdmin
      .from("rider_payouts")
      .update({
        status: newStatus,
        failure_reason:
          newStatus === "failed"
            ? data.data?.complete_message ||
              data.data?.message ||
              "Flutterwave transfer failed."
            : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payout.id);

    if (updateError) {
      console.error(
        "Failed to update payout status:",
        updateError
      );

      return NextResponse.json(
        { error: "Failed to update payout status." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payoutId: payout.id,
      orderId: payout.order_id,
      amount: payout.amount,
      flutterwaveStatus: transferStatus,
      status: newStatus,
    });
  } catch (error) {
    console.error(
      "Rider payout verification error:",
      error
    );

    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}