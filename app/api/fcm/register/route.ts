import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, token } = await req.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Missing userId or token" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("user_push_tokens")
      .upsert(
        {
          user_id: userId,
          fcm_token: token,
          platform: "android",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "fcm_token",
        }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("FCM Register Error:", error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}