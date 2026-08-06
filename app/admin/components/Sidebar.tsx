"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Bike,
} from "lucide-react";

const links = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: Package,
  },
  {
    name: "Riders",
    href: "/admin/riders",
    icon: Bike,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="border-b border-slate-100 px-8 py-7">
        <h1 className="text-3xl font-black tracking-tight">
          Bitevy
          <span className="text-orange-500">.</span>
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Admin Dashboard
        </p>
      </div>

      
    </aside>
  );
}