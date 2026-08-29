import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
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

    const { orderId, deleteAll } = body;

    /*
     * HIDE ALL ORDERS
     */
    if (deleteAll) {
      const { error } =
        await adminSupabase
          .from("orders")
          .update({
            deleted_at:
              new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .is("deleted_at", null);

      if (error) {
        console.error(
          "HIDE ALL ORDERS ERROR:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Could not clear orders",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
      });
    }

    /*
     * HIDE ONE ORDER
     */
    if (!orderId) {
      return NextResponse.json(
        {
          error: "Order ID is required",
        },
        { status: 400 }
      );
    }

    const { data: order, error: findError } =
      await adminSupabase
        .from("orders")
        .select("id")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .single();

    if (findError || !order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    const { error } =
      await adminSupabase
        .from("orders")
        .update({
          deleted_at:
            new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("user_id", user.id);

    if (error) {
      console.error(
        "HIDE ORDER ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Could not remove order",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "ORDERS DELETE API ERROR:",
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