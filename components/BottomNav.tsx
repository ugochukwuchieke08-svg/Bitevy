"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faMagnifyingGlass,
  faBox,
  faBell,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import NotificationBanner from "./NotificationBanner";

export default function BottomNav() {

const [banner, setBanner] = useState<{
  title: string;
  message: string;
} | null>(null);
  const { user } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  if (!user) return;

  const userId = user.id;

  async function loadUnread() {
    const { count } = await supabase
      .from("notifications")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .eq("read", false);

    setUnreadCount(count || 0);
  }

  loadUnread();

  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
     async (payload) => {
      loadUnread();

      const notification = payload.new as any;

      setBanner({
        title: notification.title,
        message: notification.message,
      });

      setTimeout(() => {
        setBanner(null);
      }, 4000);
    }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);

  return (
     
   <>
  {banner && (
    <NotificationBanner
      title={banner.title}
      message={banner.message}
    />
  )}
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-around py-3">

      <Link
        href="/"
        className="flex flex-col items-center text-green-700"
      >
        <FontAwesomeIcon icon={faHouse} />
        <span className="text-[8px] mt-1">
          Home
        </span>
      </Link>


      <Link
        href="/search"
        className="flex flex-col items-center text-black"
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        <span className="text-[8px] mt-1">
          Search
        </span>
      </Link>


      <Link
        href="/orders"
        className="flex flex-col items-center text-black"
      >
        <FontAwesomeIcon icon={faBox} />
        <span className="text-[8px] mt-1">
          Orders
        </span>
      </Link>
      
      <Link
        href="/notifications"
        className="relative flex flex-col items-center text-black"
      >
        <FontAwesomeIcon icon={faBell} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}

        <span className="text-[8px] mt-1">
          Notifications
        </span>
      </Link>

      <Link href="/account" className="flex flex-col items-center text-black">
        <FontAwesomeIcon icon={faUser} />
        <span className="text-[8px] mt-1">
          Profile
        </span>
      </Link>


    </nav>
   </>
  );
}