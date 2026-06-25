"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function RestaurantHeader({
  name,
}: {
  name: string;
}) {

  const cart = useCartStore(
    (state) => state.cart
  );


  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-5 py-4 flex items-center justify-between">

      <Link
        href="/"
        className="bg-gray-100 rounded-full px-4 py-2 text-black"
      >
        ←
      </Link>


      <h1 className="font-bold text-black">
        {name}
      </h1>


    <Link
  href="/cart"
  className="relative bg-green-700 text-white rounded-full p-3"
>

  <FontAwesomeIcon
    icon={faCartShopping}
    className="text-lg"
  />


  {cartCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
      {cartCount}
    </span>
  )}

</Link>


    </header>
  );
}