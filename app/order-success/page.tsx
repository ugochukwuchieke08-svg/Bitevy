import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center p-5">

      <div className="bg-white rounded-3xl p-8 text-center max-w-md w-full">

        <div className="text-6xl mb-4">
          ✅
        </div>

        <h1 className="text-3xl font-bold text-black">
          Order Placed
        </h1>

        <p className="text-gray-600 mt-3">
          Your restaurant is preparing your food.
        </p>

        <Link
          href="/"
          className="block mt-6 bg-green-700 text-white py-4 rounded-full font-bold"
        >
          Back Home
        </Link>

      </div>

    </main>
  );
}