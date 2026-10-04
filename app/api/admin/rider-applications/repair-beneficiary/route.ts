import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    // Require logged-in admin
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

    // Verify admin
    const { data: adminProfile, error: adminError } =
      await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (adminError || adminProfile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const { applicationId } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required." },
        { status: 400 }
      );
    }

    // Get current bank details directly from Supabase
    const { data: application, error: applicationError } =
      await supabaseAdmin
        .from("rider_applications")
        .select(`
          id,
          user_id,
          status,
          bank_code,
          bank_name,
          account_number,
          account_name,
          flutterwave_beneficiary_id
        `)
        .eq("id", applicationId)
        .single();

    if (applicationError || !application) {
      return NextResponse.json(
        { error: "Rider application not found." },
        { status: 404 }
      );
    }

    if (
      !application.bank_code ||
      !application.account_number ||
      !application.bank_name ||
      !application.account_name
    ) {
      return NextResponse.json(
        { error: "Rider bank details are incomplete." },
        { status: 400 }
      );
    }

    // Create a NEW V4 recipient using the CURRENT bank details.
    const payoutResponse = await fetch(
      "https://payout.bitevy.app/create-recipient",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bitevy-secret":
            process.env.BITEVY_PAYOUT_SECRET!,
        },
        body: JSON.stringify({
          applicationId: application.id,
          bankCode: application.bank_code,
          accountNumber: application.account_number,
        }),
      }
    );

    const payoutData = await payoutResponse.json();

    if (!payoutResponse.ok || !payoutData.ok) {
      console.error(
        "Beneficiary repair creation failed:",
        payoutData
      );

      return NextResponse.json(
        {
          error:
            payoutData.error ||
            "Failed to create replacement Flutterwave recipient.",
        },
        { status: 400 }
      );
    }

    const recipientId = String(payoutData.recipientId);

    if (!recipientId.startsWith("rcb_")) {
      return NextResponse.json(
        { error: "Flutterwave returned an invalid recipient ID." },
        { status: 500 }
      );
    }

    // Save the NEW recipient ID.
    const { error: updateError } = await supabaseAdmin
      .from("rider_applications")
      .update({
        flutterwave_beneficiary_id: recipientId,
      })
      .eq("id", application.id);

    if (updateError) {
      console.error(
        "Failed to save replacement beneficiary:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Recipient was created, but the database was not updated.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Rider Flutterwave beneficiary repaired.",
      recipientId,
      bankName: application.bank_name,
      accountName: application.account_name,
    });
  } catch (error) {
    console.error(
      "Beneficiary repair error:",
      error
    );

    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}