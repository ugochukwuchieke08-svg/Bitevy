import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  req: NextRequest
) {
  try {
    const supabase =
      await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      notificationId,
      deleteAll,
    } = body;

    /*
     * HIDE ALL
     */
    if (deleteAll) {
      const { error } =
        await adminSupabase
          .from("notifications")
          .update({
            deleted_at:
              new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .is("deleted_at", null);

      if (error) {
        console.error(
          "HIDE ALL NOTIFICATIONS ERROR:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Could not clear notifications",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
      });
    }

    /*
     * HIDE ONE
     */
    if (!notificationId) {
      return NextResponse.json(
        {
          error:
            "Notification ID is required",
        },
        { status: 400 }
      );
    }

    /*
     * Verify ownership first.
     */
    const { data: notification } =
      await adminSupabase
        .from("notifications")
        .select("id")
        .eq("id", notificationId)
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .single();

    if (!notification) {
      return NextResponse.json(
        {
          error:
            "Notification not found",
        },
        { status: 404 }
      );
    }

    /*
     * Soft delete.
     */
    const { error } =
      await adminSupabase
        .from("notifications")
        .update({
          deleted_at:
            new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("user_id", user.id);

    if (error) {
      console.error(
        "HIDE NOTIFICATION ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Could not remove notification",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "NOTIFICATION DELETE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}