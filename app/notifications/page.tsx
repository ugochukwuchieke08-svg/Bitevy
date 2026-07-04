import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser(); 
  
  await supabase
  .from("notifications")
  .update({
    read: true,
  })
  .eq("read", false);

  console.log("Logged in user:",user?.id);

  if (!user) {
    return <h1>Please login.</h1>;
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

    console.log("Notifications:", notifications);

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      <h1 className="text-3xl font-black text-black mb-8">
        Notifications
      </h1>

      <div className="space-y-4">

        {notifications?.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center text-gray-500">
            No notifications yet.
          </div>
        )}

        {notifications?.map((notification) => (
          <Link
            key={notification.id}
           href={`/notifications/${notification.id}`}
           
            className={`block rounded-3xl p-5 shadow transition ${
              notification.read
                ? "bg-white"
                : "bg-green-50 border-2 border-green-600"
            }`}
          >
            <h2 className="text-xl font-bold text-black">
              {notification.title}
            </h2>

            <p className="text-gray-600 mt-2">
              {notification.message}
            </p>

            <p className="text-sm text-gray-400 mt-4">
              {new Date(notification.created_at).toLocaleString()}
            </p>
          </Link>
        ))}

      </div>

    </main>
  );
}