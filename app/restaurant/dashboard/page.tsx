
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Clock3,
  Edit3,
  Menu,
  ShoppingBag,
  Star,
  Utensils,
  Wallet,
} from "lucide-react";

export default async function RestaurantDashboard() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-black">
            Please login.
          </h1>
          <p className="text-gray-500 mt-2">
            You need to be logged in to access your restaurant dashboard.
          </p>
        </div>
      </main>
    );
  }

  console.log("Dashboard user:", user.id);
  console.log("Dashboard error:", error);

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 text-center shadow-sm border border-black/5">

          <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
            <Utensils className="w-8 h-8 text-orange-500" />
          </div>

          <h1 className="text-3xl font-black text-black mt-6">
            No Restaurant Found
          </h1>

          <p className="text-gray-500 mt-3 leading-relaxed">
            You haven't registered a restaurant yet. Create your restaurant
            profile to start receiving orders on Bitevy.
          </p>

          <Link
            href="/signup/restaurantsignup"
            className="mt-7 inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition"
          >
            Register Restaurant
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>
      </main>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("status, created_at, restaurant_amount")
    .eq("restaurant_id", restaurant.id);

  const pendingOrders =
    orders?.filter(
      (order) => order.status === "pending"
    ).length ?? 0;

  const preparingOrders =
    orders?.filter(
      (order) => order.status === "preparing"
    ).length ?? 0;

  const readyOrders =
    orders?.filter(
      (order) => order.status === "ready"
    ).length ?? 0;

  const today = new Date().toISOString().split("T")[0];

  const revenueToday =
    orders
      ?.filter(
        (order) =>
          order.status === "completed" &&
          order.created_at.startsWith(today)
      )
      .reduce(
        (sum, order) =>
          sum + (order.restaurant_amount ?? 0),
        0
      ) ?? 0;

  const totalOrders = orders?.length ?? 0;

  return (
    <main className="min-h-screen bg-[#fff8f0] text-black">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/5">
        <div className="max-w-6xl mx-auto h-16 px-5 flex items-center justify-between">

          <Link
            href="/account"
            className="flex items-center gap-2 text-gray-600 hover:text-black transition"
          >
            <div className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition">
              <ArrowLeft className="w-5 h-5" />
            </div>

           
          </Link>

          <h1 className="text-lg sm:text-xl font-black">
            Restaurant Dashboard
          </h1>

          <div className="w-9 sm:w-[75px]" />

        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-5 py-7 sm:py-10">

        {/* RESTAURANT HERO */}
        <section className="relative overflow-hidden rounded-[2rem] bg-black shadow-xl">

          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          />

        <div className="absolute inset-0 bg-black/60" />

          <div className="relative min-h-[300px] sm:min-h-[340px] p-6 sm:p-9 flex flex-col justify-end">

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-full text-xs font-bold mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Restaurant Active
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {restaurant.name}
              </h2>

              <p className="text-white/70 mt-2 max-w-lg">
                Manage your restaurant, keep track of orders, and serve your
                customers better.
              </p>

              {/* RESTAURANT INFO */}
              <div className="flex flex-wrap gap-3 mt-6">

                <InfoPill
                  icon={<Star className="w-4 h-4" />}
                  text={`${restaurant.rating ?? "—"} rating`}
                />

                <InfoPill
                  icon={<Clock3 className="w-4 h-4" />}
                  text={restaurant.time ?? "Delivery time unavailable"}
                />

                <InfoPill
                  icon={<Bike className="w-4 h-4" />}
                  text={restaurant.delivery ?? "Delivery unavailable"}
                />

              </div>

            </div>

          </div>

        </section>

        {/* OVERVIEW */}
        <section className="mt-8">

          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-orange-600 uppercase tracking-wider">
                Overview
              </p>

              <h2 className="text-2xl sm:text-3xl font-black mt-1">
                Today's performance
              </h2>
            </div>

            <p className="hidden sm:block text-sm text-gray-400">
              {totalOrders} total orders
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

            <StatCard
              label="New Orders"
              value={pendingOrders}
              icon={<ShoppingBag className="w-5 h-5" />}
              iconClass="bg-orange-50 text-orange-600"
              valueClass="text-orange-600"
            />

            <StatCard
              label="Preparing"
              value={preparingOrders}
              icon={<Utensils className="w-5 h-5" />}
              iconClass="bg-blue-50 text-blue-600"
              valueClass="text-blue-600"
            />

            <StatCard
              label="Ready"
              value={readyOrders}
              icon={<Bike className="w-5 h-5" />}
              iconClass="bg-green-50 text-green-600"
              valueClass="text-green-600"
            />

            <StatCard
              label="Revenue Today"
              value={`₦${revenueToday.toLocaleString()}`}
              icon={<Wallet className="w-5 h-5" />}
              iconClass="bg-purple-50 text-purple-600"
              valueClass="text-black"
            />

          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-10">

          <div className="mb-4">
            <p className="text-sm font-bold text-orange-600 uppercase tracking-wider">
              Manage
            </p>

            <h2 className="text-2xl sm:text-3xl font-black mt-1">
              Quick Actions
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Everything you need to manage your restaurant.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">

            <ActionCard
              href="/restaurant/orders"
              icon={<ShoppingBag className="w-6 h-6" />}
              title="View Orders"
              description="Manage incoming and active orders."
              className="bg-black text-white"
              iconClass="bg-white/10 text-white"
              descriptionClass="text-white/60"
            />

            <ActionCard
              href="/restaurant/menu"
              icon={<Menu className="w-6 h-6" />}
              title="Manage Menu"
              description="Add, edit or remove menu items."
              className="bg-white text-black border border-black/5"
              iconClass="bg-orange-50 text-orange-600"
              descriptionClass="text-gray-500"
            />

            <ActionCard
              href="/restaurant/profile"
              icon={<Edit3 className="w-6 h-6" />}
              title="Edit Restaurant"
              description="Update your restaurant information."
              className="bg-white text-black border border-black/5"
              iconClass="bg-gray-100 text-gray-700"
              descriptionClass="text-gray-500"
            />

          </div>

        </section>

        {/* ORDER CTA */}
        <section className="mt-10">

          <Link
            href="/restaurant/orders"
            className="group block bg-orange-500 hover:bg-orange-600 rounded-3xl p-6 sm:p-7 transition-all duration-200 shadow-sm hover:shadow-lg"
          >

            <div className="flex items-center justify-between gap-5">

              <div>

                <div className="flex items-center gap-2 text-white/80 text-sm font-bold">
                  <ShoppingBag className="w-4 h-4" />
                  Orders
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {pendingOrders > 0
                    ? `${pendingOrders} new ${
                        pendingOrders === 1 ? "order" : "orders"
                      } waiting`
                    : "You're all caught up"}
                </h3>

                <p className="text-white/70 text-sm mt-1">
                  Tap to open your order management page.
                </p>

              </div>

              <div className="shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:translate-x-1 transition-transform">

                <ArrowRight className="w-5 h-5 text-orange-500" />

              </div>

            </div>

          </Link>

        </section>

      </div>

    </main>
  );
}

