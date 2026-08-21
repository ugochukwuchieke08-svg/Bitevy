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
      data?.map((item: any) => item.restaurant).filter(Boolean) ?? [];

    setRestaurants(favoriteRestaurants);
    setLoading(false);
  }

  /*
   * Loading
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#fff8f0] px-4 py-5 pb-28">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6 h-9 w-32 animate-pulse rounded-lg bg-orange-100" />

          <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-2xl bg-orange-100"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  /*
   * Empty state
   */
  if (!restaurants.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff8f0] px-5 pb-28">
        <div className="mx-auto w-full max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
            ❤️
          </div>

          <h2 className="text-xl font-black text-gray-900 sm:text-2xl">
            No favorite restaurants yet
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500 sm:text-base">
            Tap the heart on a restaurant to save it here.
          </p>
        </div>
      </main>
    );
  }

  /*
   * Favorites
   */
  return (
    <main className="min-h-screen bg-[#fff8f0] px-4 py-5 pb-28 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5 sm:mb-7">
          <h1 className="text-2xl font-black tracking-tight text-black sm:text-3xl">
            Favorites
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Restaurants you've saved
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
      </div>
    </main>
  );
}