"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface Restaurant {
  id: number;
  name: string;
  rating: string;
  delivery: string;
  time: string;
  image: string;
  owner_id: string;
  address: string | null;
  phone: string | null;
  description: string | null;
  is_open: boolean;
}

interface MenuItem {
  id: number;
  restaurant_id: number;
  category_id: number;
  name: string;
  price: number;
  image: string;
}

interface RestaurantWithMenu extends Restaurant {
  menu: MenuItem[];
}

export default function SearchPage() {
  const [search, setSearch] = useState("");

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const suggestions = [
    "Burger",
    "Chicken",
    "Rice",
    "Pizza",
    "Shawarma",
    "Fries",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const [restaurantsRes, menuRes] = await Promise.all([
      supabase
        .from("restaurants")
        .select("*")
        .order("id"),

      supabase
        .from("menu_items")
        .select("*")
        .order("id"),
    ]);

    if (restaurantsRes.error) {
      console.log(restaurantsRes.error);
    }

    if (menuRes.error) {
      console.log(menuRes.error);
    }

    setRestaurants(restaurantsRes.data || []);
    setMenuItems(menuRes.data || []);

    setLoading(false);
  }

  const mergedRestaurants: RestaurantWithMenu[] = useMemo(() => {
    return restaurants.map((restaurant) => ({
      ...restaurant,
      menu: menuItems.filter(
        (item) => item.restaurant_id === restaurant.id
      ),
    }));
  }, [restaurants, menuItems]);

  const results = useMemo(() => {
    if (!search.trim()) return mergedRestaurants;

    return mergedRestaurants.filter((restaurant) => {
      const restaurantMatch = restaurant.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const foodMatch = restaurant.menu.some((food) =>
        food.name
          .toLowerCase()
          .includes(search.toLowerCase())
      );

      return restaurantMatch || foodMatch;
    });
  }, [search, mergedRestaurants]);


    return (
    <main className="min-h-screen bg-[#fff8f0] pb-32">

      {/* Header */}
      <section className="sticky top-0 z-20 bg-[#fff8f0]/90 backdrop-blur-md px-5 pt-6 pb-5">

        <p className="text-sm text-gray-500">
          Discover delicious meals
        </p>

        <h1 className="mt-1 text-4xl font-bold text-gray-900">
          Search
        </h1>

        {/* Search */}
        <div className="relative mt-6">

          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants or meals..."
            className="w-full rounded-2xl bg-white py-4 pl-14 pr-14 text-black shadow-md outline-none ring-1 ring-gray-200 transition focus:ring-2 focus:ring-orange-500"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}

        </div>

        {/* Suggestions */}

        <div className="mt-6">

          <p className="mb-3 text-sm font-semibold text-gray-500">
            Popular Searches
          </p>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">

            {suggestions.map((item) => (

              <button
                key={item}
                onClick={() => setSearch(item)}
                className="whitespace-nowrap rounded-full bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-orange-500 hover:text-white"
              >
                {item}
              </button>

            ))}

          </div>

        </div>

      </section>

      {/* Content */}

      <section className="px-5 pt-5">

        {loading ? (

          <div className="space-y-5">

            {[1,2,3].map((item)=>(
              <div
                key={item}
                className="animate-pulse rounded-3xl bg-white p-4 shadow"
              >

                <div className="h-44 rounded-2xl bg-gray-200"/>

                <div className="mt-4 h-6 w-1/2 rounded bg-gray-200"/>

                <div className="mt-3 h-4 w-2/3 rounded bg-gray-200"/>

                <div className="mt-4 flex gap-2">

                  <div className="h-7 w-20 rounded-full bg-gray-200"/>

                  <div className="h-7 w-20 rounded-full bg-gray-200"/>

                </div>

              </div>
            ))}

          </div>

        ) : results.length === 0 ? (

          <div className="py-20 text-center">

            <div className="text-7xl">
              🔍
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              No results found
            </h2>

            <p className="mt-3 text-gray-500">
              Try searching for burgers, rice, pizza or chicken.
            </p>

          </div>

        ) : (

          <div className="space-y-6">

            {results.map((restaurant)=>(

              <Link

                key={restaurant.id}

                href={`/restaurants/${restaurant.id}`}

                className="group block overflow-hidden rounded-3xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"

              >

                <img

                  src={restaurant.image}

                  alt={restaurant.name}

                  className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"

                />

                <div className="p-5">

                  <div className="flex items-start justify-between">

                    <div>

                      <h2 className="text-2xl font-bold text-gray-900">

                        {restaurant.name}

                      </h2>

                      <p className="mt-2 text-sm text-gray-500">

                        {restaurant.address || "Owerri"}

                      </p>

                    </div>

                    <div className="rounded-2xl bg-orange-100 px-3 py-2 text-sm font-semibold text-orange-600">

                        ⭐ {restaurant.rating}

                    </div>

                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">

                    {restaurant.menu.slice(0,4).map((food)=>(

                      <span

                        key={food.id}

                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"

                      >

                        {food.name}

                      </span>

                    ))}

                  </div>

                  <div className="mt-6 flex items-center justify-between">

                    <div className="flex gap-3">

                      <span className="rounded-full bg-green-100 px-3 py-2 text-xs font-semibold text-green-700">

                        🚚 {restaurant.delivery}

                      </span>

                      <span className="rounded-full bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700">

                        ⏱ {restaurant.time}

                      </span>

                    </div>

                    <span
                      className={`rounded-full px-3 py-2 text-xs font-semibold ${
                        restaurant.is_open
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {restaurant.is_open ? "Open" : "Closed"}
                    </span>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>

      <BottomNav />

    </main>
  );
}