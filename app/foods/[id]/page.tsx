import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export default async function FoodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: food } = await supabase
    .from("menu_items")
    .select(`
      *,
      restaurants (
        id,
        name,
        image,
        rating,
        delivery,
        time,
        is_open
      )
    `)
    .eq("id", id)
    .single();

  if (!food) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">
          Food not found
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f0]">

      <div className="relative h-80">

        <Image
          src={food.image}
          alt={food.name}
          fill
          className="object-cover"
        />

        <Link
          href={`/restaurants/${food.restaurant_id}`}
          className="absolute top-5 left-5 bg-white px-4 py-2 text-black rounded-full shadow"
        >
          ← Back
        </Link>

      </div>

      <div className="bg-white rounded-t-[40px] -mt-8 relative p-6">

        <p className="text-orange-600 font-bold">
          🍽 {food.restaurants?.name}
        </p>

        <h1 className="text-3xl text-black font-black mt-2">
          {food.name}
        </h1>

        <div className="flex gap-4 mt-3 text-gray-600">

          <span>⭐ {food.restaurants?.rating}</span>

          <span>🕒 {food.restaurants?.time}</span>

          <span>🚚 {food.restaurants?.delivery}</span>

        </div>

        <p className="mt-6 text-gray-600 leading-7">
          {food.description}
        </p>

        <div className="mt-8 flex justify-between items-center">

          <div>

            <p className="text-gray-500">
              Price
            </p>

            <p className="text-4xl font-black text-green-700">
              ₦{food.price.toLocaleString()}
            </p>

          </div>

          {food.restaurants?.is_open ? (
            <AddToCartButton food={food} />
          ) : (
            <button
              disabled
              className="w-full bg-gray-400 text-white py-4 rounded-2xl font-bold cursor-not-allowed"
            >
              Restaurant Closed
            </button>
          )}

        </div>

      </div>

    </main>
  );
}