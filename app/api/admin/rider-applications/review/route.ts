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
        .select("id, user_id, status")
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
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Application update error:", updateError);

      return NextResponse.json(
        { error: "Failed to update rider application." },
        { status: 500 }
      );
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