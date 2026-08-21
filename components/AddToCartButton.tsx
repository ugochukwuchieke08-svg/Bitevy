"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

type Props = {
  food: any;
};

export default function AddToCartButton({ food }: Props) {
  const addToCart = useCartStore((state) => state.addToCart);

  const [show, setShow] = useState(false);

  function handleAdd() {
   addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      quantity: food.quantity ?? 1,

      restaurant_id: food.restaurant_id,
      restaurant_name: food.restaurants?.name,

      // Customization
      portion: food.portion,
      portion_id: food.portion_id,
    });
    setShow(true);

    setTimeout(() => {
      setShow(false);
    }, 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-full bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600 active:scale-[0.98]"
      >
        Add to cart
      </button>

      {show && (
        <div className="fixed bottom-5 left-4 right-4 z-[110] rounded-full bg-green-700 px-4 py-3 text-center font-bold text-white shadow-xl sm:left-auto sm:right-5 sm:w-auto">
          {food.name} added to cart
        </div>
      )}
    </>
  );
}