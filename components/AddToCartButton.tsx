"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";


type Props = {
  food: any;
};

export default function AddToCartButton({ food }: Props) {

  const addToCart = useCartStore(
    (state) => state.addToCart
  );


  const [show, setShow] = useState(false);


  function handleAdd() {

addToCart({
  id: food.id,
  name: food.name,
  price: food.price,
  image: food.image,
  quantity: 1,
  restaurant_id: food.restaurant_id,
  restaurant_name: food.restaurants?.name,
});

    setShow(true);


    setTimeout(() => {
      setShow(false);
    }, 2000);

  }


  return (
    <>

      <button
        onClick={handleAdd}
        className="bg-orange-500 text-white px-5 py-2 rounded-full"
      >
        Add
      </button>


      {show && (

        <div className="fixed bottom-5 left-5 right-5 bg-green-700 text-white rounded-full py-3 text-center font-bold z-50">

          {food.name} added to cart

        </div>

      )}

    </>
  );
}