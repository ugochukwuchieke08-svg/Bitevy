"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Bike,
  X,
} from "lucide-react";

type Props = {
  onClose: () => void;
};

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

export default function MobileSidebar({
  onClose,
}: Props) {
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
          <div>
            <h1 className="text-2xl text-black font-black tracking-tight text-slate-900">
              Bitevy
              <span className="text-orange-500">.</span>
            </h1>

            <p className="mt-1 text-gray-600 text-xs font-medium text-slate-500">
              Admin Dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 text-gray-600  transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {links.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl text-gray-600  px-4 py-3.5 font-semibold transition ${
                  active
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                <Icon size={20} />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-orange-50 p-4">
            <p className="text-sm text-black  font-bold text-slate-900">
              Bitevy Admin
            </p>

            <p className="mt-1 text-gray-600  text-xs leading-5 text-slate-500">
              Manage orders, riders, and platform operations.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}