/* ------------------------------------------------ */
/* INFO PILL */
/* ------------------------------------------------ */

function InfoPill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-2 text-sm text-white">
      {icon}
      <span className="font-semibold">
        {text}
      </span>
    </div>
  );
}

/* ------------------------------------------------ */
/* STAT CARD */
/* ------------------------------------------------ */

function StatCard({
  label,
  value,
  icon,
  iconClass,
  valueClass,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconClass: string;
  valueClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-black/5 shadow-sm">

      <div className="flex items-start justify-between gap-2">

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>

      </div>

      <p className="text-xs sm:text-sm font-semibold text-gray-400 mt-5">
        {label}
      </p>

      <p
        className={`text-2xl sm:text-3xl font-black mt-1 truncate ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}

/* ------------------------------------------------ */
/* ACTION CARD */
/* ------------------------------------------------ */

function ActionCard({
  href,
  icon,
  title,
  description,
  className,
  iconClass,
  descriptionClass,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  className: string;
  iconClass: string;
  descriptionClass: string;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-3xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${className}`}
    >

      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconClass}`}
      >
        {icon}
      </div>

      <div className="flex items-end justify-between gap-4 mt-7">

        <div>

          <h3 className="text-xl font-black">
            {title}
          </h3>

          <p className={`text-sm mt-1 ${descriptionClass}`}>
            {description}
          </p>

        </div>

        <div className="w-9 h-9 rounded-full border border-current/10 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">

          <ArrowRight className="w-4 h-4" />

        </div>

      </div>

    </Link>
  );
}

