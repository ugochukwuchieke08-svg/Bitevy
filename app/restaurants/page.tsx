import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMagnifyingGlass,
  faStar,
  faClock,
  faMotorcycle,
} from "@fortawesome/free-solid-svg-icons";

export default async function RestaurantsPage() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
  .from("restaurants")
  .select("*")
  .order("rating", { ascending: false });

  const restaurants = data ?? [];

  return (       
    <main className="min-h-screen bg-[#fff8f0] pb-10">

      {/* Header */}
        <header className="sticky top-0 z-30 bg-[#fff8f0]/95 backdrop-blur-md border-b border-orange-100">

          <div className="px-5 pt-4 pb-3">

            <div className="flex items-center justify-between">

              <Link
                href="/"
                className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center active:scale-95 transition"
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className="text-gray-700"
                />
              </Link>

              <h1 className="text-xl font-bold text-gray-900">
                Restaurants
              </h1>

              {/* Keeps title centered */}
              <div className="w-10" />

            </div>

            {/* Search */}
            <Link
            href="/search" className="mt-4 relative">

              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search restaurants..."
                className="w-full rounded-2xl bg-white pl-12 pr-4 py-3 text-sm shadow-md  border border-gray-100 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
              />

            </Link>

          </div>

        </header>
      
      {/* Restaurants */}

      <section className="px-5 mt-6 space-y-6">

        {restaurants.map((restaurant) => (

          <Link
            href={`/restaurants/${restaurant.id}`}
            key={restaurant.id}
            className="block bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition"
          >

            <div className="relative">

              <Image
                src={restaurant.image}
                alt={restaurant.name}
                width={800}
                height={500}
                className="w-full h-56 object-cover"
              />

              {!restaurant.is_open && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                  Closed
                </div>
              )}

            </div>

            <div className="p-5">

              <h2 className="text-2xl font-bold text-gray-900">
                {restaurant.name}
              </h2>

              <div className="flex items-center gap-6 mt-4 text-gray-600">

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

          </Link>

        ))}

        {restaurants.length === 0 && (

          <div className="text-center py-20">

            <h2 className="text-2xl font-bold">
              No restaurants yet 🍽️
            </h2>

            <p className="text-gray-500 mt-3">
              Restaurants will appear here once they join Bitevy.
            </p>

          </div>

        )}

      </section>

       {/* Bottom Navigation */}
            <BottomNav />

    </main>
  );
}