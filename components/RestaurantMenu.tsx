"use client";

import { useMemo, useState } from "react";
import { Search, X, Minus, Plus } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import { supabase } from "@/lib/supabase/client";

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

type PortionOption = {
  id: number;
  name: string;
  price: number;
};

export default function RestaurantMenu({
  menuItems,
  restaurant,
}: {
  menuItems: MenuItem[];
  restaurant: Restaurant;
}) {
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [portions, setPortions] = useState<PortionOption[]>([]);
  const [selectedPortion, setSelectedPortion] =
    useState<PortionOption | null>(null);

  const [loadingPortions, setLoadingPortions] = useState(false);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, menuItems]);

  async function openFood(item: MenuItem) {
    setSelectedFood(item);
    setQuantity(1);
    setPortions([]);
    setSelectedPortion(null);
    setLoadingPortions(true);

    try {
      const { data: group, error: groupError } = await supabase
        .from("menu_item_option_groups")
        .select("id, name")
        .eq("menu_item_id", item.id)
        .eq("name", "Portion")
        .maybeSingle();

      if (groupError) {
        console.error("Error loading portion group:", groupError);
        return;
      }

      if (!group) {
        return;
      }

      const { data: options, error: optionsError } = await supabase
        .from("menu_item_options")
        .select("id, name, price")
        .eq("option_group_id", group.id)
        .order("price");

      if (optionsError) {
        console.error("Error loading portion options:", optionsError);
        return;
      }

      const formattedOptions = (options || []).map((option) => ({
        id: option.id,
        name: option.name,
        price: Number(option.price),
      }));

      setPortions(formattedOptions);

      if (formattedOptions.length > 0) {
        setSelectedPortion(formattedOptions[0]);
      }
    } catch (error) {
      console.error("Unexpected portion loading error:", error);
    } finally {
      setLoadingPortions(false);
    }
  }

  function closeFood() {
    setSelectedFood(null);
    setPortions([]);
    setSelectedPortion(null);
  }

  const currentPrice =
    selectedPortion?.price ?? selectedFood?.price ?? 0;

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
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-black shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <h2 className="mb-5 text-xl font-bold text-black sm:text-2xl">
        Popular Items
      </h2>

      {filteredItems.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-gray-500">No food found.</p>
        </div>
      )}

     {/* Food Cards */}
<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
  {filteredItems.map((item) => (
    <button
      key={item.id}
      type="button"
      onClick={() => openFood(item)}
      className="group w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
    >
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-32 w-full object-cover transition duration-300 group-hover:scale-105 sm:h-36"
        />

        <div className="absolute bottom-2 right-2 rounded-full bg-white px-2 py-1 text-xs font-bold text-orange-600 shadow">
          ₦{item.price.toLocaleString()}
        </div>
      </div>

      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-bold text-black">
          {item.name}
        </h3>

        {item.description && (
          <p className="mt-1 line-clamp-1 text-xs text-gray-500">
            {item.description}
          </p>
        )}

        <p className="mt-2 text-xs font-semibold text-orange-600">
          Customize
        </p>
      </div>
    </button>
  ))}
</div>

      {/* Food Selection Bottom Sheet */}
      {selectedFood && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={closeFood}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:max-w-lg sm:rounded-[2rem]"
          >
            {/* Image */}
            <div className="relative">
              <img
                src={selectedFood.image}
                alt={selectedFood.name}
                className="h-56 w-full object-cover sm:h-64"
              />

              <button
                type="button"
                onClick={closeFood}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {/* Food info */}
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  {selectedFood.name}
                </h3>

                {selectedFood.description && (
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {selectedFood.description}
                  </p>
                )}

                <p className="mt-3 text-xl font-black text-orange-600">
                  ₦{currentPrice.toLocaleString()}
                </p>
              </div>

              {/* Portion */}
              {loadingPortions ? (
                <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-500">
                  Loading portions...
                </div>
              ) : portions.length > 0 ? (
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-bold text-gray-900">
                      Choose portion
                    </h4>

                    <span className="text-xs text-gray-400">
                      Required
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {portions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedPortion(option)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          selectedPortion?.id === option.id
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-gray-200 bg-white text-gray-700"
                        }`}
                      >
                        <div className="text-sm font-semibold">
                          {option.name}
                        </div>

                        <div className="mt-1 text-sm font-bold">
                          ₦{option.price.toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Quantity */}
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">
                    Quantity
                  </h4>
                </div>

                <div className="flex items-center gap-4 rounded-full bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-5 text-center font-bold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <div className="mt-7">
                <AddToCartButton
                  food={{
                    ...selectedFood,
                    restaurant_id: restaurant.id,
                    restaurants: {
                      name: restaurant.name,
                    },

                   portion: selectedPortion?.name,
                  portion_id: selectedPortion?.id,
                  price: currentPrice,
                    quantity,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}