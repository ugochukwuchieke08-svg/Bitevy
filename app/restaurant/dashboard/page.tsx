import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { Star, Clock3, Bike } from "lucide-react";

export default async function RestaurantDashboard() {
  const supabase = await createServerSupabaseClient();
const {
  data: { user },
  error,
} = await supabase.auth.getUser();

if (!user) {
  return <h1>Please login.</h1>;
}

console.log("Dashboard user:", user?.id);
console.log("Dashboard error:", error);




const { data: restaurant } = await supabase
  .from("restaurants")
  .select("*")
  .eq("owner_id", user.id)
  .single();

if (!restaurant) {
  return (
    <main className="min-h-screen bg-[#fff8f0] flex flex-col items-center justify-center px-6">

      <h1 className="text-3xl font-bold text-black">
        No Restaurant Found
      </h1>

      <p className="text-gray-500 mt-3 text-center">
        You haven't registered a restaurant yet.
      </p>

      <Link
        href="/signup/restaurantsignup"
        className="mt-8 bg-green-700 text-white px-6 py-3 rounded-full font-semibold"
      >
        Register Restaurant
      </Link>

    </main>
  );
}

// Only runs if restaurant exists
const { data: orders } = await supabase
  .from("orders")
  .select("status, created_at, restaurant_amount")
  .eq("restaurant_id", restaurant.id);

const pendingOrders =
  orders?.filter(order => order.status === "pending").length ?? 0;

const today = new Date().toISOString().split("T")[0];

const revenueToday =
  orders
    ?.filter(
      order =>
        order.status === "completed" &&
        order.created_at.startsWith(today)
    )
    .reduce(
      (sum, order) => sum + (order.restaurant_amount ?? 0),
      0
    ) ?? 0;
  return (
    <main className="min-h-screen bg-[#fff8f0]">

     

<header className="sticky top-0 z-50 bg-white border-b border-gray-200">
  <div className="relative flex items-center justify-center h-16 px-5">

    {/* Back Button */}
    <Link
      href="/account" // Change this to wherever you want to go back
      className="absolute left-5 flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition"
    >
      <ArrowLeft className="w-6 h-6 text-black" />
    </Link>

    {/* Title */}
    <h1 className="text-xl font-bold text-black">
      Restaurant Dashboard
    </h1>

  </div>
</header>

      <section className="p-5">

        <div className="bg-white rounded-3xl overflow-hidden text-black shadow">

          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-52 object-cover"
          />

          <div className="p-5">

            <h2 className="text-2xl font-bold">
              {restaurant.name}
            </h2>

            <div className="flex flex-wrap items-center gap-6 mt-4 text-gray-600">

  <div className="flex items-center gap-2">
    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
    <span>{restaurant.rating}</span>
  </div>

  <div className="flex items-center gap-2">
    <Clock3 className="w-5 h-5 text-blue-500" />
    <span>{restaurant.time}</span>
  </div>

  <div className="flex items-center gap-2">
    <Bike className="w-5 h-5 text-green-600" />
    <span>{restaurant.delivery}</span>
  </div>

</div>

          </div>

        </div>

      </section>

      <section className="px-5 grid grid-cols-2 gap-4">

  <div className="bg-white rounded-2xl p-5 shadow">

    <h3 className="text-gray-500 text-sm">
      Pending Orders
    </h3>

    <p className="text-4xl font-black text-black mt-2">
      {pendingOrders}
    </p>

  </div>

  <div className="bg-white rounded-2xl p-5 shadow">

    <h3 className="text-gray-500 text-sm">
      Revenue Today
    </h3>

    <p className="text-3xl font-black text-black mt-2">
      ₦{revenueToday.toLocaleString()}
    </p>

  </div>

</section>

      <section className="p-5">

        <div className="bg-white rounded-3xl p-5 shadow">

          <h2 className="text-xl  text-black font-bold">
            Quick Actions
          </h2>

          <div className="grid gap-4 mt-5">

            <Link
              href="/restaurant/menu"
              className="bg-orange-500 text-white rounded-xl py-4 text-center font-semibold"
            >
              Manage Menu
            </Link>

            <Link
              href="/restaurant/orders"
              className="bg-green-700 text-white rounded-xl py-4 text-center font-semibold"
            >
              View Orders
            </Link>

            <Link
              href="/restaurant/profile"
              className="bg-black text-white rounded-xl py-4 text-center font-semibold"
            >
              Edit Restaurant
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}