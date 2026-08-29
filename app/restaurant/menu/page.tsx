
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import DeleteFoodButton from "@/components/DeleteFoodButton";
import {
  Plus,
  Utensils,
  Pencil,
  ImageOff,
  ArrowLeft,
} from "lucide-react";

export default async function RestaurantMenuPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900">
            Please login
          </h1>

          <p className="text-gray-500 mt-2">
            You need to be logged in to manage your menu.
          </p>
        </div>
      </main>
    );
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900">
            Restaurant not found
          </h1>

          <p className="text-gray-500 mt-2">
            We couldn't find a restaurant associated with your account.
          </p>
        </div>
      </main>
    );
  }

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("id");

  const items = menuItems ?? [];

  return (
    <main className="min-h-screen bg-[#fff8f0] pb-16">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#fff8f0]/90 backdrop-blur-xl border-b border-black/5">

        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <Link
                href="/restaurant/dashboard"
                className="h-11 w-11 rounded-full bg-white border border-black/5 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 transition active:scale-95"
                aria-label="Back to restaurant dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Restaurant
                </p>

                <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                  Menu
                </h1>
              </div>

            </div>

            <Link
              href="/restaurant/menu/add"
              className="hidden sm:flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl font-bold hover:bg-gray-800 active:scale-[0.98] transition"
            >
              <Plus className="w-5 h-5" />
              Add Food
            </Link>

          </div>

        </div>

      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Page Intro */}
        <section className="pt-7 pb-6">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">

            <div>
              <p className="text-sm font-semibold text-orange-600 mb-1">
                {restaurant.name}
              </p>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                Your Menu
              </h2>

              <p className="text-gray-500 mt-2 max-w-xl">
                Add, edit and manage the meals customers can order from your restaurant.
              </p>
            </div>

            {/* Menu Stats */}
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-black/5 shadow-sm px-4 py-3 w-fit">

              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-orange-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400">
                  Menu items
                </p>

                <p className="text-lg font-black text-gray-900">
                  {items.length}
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* Mobile Add Button */}
        <div className="sm:hidden mb-6">

          <Link
            href="/restaurant/menu/add"
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-2xl font-bold shadow-lg shadow-black/10 active:scale-[0.98] transition"
          >
            <Plus className="w-5 h-5" />
            Add Food
          </Link>

        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <section className="bg-white rounded-[32px] border border-black/5 shadow-sm px-6 py-14 text-center">

            <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Utensils className="w-7 h-7 text-orange-600" />
            </div>

            <h2 className="mt-5 text-xl font-black text-gray-900">
              Your menu is empty
            </h2>

            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Add your first meal so customers can discover and order from your restaurant.
            </p>

            <Link
              href="/restaurant/menu/add"
              className="inline-flex items-center gap-2 mt-6 bg-black text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-gray-800 transition"
            >
              <Plus className="w-5 h-5" />
              Add Your First Food
            </Link>

          </section>
        ) : (

          /* Food Grid */
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">

            {items.map((item) => (

              <article
                key={item.id}
                className="group bg-white rounded-[28px] border border-black/5 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >

                {/* Image */}
                <div className="relative h-56 bg-gray-100 overflow-hidden">

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <ImageOff className="w-8 h-8" />

                      <span className="text-sm mt-2">
                        No image
                      </span>
                    </div>
                  )}

                  {/* Price Badge */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md rounded-xl px-3.5 py-2 shadow-lg">

                    <p className="text-lg font-black text-green-700">
                      ₦{Number(item.price).toLocaleString()}
                    </p>

                  </div>

                </div>

                {/* Content */}
                <div className="p-5">

                  <div className="min-h-[92px]">

                    <h2 className="text-xl font-black text-gray-900 leading-tight">
                      {item.name}
                    </h2>

                    {item.description ? (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-6">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic mt-2">
                        No description added.
                      </p>
                    )}

                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">

                    <Link
                      href={`/restaurant/menu/edit/${item.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-50 text-orange-700 hover:bg-orange-100 py-3 rounded-xl font-bold text-sm transition"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Link>

                    <DeleteFoodButton id={item.id} />

                  </div>

                </div>

              </article>

            ))}

          </section>

        )}

      </div>

    </main>
  );
}

