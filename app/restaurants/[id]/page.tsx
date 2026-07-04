import { supabase } from "@/lib/supabase/client";
import AddToCartButton from "@/components/AddToCartButton";
import RestaurantHeader from "@/components/RestaurantHeader";
import Link from "next/link";


export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;


  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();


  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", id);


  if (!restaurant) {
    return (
      <main className="p-10">
        Restaurant not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f0]">
      <RestaurantHeader name={restaurant.name}/>
      <div className="relative pt-20">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-64 object-cover"
        />

        <Link
          href="/"
          className="absolute text-black top-4 left-4 bg-white rounded-full px-4 py-2 shadow"
        >
          Back
        </Link>
      </div>
       
       {!restaurant.is_open && (
        <div className="bg-red-100 border border-red-300 text-red-700 rounded-2xl p-4 mb-6 text-center font-semibold">
          🚫 This restaurant is currently closed.
        </div>
      )}
      <section className="bg-white rounded-t-3xl -mt-6 relative p-6">

        <h1 className="text-3xl text-black font-bold">
          {restaurant.name}
        </h1>

        <div className="flex gap-4 mt-3 text-gray-600">

          <span>
            ⭐ {restaurant.rating}
          </span>

          <span>
            🚚 {restaurant.delivery}
          </span>

          <span>
            🕒 {restaurant.time}
          </span>

        </div>

            </section>


      {/* Menu Section */}
      <section className="p-5">

        <h2 className="text-2xl text-black font-bold mb-4">
          Popular Items
        </h2>


        <div className="space-y-4">

          {menuItems?.map((item)=>(

            <div
              key={item.name}
              className="bg-white rounded-3xl overflow-hidden shadow-sm"
            >

              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover"
              />


              <div className="p-4">

                <h3 className="text-black font-bold text-lg">
                  {item.name}
                </h3>


                <p className="text-orange-600 font-bold mt-2">
                  {item.price}
                </p>


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

          ))}

        </div>

      </section>
     

    </main>
  );
}