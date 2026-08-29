
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Power } from "lucide-react";

type Props = {
  restaurantId: number;
  initialIsOpen: boolean;
};

export default function RestaurantOpenToggle({
  restaurantId,
  initialIsOpen,
}: Props) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleToggle() {
    if (isUpdating) return;

    const nextStatus = !isOpen;

    // Optimistic UI
    setIsOpen(nextStatus);
    setIsUpdating(true);

    const { error } = await supabase
      .from("restaurants")
      .update({
        is_open: nextStatus,
      })
      .eq("id", restaurantId);

    if (error) {
      console.error("Restaurant status update failed:", error);

      // Revert UI if database update failed
      setIsOpen(!nextStatus);

      alert("Could not update restaurant status.");
    }

    setIsUpdating(false);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isUpdating}
      aria-pressed={isOpen}
      aria-label={
        isOpen
          ? "Restaurant is open. Click to close."
          : "Restaurant is closed. Click to open."
      }
      className="inline-flex items-center gap-3 rounded-full bg-black/55 backdrop-blur-md border border-white/15 px-3 py-2.5 text-white shadow-lg transition-all hover:bg-black/70 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {/* Status icon */}
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
          isOpen ? "bg-green-500" : "bg-red-500"
        }`}
      >
        <Power className="h-4 w-4 text-white" />
      </div>

      {/* Status text */}
      <div className="text-left min-w-[65px]">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
          Status
        </p>

        <p className="text-sm font-black text-white">
          {isUpdating
            ? "Updating..."
            : isOpen
            ? "Open"
            : "Closed"}
        </p>
      </div>

      {/* Toggle */}
      <div
        className={`relative h-7 w-12 rounded-full p-1 transition-colors duration-200 ${
          isOpen ? "bg-green-500" : "bg-white/20"
        }`}
      >
        <div
          className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            isOpen ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}
