"use client";

import { Menu, Bell } from "lucide-react";

type Props = {
  onMenuClick: () => void;
};

export default function Topbar({
  onMenuClick,
}: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-xl p-2 hover:bg-slate-100 text-gray-600 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase text-gray-600 tracking-widest text-slate-400">
              Bitevy
            </p>

            <h1 className="text-xl text-black font-black text-slate-900">
              Admin Dashboard
            </h1>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button className="rounded-xl bg-slate-100 p-2 text-gray-600 hover:bg-slate-200">
            <Bell size={20} />
          </button>

          <div className="hidden text-right sm:block">
            <p className="font-bold text-slate-900 text-black">
              Administrator
            </p>

            <p className="text-sm text-gray-600 text-slate-500">
              Bitevy Control Center
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
            A
          </div>
        </div>
      </div>
    </header>
  );
}