"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

type MenuItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  description?: string;
  restaurant_id: string;
};

type Restaurant = {
  id: string;
  name: string;
};

export default function RestaurantMenu({
  menuItems,
  restaurant,
}: {
  menuItems: MenuItem[];
  restaurant: Restaurant;
}) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, menuItems]);

  return (
    <>
      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for food..."
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-black shadow-sm outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <h2 className="text-2xl font-bold text-black mb-5">
        Popular Items
      </h2>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">
            No food found.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-lg transition"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-44 object-cover"
            />

            <div className="p-5">
              <h3 className="font-bold text-lg text-black">
                {item.name}
              </h3>

              {item.description && (
                <p className="text-gray-500 mt-2">
                  {item.description}
                </p>
              )}

              <p className="text-2xl font-bold text-orange-600 mt-3">
                ₦{item.price}
              </p>

              <div className="mt-4">
                <AddToCartButton
                  food={{
                    ...item,
                    restaurant_id: restaurant.id,
                    restaurants: {
                      name: restaurant.name,
                    },
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}