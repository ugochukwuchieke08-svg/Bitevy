import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import DeleteFoodButton from "@/components/DeleteFoodButton";
export default async function RestaurantMenuPage() {
  const supabase = await createServerSupabaseClient();

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  return <h1>Please login.</h1>;
}

const { data: restaurant } = await supabase
  .from("restaurants")
  .select("*")
  .eq("owner_id", user.id)
  .single();

  if (!restaurant) {
    return <h1>Restaurant not found.</h1>;
  }

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("id");

    

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-black text-black">
            Your Menu
          </h1>

          <p className="text-gray-500">
            Manage your restaurant's meals
          </p>

        </div>

        <Link
          href="/restaurant/menu/add"
          className="bg-green-700 text-white px-5 py-3 rounded-xl font-semibold"
        >
          + Add Food
        </Link>

      </div>

      {/* Food List */}
      <div className="space-y-5">

        {menuItems?.map((item) => (

          <div
            key={item.id}
            className="bg-white rounded-3xl shadow overflow-hidden"
          >

            <img
              src={item.image}
              alt={item.name}
              className="w-full h-52 object-cover"
            />

            <div className="p-5">

              <h2 className="text-2xl font-bold text-black">
                {item.name}
              </h2>

              <p className="text-gray-500 mt-2">
                {item.description}
              </p>

              <p className="text-green-700 text-2xl font-black mt-4">
                ₦{item.price.toLocaleString()}
              </p>

              <div className="flex gap-3 mt-6">

                <Link
                  href={`/restaurant/menu/edit/${item.id}`}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-center font-semibold"
                >
                  Edit
                </Link>

              <DeleteFoodButton id={item.id} />

              </div>

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}