import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch category
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  // Fetch foods in this category
  const { data: foods } = await supabase
    .from("menu_items")
    .select(`
      *,
      restaurants (
        id,
        name,
        image
      )
    `)
    .eq("category_id", id);

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      {/* Header */}

      <div className="mb-8">

        <Link
          href="/"
          className="text-orange-600 font-semibold"
        >
          ← Back
        </Link>

        <div className="mt-5 flex items-center gap-4">

          <img
            src={category?.image}
            alt={category?.name}
            className="w-20 h-20 rounded-3xl object-cover shadow-lg"
          />

          <div>

            <h1 className="text-3xl font-black text-gray-900">
              {category?.name}
            </h1>

            <p className="text-gray-500 mt-1">
              {foods?.length || 0} food items
            </p>

          </div>

        </div>

      </div>

      {/* Food List */}

      <div className="grid gap-5">

        {foods?.map((food) => (

          <Link
            key={food.id}
            href={`/restaurants/${food.restaurant_id}`}
            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition"
          >

            <img
              src={food.image}
              alt={food.name}
              className="w-full h-52 object-cover"
            />

            <div className="p-5">

              <div className="flex justify-between items-start">

                <div>

                  <h2 className="font-bold text-xl text-gray-900">
                    {food.name}
                  </h2>

                  <p className="text-orange-600 mt-1 font-semibold">
                    🍽 {food.restaurants?.name}
                  </p>

                </div>

                <p className="text-green-700 font-black text-xl">
                  ₦{food.price.toLocaleString()}
                </p>

              </div>

              <button className="mt-5 w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-3 font-bold transition">
                View Restaurant
              </button>

            </div>

          </Link>

        ))}

      </div>

      {foods?.length === 0 && (

        <div className="bg-white rounded-3xl p-10 text-center">

          <h2 className="text-2xl font-bold text-gray-800">
            No food available
          </h2>

          <p className="text-gray-500 mt-2">
            This category is empty.
          </p>

        </div>

      )}

    </main>
  );
}