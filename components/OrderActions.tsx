"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OrderActions({
  orderId,
  status,
  userId,
}: {
  orderId: string;
  status: string;
  userId: string;
}) {
  const router = useRouter();
 const [updating, setUpdating] = useState<string | null>(null);
  async function updateStatus(newStatus: string) {
  if (updating) return;

  setUpdating(newStatus);

  try {
    const response = await fetch("/api/orders/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        status: newStatus,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Failed to update order.");
      return;
    }

    let title = "";
    let message = "";

    if (newStatus === "preparing") {
      title = "Order Accepted";
      message = "Your order has been accepted and is being prepared.";
    }

    if (newStatus === "ready") {
      title = "Order Ready";
      message = "Your order is ready for pickup.";
    }

    if (newStatus === "cancelled") {
      title = "Order Cancelled";
      message = "Unfortunately your order was cancelled.";
    }

    if (title) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          order_id: orderId,
          title,
          message,
          link: `/orders/${orderId}`,
        });

      if (notificationError) {
        console.error(
          "Notification insert failed:",
          notificationError
        );
      }
    }

    router.refresh();
  } catch (error) {
    console.error("Order status update failed:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    setUpdating(null);
  }
}

  return (
    <div className="mt-8 space-y-4">
      {status === "pending" && (
  <>
    <button
      onClick={() => updateStatus("preparing")}
      disabled={updating !== null}
      className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {updating === "preparing"
        ? "Accepting Order..."
        : "Accept Order"}
    </button>

    <button
      onClick={() => updateStatus("cancelled")}
      disabled={updating !== null}
      className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {updating === "cancelled"
        ? "Rejecting Order..."
        : "Reject Order"}
    </button>
  </>
)}

      {status === "preparing" && (
  <button
    onClick={() => updateStatus("ready")}
    disabled={updating !== null}
    className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
  >
    {updating === "ready"
      ? "Updating Order..."
      : "Mark Ready For Pickup"}
  </button>
)}

      {status === "ready" && (
        <div className="bg-green-100 text-green-700 rounded-2xl py-4 text-center font-bold">
          Waiting for Rider
        </div>
      )}
    </div>
  );
}