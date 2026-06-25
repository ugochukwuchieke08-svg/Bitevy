import Link from "next/link";

export default function ChooseRolePage() {
  return (
    <main className="min-h-screen bg-[#fff8f0] p-5 flex flex-col justify-center">

      <h1 className="text-4xl font-black text-center text-black mb-10">
        Join Bitevy
      </h1>

      <div className="space-y-5 max-w-md mx-auto w-full">

        <Link
          href="/signup?role=customer"
          className="block bg-white rounded-3xl p-6 shadow"
        >
          <h2 className="text-2xl font-bold text-black">
            👤 Customer
          </h2>

          <p className="text-gray-600 mt-2">
            Order food from nearby restaurants
          </p>
        </Link>

        <Link
          href="/signup/rider"
          className="block bg-white rounded-3xl p-6 shadow"
        >
          <h2 className="text-2xl font-bold text-black">
            🏍 Rider
          </h2>

          <p className="text-gray-600 mt-2">
            Deliver orders and earn money
          </p>
        </Link>

        <Link
          href="/restaurant-signup"
          className="block bg-white rounded-3xl p-6 shadow"
        >
          <h2 className="text-2xl font-bold text-black">
            🍔 Restaurant
          </h2>

          <p className="text-gray-600 mt-2">
            Sell food on Bitevy
          </p>
        </Link>

      </div>

    </main>
  );
}