import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendNotification } from "@/lib/sendNotification";

export async function POST(req: NextRequest) {
  try {
    // Check logged-in admin
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

    // Check admin permission
    // This assumes admin users are identified by profiles.role = "admin"
    const { data: adminProfile, error: adminError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (adminError || adminProfile?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 403 }
      );
    }

    const { applicationId, decision } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required." },
        { status: 400 }
      );
    }

    if (decision !== "approve" && decision !== "reject") {
      return NextResponse.json(
        { error: "Invalid decision." },
        { status: 400 }
      );
    }

    // Get rider application
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
          account_name
        `)
        .eq("id", applicationId)
        .single();

    if (applicationError || !application) {
      return NextResponse.json(
        { error: "Rider application not found." },
        { status: 404 }
      );
    }

    // Prevent reviewing an already processed application
    if (application.status !== "pending") {
      return NextResponse.json(
        {
          error: `This application has already been ${application.status}.`,
        },
        { status: 400 }
      );
    }

    // Create Flutterwave payout beneficiary
let flutterwaveBeneficiaryId: string | null = null;

if (decision === "approve") {
  if (
    !application.bank_code ||
    !application.bank_name ||
    !application.account_number ||
    !application.account_name
  ) {
    return NextResponse.json(
      { error: "Rider bank details are incomplete." },
      { status: 400 }
    );
  }

  const flutterwaveResponse = await fetch(
    "https://api.flutterwave.com/v3/beneficiaries",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_bank: application.bank_code,
        account_number: application.account_number,
        beneficiary_name: application.account_name,
        currency: "NGN",
        bank_name: application.bank_name,
      }),
    }
  );

  const flutterwaveData = await flutterwaveResponse.json();

  console.log("FLUTTERWAVE BENEFICIARY RESPONSE:", {
    status: flutterwaveResponse.status,
    data: flutterwaveData,
  });

  if (
    !flutterwaveResponse.ok ||
    flutterwaveData.status !== "success"
  ) {
    return NextResponse.json(
      {
        error:
          flutterwaveData.message ||
          "Failed to create Flutterwave payout beneficiary.",
      },
      { status: 400 }
    );
  }

  flutterwaveBeneficiaryId = String(flutterwaveData.data.id);
}

    const newStatus =
      decision === "approve" ? "active" : "rejected";

    // Update application
    const { error: updateError } = await supabaseAdmin
      .from("rider_applications")
      .update({
        status: newStatus,
        approved_at:
          decision === "approve" ? new Date().toISOString() : null,
        approved_by:
          decision === "approve" ? user.id : null,
          flutterwave_beneficiary_id: flutterwaveBeneficiaryId,
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Application update error:", updateError);

      return NextResponse.json(
        { error: "Failed to update rider application." },
        { status: 500 }
      );
    }
// Promote approved user to rider
if (decision === "approve") {
  const { error: riderRoleError } = await supabase.rpc(
    "promote_user_to_rider",
    {
      target_user_id: application.user_id,
    }
  );

  if (riderRoleError) {
    console.error("Failed to promote user to rider:", riderRoleError);

    return NextResponse.json(
      { error: "Failed to assign rider role." },
      { status: 500 }
    );
  }
}

    // Notification content
    const title =
      decision === "approve"
        ? "Rider Application Approved 🎉"
        : "Rider Application Update";

    const message =
      decision === "approve"
        ? "Congratulations! Your Bitevy rider application has been approved. You can now access your rider dashboard."
        : "Unfortunately, your Bitevy rider application was not approved at this time.";

    // Save in-app notification
    const { error: notificationError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: application.user_id,
        title,
        message,
        link: "/rider",
      });

    if (notificationError) {
      console.error(
        "Failed to save rider notification:",
        notificationError
      );
    }

    // Send push notification
    try {
      await sendNotification({
        userId: application.user_id,
        title,
        body: message,
        data: {
          type:
            decision === "approve"
              ? "rider_application_approved"
              : "rider_application_rejected",
          applicationId: application.id.toString(),
        },
      });
    } catch (notificationError) {
      console.error(
        "Failed to send rider push notification:",
        notificationError
      );
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
    });
  } catch (error) {
    console.error("Rider application review error:", error);

    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}