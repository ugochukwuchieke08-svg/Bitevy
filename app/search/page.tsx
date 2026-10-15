
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
    async function fetchData() {
      setLoading(true);

      try {
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
          console.error("Error fetching restaurants:", restaurantsRes.error);
        }

        if (menuRes.error) {
          console.error("Error fetching menu items:", menuRes.error);
        }

        setRestaurants(restaurantsRes.data || []);
        setMenuItems(menuRes.data || []);
      } catch (error) {
        console.error("Error loading search data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const mergedRestaurants: RestaurantWithMenu[] = useMemo(() => {
    return restaurants.map((restaurant) => ({
      ...restaurant,
      menu: menuItems.filter(
        (item) => item.restaurant_id === restaurant.id
      ),
    }));
  }, [restaurants, menuItems]);

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return mergedRestaurants;

    return mergedRestaurants.filter((restaurant) => {
      const restaurantMatch = restaurant.name
        .toLowerCase()
        .includes(query);

      const foodMatch = restaurant.menu.some((food) =>
        food.name.toLowerCase().includes(query)
      );

      return restaurantMatch || foodMatch;
    });
  }, [search, mergedRestaurants]);

  return (
    <main className="min-h-screen bg-[#fff8f0] pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-orange-100/70 bg-[#fff8f0]/95 px-4 py-5 backdrop-blur-md sm:px-6 md:static md:px-8 md:py-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-medium text-gray-500 sm:text-base">
            Discover delicious meals
          </p>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Search
          </h1>

          {/* Search input */}
          <div className="relative mt-5 max-w-3xl md:mt-7">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 sm:left-5"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants or meals..."
              aria-label="Search restaurants or meals"
              className="w-full rounded-2xl border border-gray-100 bg-white py-3.5 pl-11 pr-12 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 sm:py-4 sm:pl-14 sm:text-base"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-orange-50 hover:text-orange-500 sm:right-5"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Popular searches */}
        <section className="pt-5 sm:pt-7">
          <p className="mb-3 text-sm font-semibold text-gray-500">
            Popular Searches
          </p>

          <div className="flex gap-2.5 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSearch(item)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  search.toLowerCase() === item.toLowerCase()
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-orange-500 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Results heading */}
        <section className="mt-7 sm:mt-9">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {search.trim() ? "Search Results" : "Restaurants"}
            </h2>

            {!loading && (
              <span className="shrink-0 text-sm text-gray-500">
                {results.length}{" "}
                {results.length === 1 ? "restaurant" : "restaurants"}
              </span>
            )}
          </div>

          {/* Loading skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-3xl bg-white p-3 shadow-sm"
                >
                  <div className="h-48 rounded-2xl bg-gray-200 sm:h-44 lg:h-48" />

                  <div className="mt-4 h-5 w-2/3 rounded bg-gray-200" />

                  <div className="mt-3 h-4 w-1/2 rounded bg-gray-200" />

                  <div className="mt-5 flex gap-2">
                    <div className="h-7 w-20 rounded-full bg-gray-200" />
                    <div className="h-7 w-20 rounded-full bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            /* Empty state */
            <div className="rounded-3xl bg-white px-5 py-16 text-center shadow-sm sm:py-20">
              <div className="text-6xl sm:text-7xl">🔍</div>

              <h2 className="mt-5 text-xl font-bold text-gray-900 sm:text-2xl">
                No results found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                We couldn't find a restaurant or meal matching your search.
                Try burgers, rice, pizza, chicken, or shawarma.
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-6 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            /* Responsive restaurant grid */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
              {results.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${restaurant.id}`}
                  className="group min-w-0 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:shadow-lg sm:hover:-translate-y-1"
                >
                  {/* Restaurant image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={restaurant.image || "/images/placeholder.png"}
                      alt={restaurant.name}
                      loading="lazy"
                      className="h-48 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-44 lg:h-48"
                    />

                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        restaurant.is_open
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {restaurant.is_open ? "Open" : "Closed"}
                    </span>
                  </div>

                  {/* Restaurant details */}
                  <div className="p-4 sm:p-5">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-lg font-bold text-gray-900 sm:text-xl">
                          {restaurant.name}
                        </h3>

                        <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
                          {restaurant.address || "Owerri"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-xl bg-orange-100 px-2.5 py-2 text-sm font-semibold text-orange-600">
                        ⭐ {restaurant.rating || "New"}
                      </span>
                    </div>

                    {/* Menu previews */}
                    {restaurant.menu.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {restaurant.menu.slice(0, 4).map((food) => (
                          <span
                            key={food.id}
                            className="max-w-full truncate rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700"
                          >
                            {food.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Delivery details */}
                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                      <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                        🚚 {restaurant.delivery}
                      </span>

                      <span className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                        ⏱ {restaurant.time}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      
{/* Bottom navigation */}
<div className="shrink-0">
  <BottomNav />
</div>


    </main>
  );
}

