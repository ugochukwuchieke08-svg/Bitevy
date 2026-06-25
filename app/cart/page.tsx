"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const cart = useCartStore((state) => state.cart);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const increaseQuantity = useCartStore(
  (state) => state.increaseQuantity
);

const decreaseQuantity = useCartStore(
  (state) => state.decreaseQuantity
);

const removeFromCart = useCartStore(
  (state) => state.removeFromCart
);

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      <div className="flex items-center gap-4 mb-6">

        <Link
          href="/"
          className="bg-white px-4 py-2 text-black rounded-full shadow"
        >
          ← Back
        </Link>

        <h1 className="text-3xl font-bold text-black">
          Cart
        </h1>

      </div>

      {cart.length === 0 ? (
        <div className="bg-white p-6 rounded-3xl">
          <p className="text-black">
            Your cart is empty
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">

            {cart.map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-3xl p-4 flex gap-4"
              >

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 rounded-2xl object-cover"
                />

                <div className="flex-1">

                  <h2 className="font-bold text-black">
                    {item.name}
                  </h2>

                  <p className="text-orange-600 font-bold">
                    ₦{item.price.toLocaleString()}
                  </p>

                 <div className="flex items-center gap-3 mt-3">

                  <button
                    onClick={() =>
                      decreaseQuantity(item.name)
                    }
                    className="bg-gray-200 w-8 h-8 rounded-full text-black"
                  >
                    -
                  </button>

                  <span className="text-black font-bold">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      increaseQuantity(item.name)
                    }
                    className="bg-orange-500 w-8 h-8 rounded-full text-white"
                  >
                    +
                  </button>

                </div>

                <button
                  onClick={() =>
                    removeFromCart(item.name)
                  }
                  className="text-red-500 mt-3 text-sm"
                >
                  Remove
                </button>

                </div>

              </div>
            ))}

          </div>

          <div className="bg-white rounded-3xl p-5 mt-6">

            <h2 className="text-xl font-bold text-black">
              Total
            </h2>

            <p className="text-2xl font-bold text-orange-600 mt-2">
              ₦{total.toLocaleString()}
            </p>

           <Link
            href="/checkout"
            className="block text-center w-full mt-4 bg-orange-500 text-white py-4 rounded-full font-bold"
          >
            Checkout
          </Link>

          </div>
        </>
      )}
    </main>
  );
}