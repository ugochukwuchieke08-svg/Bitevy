import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Order } from "../types";
import OrderStatusBadge from "./OrderStatusBadge";

type Props = {
  orders: Order[];
};

export default function RecentOrders({
  orders,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Recent Orders
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            The latest orders placed on Bitevy.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-orange-600 transition hover:bg-orange-50"
        >
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-bold text-slate-900">
            No orders yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            New customer orders will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-4 p-6 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <p className="truncate font-bold text-slate-900">
                    {order.customer_name}
                  </p>

                  <span className="text-xs font-semibold text-slate-400">
                    #{order.id.slice(0, 8)}
                  </span>
                </div>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {order.restaurants?.[0]?.name ??
                  "Unknown restaurant"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {new Date(
                    order.created_at
                  ).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <OrderStatusBadge
                  status={order.status}
                />

                <p className="whitespace-nowrap font-black text-slate-900">
                  ₦
                  {Number(
                    order.total || 0
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}