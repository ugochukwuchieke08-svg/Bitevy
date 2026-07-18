"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faMotorcycle,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import FavoriteButton from "./FavoriteButton";

type Restaurant = {
  id: number;
  name: string;
  image: string;
  rating: number;
  time: string;
  delivery: string;
  is_open: boolean;
};

export default function RestaurantCard({
  restaurant,
  onUnfavorite,
}: {
  restaurant: Restaurant;
  onUnfavorite?: () => void;
}) {
  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="group w-[230px] flex-shrink-0 overflow-hidden rounded-3xl bg-white border border-orange-100/60 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-110"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Rating */}
        <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow-lg">
          <FontAwesomeIcon
            icon={faStar}
            className="text-yellow-500 text-xs"
          />

          <span className="text-sm font-bold text-gray-700">
            {restaurant.rating}
          </span>
        </div>

        {/* Open / Closed */}
        <div className="absolute top-4 right-4">
          {restaurant.is_open ? (
            <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              Open
            </span>
          ) : (
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              Closed
            </span>
          )}
        </div>

        <FavoriteButton
          restaurantId={restaurant.id}
          onUnfavorite={onUnfavorite}
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="truncate text-[17px] font-semibold text-gray-900">
          {restaurant.name}
        </h3>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faClock}
              className="text-orange-500"
            />

            <span className="text-[14px] font-semibold text-gray-500">
              {restaurant.time}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faMotorcycle}
              className="text-orange-500"
            />

            <span className="text-[14px] font-semibold text-gray-500">
              {restaurant.delivery}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}