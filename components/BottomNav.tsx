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
  <nav className="fixed bottom-3 left-6 right-6 z-50">
  <div className="flex items-center justify-around rounded-full bg-orange-500/80 backdrop-blur-xl px-2 py-1.5 shadow-xl  border border-orange-400/20">

    {/* Home */}
    <Link
      href="/"
      className={`flex flex-col items-center transition-all duration-200 ${
        isActive("/") ? "text-white" : "text-white/70"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
          isActive("/")
            ? "bg-white/20 scale-105"
            : "hover:bg-white/10"
        }`}
      >
        <FontAwesomeIcon
          icon={faHouse}
          className="text-[17px]"
        />
      </div>

      <span className="mt-0.5 text-[10px] font-medium">
        Home
      </span>
    </Link>

    {/* Search */}
    <Link
      href="/search"
      className={`flex flex-col items-center transition-all duration-200 ${
        isActive("/search") ? "text-white" : "text-white/70"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
          isActive("/search")
            ? "bg-white/20 scale-105"
            : "hover:bg-white/10"
        }`}
      >
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="text-[17px]"
        />
      </div>

      <span className="mt-0.5 text-[10px] font-medium">
        Search
      </span>
    </Link>

    {/* Orders */}
    <Link
      href="/orders"
      className={`flex flex-col items-center transition-all duration-200 ${
        isActive("/orders") ? "text-white" : "text-white/70"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
          isActive("/orders")
            ? "bg-white/20 scale-105"
            : "hover:bg-white/10"
        }`}
      >
        <FontAwesomeIcon
          icon={faBox}
          className="text-[17px]"
        />
      </div>

      <span className="mt-0.5 text-[10px] font-medium">
        Orders
      </span>
    </Link>

    {/* Profile */}
    <Link
      href="/account"
      className={`flex flex-col items-center transition-all duration-200 ${
        isActive("/account") ? "text-white" : "text-white/70"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
          isActive("/account")
            ? "bg-white/20 scale-105"
            : "hover:bg-white/10"
        }`}
      >
        <FontAwesomeIcon
          icon={faUser}
          className="text-[17px]"
        />
      </div>

      <span className="mt-0.5 text-[10px] font-medium">
        Me
      </span>
    </Link>

  </div>
</nav>
   </>
  );
}