
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import OrdersRealtime from "./OrdersRealtime";

export default async function RestaurantOrdersPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center p-5">
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center max-w-md w-full">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-gray-500" />
          </div>

          <h1 className="text-2xl font-black text-black">
            Please log in
          </h1>

          <p className="text-gray-500 mt-2">
            You need to be logged in to manage your restaurant orders.
          </p>
        </div>
      </main>
    );
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center p-5">
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center max-w-md w-full">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
            <UtensilsCrossed className="w-7 h-7 text-orange-600" />
          </div>

          <h1 className="text-2xl font-black text-black">
            No restaurant found
          </h1>

          <p className="text-gray-500 mt-2">
            Your account isn't currently connected to a restaurant.
          </p>
        </div>
      </main>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", {
      ascending: false,
    });

  return (
    <main className="min-h-screen bg-[#fff8f0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-orange-600 mb-1">
                Restaurant Dashboard
              </p>

              <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                Orders
              </h1>

              <p className="text-gray-500 mt-2">
                Manage incoming orders and keep your customers updated.
              </p>
            </div>

           
          </div>
        </div>

        {/* Realtime Orders */}
        <OrdersRealtime
          initialOrders={orders ?? []}
          restaurantId={restaurant.id}
        />
      </div>
    </main>
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-black text-black">
            {title}
          </h2>

          <span className="min-w-8 h-8 px-2 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center">
            {orders.length}
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-black/5 p-8 text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
            <Package className="w-6 h-6 text-gray-400" />
          </div>

          <h3 className="font-bold text-black">
            No {title.toLowerCase()}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Orders will appear here when they match this status.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/restaurant/orders/${order.id}`}
              className="group block bg-white rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-5 sm:p-6">

                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Order
                      </span>

                      <span className="text-xs font-mono text-gray-400 truncate max-w-32 sm:max-w-none">
                        #{order.id}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-black truncate">
                      {order.customer_name}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xl sm:text-2xl font-black text-green-700">
                      ₦{order.total.toLocaleString()}
                    </p>

                    <div className="flex items-center justify-end gap-1 mt-1 text-xs text-gray-400">
                      <Clock3 className="w-3.5 h-3.5" />
                      {formatOrderTime(order.created_at)}
                    </div>
                  </div>
                </div>

                {/* Customer information */}
                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />

                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">
                        Phone
                      </p>

                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {order.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />

                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-medium">
                        Delivery address
                      </p>

                      <p className="text-sm font-semibold text-gray-700 line-clamp-2">
                        {order.delivery_address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom action */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">
                    View order details
                  </span>

                  <div className="w-9 h-9 rounded-full bg-gray-50 group-hover:bg-orange-600 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
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
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return orderDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

