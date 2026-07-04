import UserGreeting from "@/components/UserGreeting";
import RedirectIfNotLoggedIn from "@/components/RedirectIfNotLoggedIn";

import CartButton from "@/components/CartButton";
import BottomNav from "@/components/BottomNav";
import HomeMenu from "@/components/HomeMenu";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import {
  faStar,
  faClock,
  faMotorcycle,
} from "@fortawesome/free-solid-svg-icons";

export default async function Home() {

const supabase = await createServerSupabaseClient();

const {
  data: { user },
} = await supabase.auth.getUser();

console.log("USER:", user);

const { data: categories } = await supabase
  .from("categories")
  .select("*")
  .order("id");


const { data: restaurants, error } = await supabase
  .from("restaurants")
  .select("*");


console.log("User ID:", user?.id);
let profile = null;

if (user) {
 const { data } = await supabase
  .from("profiles")
  .select("full_name, role")
  .eq("id", user.id)
  .single();

console.log("PROFILE:", data);

profile = data;
}  


   
const { data: foods } = await supabase
  .from("menu_items")
  .select(`
    *,
    restaurants (
      name
    )
  `)
  .limit(20);

console.log("Foods:", foods);
console.log("Error:", error);
   console.log("Foods:", foods);
console.log("Error:", error);
  return (


  <RedirectIfNotLoggedIn>

    <main className="min-h-screen bg-[#fff8f0] pb-20">


      {/* Top App Bar */}
     <header className="sticky top-0 z-10 bg-[#fff8f0] px-5 py-3">

  <div className="flex items-center justify-between">

    <Image
      src="/images/Bitevy.png"
      alt="Bitevy logo"
      width={130}
      height={40}
      className="-ml-4"
    />

    <div className="flex items-center gap-3">
      <CartButton />
      <HomeMenu />
    </div>

  </div>

  <UserGreeting />

  <Link href="/search">
    <div className="mt-4 flex items-center gap-3 rounded-full bg-gray-100 px-5 py-3 shadow text-gray-500">
      <FontAwesomeIcon icon={faMagnifyingGlass} />
      <span>Search food or restaurants...</span>
    </div>
  </Link>

</header>


      {/* Categories */}
     <section className="px-5 mt-6">

  <h2 className="font-bold text-xl mb-4 text-gray-900">
    Categories
  </h2>
   

  <div className="flex gap-4 overflow-x-auto pb-3 whitespace-nowrap scrollbar-hide">

    {categories?.map((category) => (

      <Link
        key={category.id}
        href={`/category/${category.id}`}
        className="flex-shrink-0 flex flex-col items-center"
      >

        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-md border border-gray-200">

          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />

        </div>

        <p className="mt-2 text-sm font-semibold text-gray-800 text-center">
          {category.name}
        </p>

      </Link>

    ))}

  </div>

</section>


      {/* Restaurants */}
      <section className="px-5 mt-8">

        <div className="flex justify-between">
          <h2 className="font-bold text-xl text-gray-900">
            Popular Near You
          </h2>

          <button className="text-orange-600">
            See all
          </button>
        </div>


        <div className="mt-4 space-y-5">

          {restaurants?.map((restaurant) => (

            <a
              href={`/restaurants/${restaurant.id}`}
              key={restaurant.id}
              className="block bg-white rounded-3xl overflow-hidden shadow-sm"
            >

              <img
                src={restaurant.image}
                className="h-48 w-full object-cover"
                alt={restaurant.name}
              />


              <div className="p-4">

                <h3 className="font-bold text-xl text-gray-900">
                  {restaurant.name}
                </h3>
                   
                   {!restaurant.is_open && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Closed
                    </span>
                  )}

               <div className="flex items-center gap-5 mt-3 text-sm text-gray-600">

              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-yellow-500"
                />
                <span className="font-medium">
                  {restaurant.rating}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-orange-500"
                />
                <span className="font-medium">
                  {restaurant.time}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faMotorcycle}
                  className="text-green-600"
                />
                <span className="font-medium">
                  {restaurant.delivery}
                </span>
              </div>

            </div>

              </div>

            </a>

          ))}

        </div>

      </section>



      {/* Offers */}
      <section className="px-5 mt-8">

        <div className="bg-orange-500 rounded-3xl p-6 text-white">

          <h2 className="text-2xl font-black">
            🔥 Today's Deals
          </h2>

          <p className="mt-2">
            Get discounts on your favourite meals.
          </p>

          <button className="bg-white text-orange-600 mt-4 px-5 py-2 rounded-full font-bold">
            Order Now
          </button>

        </div>

      </section>



      {/* Food Recommendations */}
      {/* Recommended */}
<section className="px-5 mt-8">

  <div className="flex justify-between items-center mb-4">

    <h2 className="font-bold text-xl text-gray-900">
      Recommended For You
    </h2>

    <Link
      href="/foods"
      className="text-orange-600 font-semibold"
    >
      See all
    </Link>

  </div>

  <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">

    {foods?.map((food) => (
  <Link
    key={food.id}
    href={`/foods/${food.id}`}
    className="min-w-[220px] bg-white rounded-3xl overflow-hidden shadow-md flex-shrink-0"
  >
    <img
      src={food.image}
      alt={food.name}
      className="w-full h-40 object-cover"
    />

    <div className="p-4">
      <p className="font-bold text-black">
        {food.name}
      </p>

      <p className="text-orange-600 font-bold mt-2">
        ₦{food.price.toLocaleString()}
      </p>

      <div className="mt-3">
        <AddToCartButton food={food} />
      </div>
    </div>
  </Link>
))}

  </div>

</section>



      {/* Bottom Navigation */}
      <BottomNav />


    </main>
  </RedirectIfNotLoggedIn>
);
 
}