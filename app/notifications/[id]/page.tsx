import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NotificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log("NOTIFICATION ROUTE ID:", id);

  // Make sure the ID actually exists and is numeric
  if (!id || !/^\d+$/.test(id)) {
    console.error("INVALID NOTIFICATION ID:", id);
    notFound();
  }

  const notificationId = Number(id);

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notification, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .single();

  console.log("NOTIFICATION:", notification);
  console.log("NOTIFICATION ERROR:", error);

  if (error || !notification) {
    console.error("NOTIFICATION NOT FOUND:", {
      id: notificationId,
      userId: user.id,
      error,
    });

    notFound();
  }

  // Mark notification as read
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  // If this notification has a destination link, go there
  if (notification.link) {
    redirect(notification.link);
  }

  // Otherwise return to notifications
  redirect("/notifications");
}