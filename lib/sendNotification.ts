import { messaging } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SendNotificationParams = {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

export async function sendNotification({
  userId,
  title,
  body,
  data = {},
}: SendNotificationParams) {
  // Get user's FCM tokens
  const { data: tokens, error } = await supabaseAdmin
    .from("user_push_tokens")
    .select("fcm_token")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to get push tokens:", error);
    return;
  }

  if (!tokens || tokens.length === 0) {
    console.log("No push tokens found for:", userId);
    return;
  }

  const sends = tokens.map((token) =>
    messaging.send({
      token: token.fcm_token,
      notification: {
        title,
        body,
      },
      data,
    })
  );

  const results = await Promise.allSettled(sends);

  console.log("Notification send results:", results);
}