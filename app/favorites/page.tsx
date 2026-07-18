"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import RestaurantCard from "@/components/RestaurantCard";

export default function FavoritesPage() {
  const { user } = useAuth();

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchFavorites();
  }, [user]);

  async function fetchFavorites() {
    const { data, error } = await supabase
  .from("restaurant_favorites")
  .select(`
    restaurant:restaurants (
      id,
      name,
      image,
      rating,
      time,
      delivery,
      is_open
    )
  `)
  .eq("user_id", user!.id);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const favoriteRestaurants =
  data?.map((item: any) => item.restaurant) ?? [];

    setRestaurants(favoriteRestaurants);
    setLoading(false);
    console.log(data);
console.log(error);
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  if (!restaurants.length) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            No favorite restaurants yet ❤️
          </h2>

          <p className="mt-2 text-gray-500">
            Tap the heart on a restaurant to save it here.
          </p>
        </div>
      </div>
    );
  }

  return (
   <main className="min-h-screen bg-[#fff8f0] p-5">
      <h1 className="mb-6 text-3xl text-black font-black">
        Favorites
      </h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {restaurants.map((restaurant) => (
          <RestaurantCard
  key={restaurant.id}
  restaurant={restaurant}
  onUnfavorite={() => {
    setRestaurants((prev) =>
      prev.filter((r) => r.id !== restaurant.id)
    );
  }}
/>
        ))}
      </div>
    </main>
  );
}