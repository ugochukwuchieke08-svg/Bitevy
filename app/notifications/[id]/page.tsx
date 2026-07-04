import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NotificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: notification } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!notification) {
    notFound();
  }

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

 if (notification.link) {
  redirect(notification.link);
}

redirect("/notifications");
}