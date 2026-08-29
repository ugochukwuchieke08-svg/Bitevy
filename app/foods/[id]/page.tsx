import { createServerSupabaseClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import { ArrowLeft, Clock3, Star, Truck, Utensils } from "lucide-react";

export default async function FoodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createServerSupabaseClient();

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
        <h1 className="text-2xl font-bold text-black">
          Food not found
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f0]">
      {/* Food Image */}
      <div className="relative h-80">
        <Image
          src={food.image}
          alt={food.name}
          fill
          className="object-cover"
        />

        {/* Back Button */}
      <Link
          href={`/restaurants/${food.restaurant_id}`}
          className="absolute top-5 left-5 flex items-center gap-2 bg-white px-4 py-2 text-black rounded-full shadow"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          <span>Back</span>
        </Link>
      </div>

      {/* Food Details */}
      <div className="bg-white rounded-t-[40px] -mt-8 relative p-6">

        {/* Restaurant */}
       <p className="text-orange-600 font-bold flex items-center gap-2">
          <Utensils size={18} strokeWidth={2.5} />
          {food.restaurants?.name}
        </p>

        {/* Food Name */}
        <h1 className="text-3xl text-black font-black mt-2">
          {food.name}
        </h1>

        {/* Restaurant Info */}
       <div className="flex gap-4 mt-3 text-gray-600">
  <span className="flex items-center gap-1">
    <Star
      size={16}
      className="text-yellow-500"
      fill="currentColor"
    />
    {food.restaurants?.rating}
  </span>

  <span className="flex items-center gap-1">
    <Clock3 size={16} />
    {food.restaurants?.time}
  </span>

  <span className="flex items-center gap-1">
    <Truck size={16} />
    {food.restaurants?.delivery}
  </span>
</div>

        {/* Description */}
        <p className="mt-6 text-gray-600 leading-7">
          {food.description}
        </p>

        {/* Price + Cart */}
        <div className="mt-8 flex justify-between items-center gap-4">
          <div>
            <p className="text-gray-500 text-sm">
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
              className="bg-gray-400 text-white py-4 px-6 rounded-2xl font-bold cursor-not-allowed"
            >
              Restaurant Closed
            </button>
          )}
        </div>
      </div>
    </main>
  );
}