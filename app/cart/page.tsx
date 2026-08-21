"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const cart = useCartStore((state) => state.cart);

  const increaseQuantity = useCartStore(
    (state) => state.increaseQuantity
  );

  const decreaseQuantity = useCartStore(
    (state) => state.decreaseQuantity
  );

  const removeFromCart = useCartStore(
    (state) => state.removeFromCart
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#fff8f0] px-4 py-5 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex h-10 shrink-0 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-black shadow transition active:scale-95"
          >
            ← Back
          </Link>

          <h1 className="text-2xl font-black text-black sm:text-3xl">
            Cart
          </h1>
        </div>

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <div className="rounded-3xl bg-white px-5 py-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-2xl">
              🛒
            </div>

            <h2 className="text-xl font-bold text-black">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add some delicious food from a restaurant.
            </p>

            <Link
              href="/restaurants"
              className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 active:scale-95"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.portion ?? "Regular"}`}
                  className="rounded-3xl bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex gap-3 sm:gap-4">

                    {/* Food Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28"
                    />

                    {/* Food Info */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate font-bold text-black sm:text-lg">
                            {item.name}
                          </h2>

                          {item.portion && (
                            <p className="mt-1 text-sm text-gray-500">
                              Portion:{" "}
                              <span className="font-semibold text-gray-700">
                                {item.portion}
                              </span>
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(
                              item.id,
                              item.portion
                            )
                          }
                          className="shrink-0 text-sm font-medium text-red-500 transition hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Price */}
                      <p className="mt-2 font-bold text-orange-600">
                        ₦{item.price.toLocaleString()}
                      </p>

                      {/* Quantity */}
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(
                              item.id,
                              item.portion
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-black transition active:scale-90"
                        >
                          −
                        </button>

                        <span className="w-5 text-center font-bold text-black">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(
                              item.id,
                              item.portion
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white transition active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Item subtotal */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-sm text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-bold text-black">
                      ₦
                      {(
                        item.price * item.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black text-black">
                Order Summary
              </h2>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span className="font-semibold text-black">
                  ₦{total.toLocaleString()}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-gray-500">
                  Delivery fee
                </span>

                <span className="text-sm text-gray-400">
                  Calculated at checkout
                </span>
              </div>

              <div className="my-4 border-t border-gray-100" />

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-black">
                  Total
                </span>

                <span className="text-2xl font-black text-orange-600">
                  ₦{total.toLocaleString()}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-5 block w-full rounded-full bg-orange-500 py-4 text-center font-bold text-white transition hover:bg-orange-600 active:scale-[0.99]"
              >
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}