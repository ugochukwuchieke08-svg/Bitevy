"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faFire } from "@fortawesome/free-solid-svg-icons";

const foodImages = [
  {
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500",
    alt: "Pizza",
  },
  {
    url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500",
    alt: "Burger",
  },
  {
    url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500",
    alt: "Food",
  },
  {
    url: "https://images.unsplash.com/photo-1547592180-85f173990554?w=500",
    alt: "Fresh food",
  },
];

export default function PremiumOfferBanner() {
  const [currentFood, setCurrentFood] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFood((prev) => (prev + 1) % foodImages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
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

            <Link
              href="/search"
              className="mt-4 flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-orange-600 shadow-xl transition-all hover:scale-105"
            >
              Order Now

              <FontAwesomeIcon icon={faArrowRight} />
            </Link>

          </div>

          {/* Sliding Food Images */}
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full border-4 border-white/30 shadow-2xl md:h-56 md:w-56">

            {foodImages.map((food, index) => (
              <img
                key={food.url}
                src={food.url}
                alt={food.alt}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                  index === currentFood
                    ? "scale-100 opacity-100"
                    : "scale-105 opacity-0"
                }`}
              />
            ))}

          </div>

        </div>
      </div>
    </section>
  );
}