import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function RestaurantDashboard() {
  const supabase = await createServerSupabaseClient();

const {
  data: { user },
  error,
} = await supabase.auth.getUser();

console.log("Dashboard user:", user?.id);
console.log("Dashboard error:", error);


if (!user) {
  return <h1>Please login.</h1>;
}

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
          href="/signup/restaurant-signup"
          className="mt-8 bg-green-700 text-white px-6 py-3 rounded-full font-semibold"
        >
          Register Restaurant
        </Link>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f0]">

      <header className="bg-white shadow-sm p-5">

        <h1 className="text-3xl text-black font-bold">
          Restaurant Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Welcome back 👋
        </p>

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

            <div className="flex gap-5 mt-4 text-gray-600">

              <span>⭐ {restaurant.rating}</span>

              <span>🕒 {restaurant.time}</span>

              <span>🚚 {restaurant.delivery}</span>

            </div>

          </div>

        </div>

      </section>

      <section className="px-5 grid grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl p-5 shadow">
          <h3 className="text-gray-500">
            Pending Orders
          </h3>

          <p className="text-4xl  text-black font-black mt-2">
            0
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow">
          <h3 className="text-gray-500">
            Revenue Today
          </h3>

          <p className="text-3xl text-black font-black mt-2">
            ₦0
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