"use client";

import { useState } from "react";

type OrdersRealtimeProps = {
  initialOrders: any[];
  restaurantId: number;
};

export default function OrdersRealtime({
  initialOrders,
  restaurantId,
}: OrdersRealtimeProps) {
  const [orders, setOrders] = useState(initialOrders);

  const pending =
    orders.filter((o) => o.status === "pending");

  const preparing =
    orders.filter((o) => o.status === "preparing");

  const ready =
    orders.filter((o) => o.status === "ready");

  return (
    <>
      <OrderSection
        title="🟠 New Orders"
        orders={pending}
      />

      <OrderSection
        title="🔵 Preparing"
        orders={preparing}
      />

      <OrderSection
        title="🟢 Ready"
        orders={ready}
      />
    </>
  );
}

function OrderSection({
  title,
  orders,
}: {
  title: string;
  orders: any[];
}) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-black mb-4">
        {title}
      </h2>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-5 text-gray-500">
          No orders
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <a
              key={order.id}
              href={`/restaurant/orders/${order.id}`}
              className="block bg-white rounded-3xl p-5 shadow"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-bold text-black">
                    {order.customer_name}
                  </h3>

                  <p className="text-gray-500">
                    {order.phone}
                  </p>
                </div>

                <p className="text-green-700 font-black text-xl">
                  ₦{order.total.toLocaleString()}
                </p>
              </div>

              <p className="mt-4 text-gray-600">
                {order.delivery_address}
              </p>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}