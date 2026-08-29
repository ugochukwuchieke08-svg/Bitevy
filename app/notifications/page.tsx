import { Bell } from "lucide-react";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import NotificationsList from "@/components/NotificationList";

export default async function NotificationsPage() {
  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#fff8f0] p-5 flex items-center justify-center">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
            <Bell
              size={28}
              className="text-orange-500"
            />
          </div>

          <h1 className="mt-5 text-2xl font-black text-gray-950">
            Please login
          </h1>

          <p className="mt-2 text-gray-500">
            Login to view your notifications.
          </p>

          <Link
            href="/login?redirect=/notifications"
            className="mt-6 inline-flex rounded-2xl bg-green-700 px-6 py-3 font-bold text-white"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  const { data: notifications } =
    await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", {
        ascending: false,
      });

  return (
    <main className="min-h-screen bg-[#fff8f0] px-5 py-5 pb-10">
      <div className="mx-auto max-w-2xl">
        <NotificationsList
          notifications={notifications || []}
        />
      </div>
    </main>
  );
}