import UserGreeting from "@/components/UserGreeting";
import RedirectIfNotLoggedIn from "@/components/RedirectIfNotLoggedIn";
import NotificationBell from "@/components/NotificationBell";
import CartButton from "@/components/CartButton";
import BottomNav from "@/components/BottomNav";
import HomeMenu from "@/components/HomeMenu";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import FavoriteButton from "@/components/FavoriteButton";
import RestaurantCard from "@/components/RestaurantCard";
import {
  faFire,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
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
  .order("position", { ascending: true });


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

const firstRow = restaurants?.filter((_, index) => index % 2 === 0) ?? [];
const secondRow = restaurants?.filter((_, index) => index % 2 !== 0) ?? [];

console.log("Foods:", foods);
console.log("Error:", error);
   console.log("Foods:", foods);
console.log("Error:", error);
  return (
   <RedirectIfNotLoggedIn>
    <main className="min-h-screen bg-[#fff8f0] pb-20">


      {/* Top App Bar */}
   <header className="sticky top-0 z-50 bg-[#fff8f0] px-5 py-3">

  <div className="flex items-center justify-between">

    <Image
      src="/images/Bitevy.png"
      alt="Bitevy logo"
      width={130}
      height={40}
      className="-ml-4"
    />

   <div className="flex items-center gap-3">
  <NotificationBell />
  <CartButton />
  
</div>

  </div>

  <UserGreeting />
</header>
 <Link href="/search">
    <div className="mt-4 flex items-center gap-3 rounded-full bg-gray-100 px-5 py-3 shadow text-gray-500">
      <FontAwesomeIcon icon={faMagnifyingGlass} />
      <span>Search food or restaurants...</span>
    </div>
  </Link>

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

  <div className="flex justify-between items-center">
    <h2 className="font-bold text-xl text-gray-900">
      Popular Near You
    </h2>

    <Link
      href="/restaurants"
      className="text-orange-600 font-semibold"
    >
      See all
    </Link>
  </div>

  {/* First Row */}
  <div className="mt-5 flex gap-4 overflow-x-auto pb-3 scrollbar-hide">

    {firstRow.map((restaurant) => (
   <RestaurantCard
      key={restaurant.id}
      restaurant={restaurant}
    />

    ))}

  </div>

  {/* Second Row */}
  <div className="mt-4 flex gap-4 overflow-x-auto pb-3 scrollbar-hide">

    {secondRow.map((restaurant) => (
    <RestaurantCard
      key={restaurant.id}
      restaurant={restaurant}
    />

    ))}

  </div>

</section>


      {/* Premium Offer Banner */}
<section className="px-5 mt-6">

  <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 shadow">

    {/* Background Food Image */}
    <img
      src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200"
      alt="Pizza" 
      className="absolute inset-0 h-full w-full object-cover opacity-20"
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/15" />

    {/* Decorative Shapes */}
    <div className="absolute -top-16 -right-10 h-44 w-44 rounded-full bg-white/10" />
    <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-yellow-300/10" />

    <div className="relative z-10 flex items-center justify-between p-5">

      <div className="max-w-[65%]">

        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur">

          <FontAwesomeIcon
            icon={faFire}
            className="text-yellow-300"
          />

          <span className="text-xs font-bold tracking-wider text-white">
            TODAY'S DEAL
          </span>

        </div>

        <h2 className="mt-3 text-2xl font-black leading-tight text-white">
          Up to
          <br />
          <span className="text-yellow-300">
            50% OFF
          </span>
        </h2>

        <p className="mt-2 text-xs leading-relaxed text-white/90">
          On selected restaurants across Bitevy.
          Limited time only.
        </p>

        <Link href="/search" className="mt-4 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-orange-600 shadow-xl transition-all hover:scale-105">

          Order Now

          <FontAwesomeIcon icon={faArrowRight} />

        </Link>

      </div>

      <img
        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500"
        alt="Burger"
        className="h-40 w-40 rounded-full border-4 border-white/30 object-cover shadow-2xl"
      />

    </div>

  </div>

</section>



      {/* Food Recommendations */}
      {/* Recommended */}
<section className="px-5 mt-8">

  <div className="flex justify-between items-center mb-4">

    <h2 className="font-bold text-xl text-gray-900">
      Recommended For You
    </h2>

    

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