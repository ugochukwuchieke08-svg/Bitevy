"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";


type Props = {
  name: string;
  price: number;
  image: string;
};


export default function AddToCartButton({
  name,
  price,
  image,
}: Props) {

  const addToCart = useCartStore(
    (state) => state.addToCart
  );


  const [show, setShow] = useState(false);


  function handleAdd() {

   addToCart({
  name,
  price,
  image,
  quantity: 1,
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

          {name} added to cart

        </div>

      )}

    </>
  );
}