"use client";

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

  async function updateStatus(newStatus: string) {
  const { error } = await supabase
    .from("orders")
    .update({
      status: newStatus,
    })
    .eq("id", orderId);

  if (error) {
    alert(error.message);
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
  await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      order_id: orderId,
      title,
      message,
      link: `/orders/${orderId}`,
    });
}

  router.refresh();
}


  return (
    <div className="mt-8 space-y-4">

      {status === "pending" && (
        <>
          <button
            onClick={() => updateStatus("preparing")}
            className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold"
          >
            Accept Order
          </button>

          <button
            onClick={() => updateStatus("cancelled")}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold"
          >
            Reject Order
          </button>
        </>
      )}

      {status === "preparing" && (
        <button
          onClick={() => updateStatus("ready")}
          className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold"
        >
          Mark Ready For Pickup
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