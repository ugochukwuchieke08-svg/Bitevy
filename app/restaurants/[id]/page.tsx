import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateRoadDistance } from "@/lib/location/roadDistance";

import AddToCartButton from "@/components/AddToCartButton";
import RestaurantHeader from "@/components/RestaurantHeader";
import Link from "next/link";
import RestaurantMenu from "@/components/RestaurantMenu";

import {
  ArrowLeft,
  Search,
  Star,
  Bike,
  Clock3,
  Store,
  MapPin,
} from "lucide-react";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createServerSupabaseClient();

  const { id } = await params;

  // 1. Get restaurant FIRST
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  // 2. Stop if restaurant doesn't exist
  if (!restaurant) {
    return <div>Restaurant not found</div>;
  }

  // 3. Get menu
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", id);

  // 4. Get logged-in customer
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customerLocation = null;

  // 5. Get customer's saved location
  if (user) {
    const { data } = await supabase
      .from("addresses")
      .select("latitude, longitude, address")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle();

    customerLocation = data;
  }

  // 6. Calculate distance
  let distance: number | null = null;
let durationMinutes: number | null = null;

if (
  customerLocation &&
  restaurant.latitude !== null &&
  restaurant.longitude !== null
) {
  const route = await calculateRoadDistance(
    Number(customerLocation.latitude),
    Number(customerLocation.longitude),
    Number(restaurant.latitude),
    Number(restaurant.longitude)
  );

  if (route) {
    distance = route.distanceKm;
    durationMinutes = route.durationMinutes;
  }
}

  const formattedDistance =
    distance !== null
      ? `${distance.toFixed(1)} km away`
      : null;

  return (
    <main className="min-h-screen bg-[#fff8f0]">
      <RestaurantHeader name={restaurant.name}/>
      <div className="relative pt-20">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-64 object-cover"
        />

       <Link
        href="/"
        className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg hover:scale-105 transition"
      >
        <ArrowLeft className="w-5 h-5 text-black" />
      </Link>
      </div>
       
       {!restaurant.is_open && (
        <div className="bg-red-100 border border-red-300 text-red-700 rounded-2xl p-4 mb-6 text-center font-semibold">
          🚫 This restaurant is currently closed.
        </div>
      )}
      <section className="bg-white rounded-t-3xl -mt-6 relative p-6">

        <h1 className="text-3xl text-black font-bold">
          {restaurant.name}
        </h1>

        <div className="flex flex-wrap gap-5 mt-4 text-gray-600">

          {formattedDistance && (
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            <span>{formattedDistance}</span>
          </div>
        )}

          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span>{restaurant.rating}</span>
          </div>

          <div className="flex items-center gap-2">
            <Bike className="w-5 h-5 text-orange-500" />
            <span>{restaurant.delivery}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock3 className="w-5 h-5 text-blue-500" />
            <span>{restaurant.time}</span>
          </div>

        </div>

            </section>


      <section className="p-5">
      <RestaurantMenu
        menuItems={menuItems ?? []}
        restaurant={{
          id: restaurant.id,
          name: restaurant.name,
        }}
      />
    </section>
        

    </main>
  );
}