"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";
import {
  faHouse,
  faMagnifyingGlass,
  faBox,
  faBell,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import NotificationBanner from "./NotificationBanner";

export default function BottomNav() {

const pathname = usePathname();
const isActive = (path: string) => pathname === path;

const [banner, setBanner] = useState<{
  title: string;
  message: string;
} | null>(null);
  

  return (
     
   <>
  {banner && (
    <NotificationBanner
      title={banner.title}
      message={banner.message}
    />
  )}
   <nav className="fixed bottom-5 left-4 right-4 z-50">
  <div className="flex justify-around items-center rounded-3xl bg-orange-500/80 backdrop-blur-xl px-2 py-3 shadow-2xl">

    {/* Home */}
    <Link
  href="/"
  className={`flex flex-col items-center transition ${
    isActive("/") ? "text-white" : "text-white/70"
  }`}
>
  <div
    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
      isActive("/")
        ? "bg-white/20"
        : "hover:bg-white/10"
    }`}
  >
    <FontAwesomeIcon icon={faHouse} />
  </div>

  <span className="mt-1 text-[11px] font-medium">
    Home
  </span>
</Link>

    {/* Search */}
   <Link
  href="/search"
  className={`flex flex-col items-center transition ${
    isActive("/search") ? "text-white" : "text-white/70"
  }`}
>
  <div
    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
      isActive("/search")
        ? "bg-white/20"
        : "hover:bg-white/10"
    }`}
  >
    <FontAwesomeIcon icon={faMagnifyingGlass} />
  </div>

  <span className="mt-1 text-[11px] font-medium">
    Search
  </span>
</Link>

    {/* Orders */}
    <Link
  href="/orders"
  className={`flex flex-col items-center transition ${
    isActive("/orders") ? "text-white" : "text-white/70"
  }`}
>
  <div
    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
      isActive("/orders")
        ? "bg-white/20"
        : "hover:bg-white/10"
    }`}
  >
    <FontAwesomeIcon icon={faBox} />
  </div>

  <span className="mt-1 text-[11px] font-medium">
    Orders
  </span>
</Link>

    {/* Profile */}
    <Link
  href="/account"
  className={`flex flex-col items-center transition ${
    isActive("/account") ? "text-white" : "text-white/70"
  }`}
>
  <div
    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
      isActive("/account")
        ? "bg-white/20"
        : "hover:bg-white/10"
    }`}
  >
    <FontAwesomeIcon icon={faUser} />
  </div>

  <span className="mt-1 text-[11px] font-medium">
    Me
  </span>
</Link>

  </div>
</nav>
   </>
  );
}