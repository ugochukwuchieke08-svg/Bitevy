import UserGreeting from "@/components/UserGreeting";
import RedirectIfNotLoggedIn from "@/components/RedirectIfNotLoggedIn";
import NotificationBell from "@/components/NotificationBell";
import {
  ChevronRight,
  User,
  Package,
  Heart,
  Settings,
} from "lucide-react";

import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
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
  .select("full_name, role, email, phone, address")
  .eq("id", user.id)
  .single();

console.log("PROFILE:", data);

profile = data;
}  

let deliveryAddress = null;

if (user) {
const { data } = await supabase
  .from("addresses")
  .select("address")
  .eq("user_id", user.id)
  .maybeSingle();

deliveryAddress = data?.address ?? null;
}

// Sidebar stats (desktop profile card) — mirrors the counts used on /account
let orderCount = 0;
let favoriteCount = 0;

if (user) {
  const { count: favorites } = await supabase
    .from("restaurant_favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: orders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  favoriteCount = favorites ?? 0;
  orderCount = orders ?? 0;
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
   <main className="min-h-screen bg-[#fff8f0] pb-24 md:flex md:h-screen md:flex-col md:overflow-hidden md:pb-0">

      {/* Top App Bar */}
      <header className="sticky top-0 z-50 shrink-0 bg-[#fff8f0]/95 px-5 py-3 backdrop-blur md:relative md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <Image
            src="/images/Bitevy.png"
            alt="Bitevy logo"
            width={130}
            height={40}
            className="-ml-4 md:ml-0"
          />

          <div className="flex items-center gap-3">
            <NotificationBell />
            <CartButton />
          </div>

        </div>

        <div className="mx-auto max-w-7xl">
          <UserGreeting />
        </div>
      </header>

      {/* Content + desktop sidebar */}
     <div className="mx-auto w-full max-w-7xl flex-1 min-h-0 px-2 md:px-8 lg:px-12">
  <div className="flex h-full min-h-0 w-full gap-8">
        {/* MAIN CONTENT */}
  <div className="min-w-0 flex-1 overflow-y-auto pr-2 scrollbar-hide">

          {/* Delivery + search row: stacked on mobile, side-by-side from tablet up */}
          <section className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
            <Link
              href="/location"
              className="flex min-w-0 w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-gray-100 md:flex-1"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-orange-500"
                />
              </div>

              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-gray-500">
                  Deliver to
                </p>

                <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold text-gray-900">
                  {deliveryAddress || "Choose your delivery location"}
                </p>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
            </Link>

            <Link href="/search" className="md:flex-1">
              <div className="flex items-center gap-3 rounded-full bg-gray-100 px-5 py-3 shadow text-gray-500">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <span>Search food or restaurants...</span>
              </div>
            </Link>
          </section>

          {/* Categories */}
          <section className="mt-6">
            <h2 className="font-bold text-xl md:text-2xl mb-4 text-gray-900">
              Categories
            </h2>

            <div className="flex gap-4 overflow-x-auto pb-3 whitespace-nowrap scrollbar-hide md:flex-wrap md:overflow-visible">

              {categories?.map((category) => (

                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="flex-shrink-0 flex flex-col items-center md:w-24"
                >

                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl overflow-hidden shadow-md border border-gray-200">

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
          <section className="mt-8">

            <div className="flex justify-between items-center">
              <h2 className="font-bold text-xl md:text-2xl text-gray-900">
                Popular Near You
              </h2>

              <Link
                href="/restaurants"
                className="text-orange-600 font-semibold"
              >
                See all
              </Link>
            </div>

            {/* Mobile: two horizontal-scroll rows. md+: single responsive grid */}
            <div className="mt-5 flex gap-4 overflow-x-auto pb-3 scrollbar-hide md:hidden">
              {firstRow.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>

            <div className="mt-4 flex gap-4 overflow-x-auto pb-3 scrollbar-hide md:hidden">
              {secondRow.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>

            <div className="mt-5 hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {restaurants?.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>

          </section>


          {/* Premium Offer Banner */}
          <section className="mt-6">

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

              <div className="relative z-10 flex items-center justify-between p-5 md:p-10">

                <div className="max-w-[65%] md:max-w-[55%]">

                  <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur">

                    <FontAwesomeIcon
                      icon={faFire}
                      className="text-yellow-300"
                    />

                    <span className="text-xs font-bold tracking-wider text-white">
                      TODAY'S DEAL
                    </span>

                  </div>

                  <h2 className="mt-3 text-2xl md:text-4xl font-black leading-tight text-white">
                    Up to
                    <br />
                    <span className="text-yellow-300">
                      50% OFF
                    </span>
                  </h2>

                  <p className="mt-2 text-xs md:text-sm leading-relaxed text-white/90">
                    On selected restaurants across Bitevy.
                    Limited time only.
                  </p>

                  <Link href="/search" className="mt-4 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-orange-600 shadow-xl transition-all hover:scale-105">

                    Order Now

                    <FontAwesomeIcon icon={faArrowRight} />

                  </Link>

                </div>

                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500"
                  alt="Burger"
                  className="h-40 w-40 md:h-56 md:w-56 rounded-full border-4 border-white/30 object-cover shadow-2xl"
                />

              </div>

            </div>

          </section>



          {/* Food Recommendations */}
          <section className="mt-8">

            <div className="flex justify-between items-center mb-4">

              <h2 className="font-bold text-xl md:text-2xl text-gray-900">
                Recommended For You
              </h2>

            </div>

            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible">

              {foods?.map((food) => (
                <Link
                  key={food.id}
                  href={`/foods/${food.id}`}
                  className="min-w-[220px] md:min-w-0 bg-white rounded-3xl overflow-hidden shadow-md flex-shrink-0"
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

        </div>

        {/* Desktop-only profile sidebar, pulled from /account */}
        <aside className="hidden min-h-0 w-72 shrink-0 overflow-y-auto pr-1 md:block lg:w-80">
          <div className="space-y-5 pb-6">

            {/* Profile Card */}
            <div className="rounded-[32px] bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
              <div className="flex flex-col items-center text-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                <User className="h-10 w-10 text-orange-500" strokeWidth={2} />
              </div>

                <h2 className="mt-4 text-xl font-black">
                  {profile?.full_name || "User"}
                </h2>

                <p className="mt-1 text-sm text-orange-100 break-all">
                  {profile?.email || user?.email}
                </p>

                <Link
                  href="/account/edit"
                  className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-orange-600 shadow"
                >
                  Edit Profile
                </Link>

              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">

              <div className="rounded-2xl bg-white p-4 text-center shadow">
                <h3 className="text-xl font-black text-orange-500">
                  {orderCount}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Orders
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 text-center shadow">
                <h3 className="text-xl font-black text-orange-500">
                  {favoriteCount}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Favorites
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 text-center shadow">
                <h3 className="text-xl font-black text-orange-500">
                  ★
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Level
                </p>
              </div>

            </div>

            {/* Contact Info */}
            <div className="rounded-3xl bg-white p-5 shadow space-y-4">

              <h3 className="text-sm font-bold text-gray-900">
                Contact Information
              </h3>

              <div>
                <p className="text-xs text-gray-500">
                  Phone Number
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {profile?.phone || "Not added"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Delivery Address
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {deliveryAddress || profile?.address || "Not added"}
                </p>
              </div>

            </div>

            {/* Quick Links */}
            <div className="overflow-hidden rounded-3xl bg-white shadow">

              <Link
                href="/orders"
                className="flex items-center justify-between border-b border-gray-100 p-4 hover:bg-orange-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                    <Package className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    My Orders
                  </span>
                </div>
                <span className="text-lg text-gray-400">
                  ›
                </span>
              </Link>

              <Link
                href="/favorites"
                className="flex items-center justify-between border-b border-gray-100 p-4 hover:bg-orange-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                    <Heart className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    Favorites
                  </span>
                </div>
                <span className="text-lg text-gray-400">
                  ›
                </span>
              </Link>

              <Link
                href="/account"
                className="flex items-center justify-between p-4 hover:bg-orange-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                  <Settings className="h-5 w-5 text-orange-600" />
                </div>
                  <span className="text-sm font-semibold text-gray-700">
                    Account Settings
                  </span>
                </div>
                <span className="text-lg text-gray-400">
                  ›
                </span>
              </Link>

            </div>

          </div>
          
        </aside>

      </div>
      </div>


      {/* Bottom Navigation: mobile-only tab bar, hidden on desktop */}
      <div className="md:hidden">
        <BottomNav />
      </div>


    </main>
 </RedirectIfNotLoggedIn>
);
 
}
