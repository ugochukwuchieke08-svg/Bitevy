"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as solidHeart,
} from "@fortawesome/free-solid-svg-icons";
import {
  faHeart as regularHeart,
} from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "@/context/AuthContext";

export default function FavoriteButton({
  restaurantId,
}: {
  restaurantId: number;
}) {
  const { user } = useAuth();

  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkFavorite() {
      if (!user) {
        setLoading(false);
        return;
      }

     const { data } = await supabase
      .from("restaurant_favorites")
      .insert({
        user_id: user.id,
        restaurant_id: restaurantId,
  });
     

      setFavorite(!!data);
      setLoading(false);
    }

    checkFavorite();
  }, [user, restaurantId]);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();

    console.log("Heart clicked");

  if (!user) {
    console.log("No user logged in");
    return;
  }

  console.log("User:", user.id);


    if (favorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("food_id", restaurantId);

      setFavorite(false);
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id,
        food_id: restaurantId,
      });

      setFavorite(true);
    }
  }

  if (loading) return null;

  return (
    <button
      onClick={toggleFavorite}
      className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-lg transition active:scale-90"
    >
      <FontAwesomeIcon
        icon={favorite ? solidHeart : regularHeart}
        className={`text-xl ${
          favorite ? "text-red-500" : "text-gray-400"
        }`}
      />
    </button>
  );
}