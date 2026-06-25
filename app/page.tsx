import UserGreeting from "@/components/UserGreeting";
import RedirectIfNotLoggedIn from "@/components/RedirectIfNotLoggedIn";
import { supabase } from "@/lib/supabase";
import CartButton from "@/components/CartButton";
import BottomNav from "@/components/BottomNav";
import HomeMenu from "@/components/HomeMenu";
import Link from "next/link";
import Image from "next/image";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default async function Home() {
  const categories = [
    "🍔 Fast Food",
    "🍚 Nigerian",
    "🍗 Chicken",
    "🍕 Pizza",
    "🥤 Drinks",
    "🍰 Snacks",
  ];



const { data: restaurants, error } = await supabase
  .from("restaurants")
  .select("*");

const {
  data: { user },
} = await supabase.auth.getUser();

let profile = null;

if (user) {
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  profile = data;
}  

console.log(error);
   
  const foods = [
    {
      name: "Jollof Rice & Chicken",
      price: "₦3500",
      image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    },
    {
      name: "Shawarma",
      price: "₦2500",
      image:
        "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
    },
  ];

  return (


  <RedirectIfNotLoggedIn>

    <main className="min-h-screen bg-[#fff8f0] pb-20">


      {/* Top App Bar */}
     <header className="bg-[#fff8f0] sticky top-0 z-10  px-5 py-3">

  <div className="flex justify-between items-center">

    <div className="flex flex-col">
    <Image
        src="/images/Bitevy.png"
        alt="Bitevy logo"
        width={130}
        height={40}
        
        className="-mt-0 -ml-4"

      />
      
    </div>
    
 <CartButton />
<HomeMenu />
  </div>
 
 <UserGreeting />

  <Link href="/search">
  <div
    className="mt-4 w-full rounded-full bg-gray-100 px-5 py-3 border border-green-700 text-gray-500"
  >
    <FontAwesomeIcon 
      icon={faMagnifyingGlass} 
      className="text-sm"
    />
    Search food or restaurants...
  </div>
</Link>

</header>


      {/* Categories */}
      <section className="px-5 mt-6">

        <h2 className="font-bold text-xl mb-3 text-gray-900">
          Categories
        </h2>

        <div className="flex gap-3 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              className="bg-white px-5 py-3 rounded-full text-gray-900 shadow-sm whitespace-nowrap text-sm font-medium"
            >
              {category}
            </button>
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


                <div className="flex gap-3 text-sm text-gray-600 mt-2">

                  <span>
                    ⭐ {restaurant.rating}
                  </span>

                  <span>
                    🕒 {restaurant.time}
                  </span>

                  <span>
                    🚚 {restaurant.delivery}
                  </span>

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
      <section className="px-5 mt-8">

        <h2 className="font-bold text-xl text-gray-900">
          Recommended
        </h2>


        <div className="grid grid-cols-2 gap-4 mt-4">

          {foods.map((food)=>(
            <div
              key={food.name}
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
            >

              <img
                src={food.image}
                className="h-32 w-full object-cover"
                alt={food.name}
              />


              <div className="p-3">

                <h3 className="font-bold text-gray-900">
                  {food.name}
                </h3>

                <p className="text-orange-600 font-bold mt-2">
                  {food.price}
                </p>

              </div>

            </div>
          ))}

        </div>

      </section>



      {/* Bottom Navigation */}
      <BottomNav />


    </main>
  </RedirectIfNotLoggedIn>
);
 
}