
"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  MapPin,
  PackageOpen,
  Phone,
} from "lucide-react";
import { useState } from "react";

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  delivery_address: string;
  total: number;
  status: string;
  created_at: string;
};

type OrdersRealtimeProps = {
  initialOrders: Order[];
  restaurantId: number;
};

export default function OrdersRealtime({
  initialOrders,
  restaurantId,
}: OrdersRealtimeProps) {
  const [orders] = useState<Order[]>(initialOrders);

  const pending = orders.filter(
    (order) => order.status === "pending"
  );

  const preparing = orders.filter(
    (order) => order.status === "preparing"
  );

  const ready = orders.filter(
    (order) => order.status === "ready"
  );

  return (
    <>
      {/* QUICK NAVIGATION */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#fff8f0]/95 backdrop-blur-md border-b border-black/5">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-black/5 flex gap-1 overflow-x-auto">

            <QuickNavItem
              href="#new-orders"
              label="New Orders"
              count={pending.length}
              type="pending"
            />

            <QuickNavItem
              href="#preparing"
              label="Preparing"
              count={preparing.length}
              type="preparing"
            />

            <QuickNavItem
              href="#ready"
              label="Ready"
              count={ready.length}
              type="ready"
            />

          </div>
        </div>
      </div>

      {/* ORDER SECTIONS */}
      <div className="mt-8 space-y-10">

        <div id="new-orders" className="scroll-mt-24">
          <OrderSection
            title="New Orders"
            subtitle="Orders waiting for your restaurant"
            orders={pending}
            status="pending"
          />
        </div>

        <div id="preparing" className="scroll-mt-24">
          <OrderSection
            title="Preparing"
            subtitle="Orders currently being prepared"
            orders={preparing}
            status="preparing"
          />
        </div>

        <div id="ready" className="scroll-mt-24">
          <OrderSection
            title="Ready"
            subtitle="Orders ready for pickup or delivery"
            orders={ready}
            status="ready"
          />
        </div>

      </div>
    </>
  );
}

function QuickNavItem({
  href,
  label,
  count,
  type,
}: {
  href: string;
  label: string;
  count: number;
  type: "pending" | "preparing" | "ready";
}) {
  const styles = {
    pending: {
      dot: "bg-orange-500",
      active: "hover:bg-orange-50 hover:text-orange-700",
      count: "bg-orange-100 text-orange-700",
    },
    preparing: {
      dot: "bg-blue-500",
      active: "hover:bg-blue-50 hover:text-blue-700",
      count: "bg-blue-100 text-blue-700",
    },
    ready: {
      dot: "bg-green-500",
      active: "hover:bg-green-50 hover:text-green-700",
      count: "bg-green-100 text-green-700",
    },
  };

  const style = styles[type];

  return (
    <a
      href={href}
      className={`flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 transition-colors ${style.active}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${style.dot}`}
      />

      <span>{label}</span>

      <span
        className={`min-w-6 h-6 px-1.5 rounded-full flex items-center justify-center text-xs font-black ${style.count}`}
      >
        {count}
      </span>
    </a>
  );
}

function OrderSection({
  title,
  subtitle,
  orders,
  status,
}: {
  title: string;
  subtitle: string;
  orders: Order[];
  status: "pending" | "preparing" | "ready";
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-black">
              {title}
            </h2>

            <span
              className={`min-w-8 h-8 px-2 rounded-full flex items-center justify-center text-sm font-black ${
                status === "pending"
                  ? "bg-orange-100 text-orange-700"
                  : status === "preparing"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {orders.length}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-black/5 rounded-3xl p-8 sm:p-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
            <PackageOpen className="w-7 h-7 text-gray-400" />
          </div>

          <h3 className="mt-4 font-bold text-black">
            No {title.toLowerCase()}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Orders will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              status={status}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function OrderCard({
  order,
  status,
}: {
  order: Order;
  status: "pending" | "preparing" | "ready";
}) {
  return (
    <Link
      href={`/restaurant/orders/${order.id}`}
      className="group block bg-white rounded-3xl border border-black/5 shadow-sm hover:shadow-lg hover:-translate-y-[1px] transition-all duration-200 overflow-hidden"
    >
      <div className="p-5 sm:p-6">

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={status} />

              <span className="text-xs text-gray-400 font-mono truncate max-w-28 sm:max-w-none">
                #{order.id}
              </span>
            </div>

            <h3 className="text-xl font-black text-black truncate">
              {order.customer_name}
            </h3>

            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
              <Clock3 className="w-3.5 h-3.5" />
              {formatOrderTime(order.created_at)}
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xl sm:text-2xl font-black text-green-700">
              ₦{order.total.toLocaleString()}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Order total
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-5">

          <div className="rounded-2xl bg-gray-50 p-3.5 flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-gray-500" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium">
                Customer phone
              </p>

              <p className="text-sm font-semibold text-gray-700 truncate mt-0.5">
                {order.phone}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-3.5 flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-gray-500" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium">
                Delivery address
              </p>

              <p className="text-sm font-semibold text-gray-700 line-clamp-2 mt-0.5">
                {order.delivery_address}
              </p>
            </div>
          </div>

        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-500 group-hover:text-black transition-colors">
            View order details
          </span>

          <div className="w-9 h-9 rounded-full bg-gray-50 group-hover:bg-black flex items-center justify-center transition-all">
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          </div>
        </div>

      </div>
    </Link>
  );
}

function StatusBadge({
  status,
}: {
  status: "pending" | "preparing" | "ready";
}) {
  const config = {
    pending: {
      label: "New",
      className: "bg-orange-100 text-orange-700",
    },
    preparing: {
      label: "Preparing",
      className: "bg-blue-100 text-blue-700",
    },
    ready: {
      label: "Ready",
      className: "bg-green-100 text-green-700",
    },
  };

  const current = config[status];

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wide ${current.className}`}
    >
      {current.label}
    </span>
  );
}

function formatOrderTime(date: string) {
  const orderDate = new Date(date);
  const now = new Date();

  const diff = now.getTime() - orderDate.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days < 7) return `${days} days ago`;

  return orderDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

