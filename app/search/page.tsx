"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const restaurants = [
  {
    id: "1",
    name: "Mangroove",
    foods: [
      "Chicken Burger",
      "Shawarma",
      "French Fries",
    ],
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
  },

  {
    id: "2",
    name: "Kilimanjaro",
    foods: [
      "Jollof Rice & Chicken",
      "Fried Rice",
      "Peppered Chicken",
    ],
    image: "/restaurants/kilimangero.jpeg",
  },

  {
    id: "3",
    name: "Chicken Republic",
    foods: [
      "Chicken Meal",
      "Rice Combo",
    ],
    image:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800",
  },
];


export default function SearchPage() {

  const [search, setSearch] = useState("");


  const results = restaurants.filter((restaurant) =>
    restaurant.name
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    restaurant.foods.some((food) =>
      food
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );


  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      <h1 className="text-3xl font-bold text-black mb-5">
        Search
      </h1>


      <input
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search food or restaurants..."
        className="w-full bg-white border border-green-700 rounded-full px-5 py-4 text-black outline-none"
      />
      

      <section className="mt-6 space-y-4">


        {search.length === 0 ? (

          <p className="text-gray-600">
            Search for meals or restaurants
          </p>

        ) : results.length === 0 ? (

          <p className="text-gray-600">
            No results found
          </p>

        ) : (

          results.map((restaurant) => (

            <Link
              key={restaurant.id}
              href={`/restaurants/${restaurant.id}`}
              className="block bg-white rounded-3xl p-4"
            >

              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-40 object-cover rounded-2xl"
              />

              <h2 className="text-xl font-bold text-black mt-3">
                {restaurant.name}
              </h2>


              <p className="text-gray-600 mt-2">
                {restaurant.foods.join(", ")}
              </p>


            </Link>

          ))

        )}


      </section>

    </main>
  );
}