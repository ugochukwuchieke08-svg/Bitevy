"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">

        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
          <Mail className="w-8 h-8 text-green-700" />
        </div>

        <h1 className="text-2xl font-black text-gray-900">
          Check your email
        </h1>

        <p className="text-gray-600 mt-3">
          We've sent you a confirmation link.
          Please check your inbox and confirm your email
          address before logging in.
        </p>

        <p className="text-sm text-gray-500 mt-4">
          Don't see it? Check your spam or junk folder.
        </p>

        <Link
          href="/login"
          className="block mt-6 bg-green-700 hover:bg-green-800 text-white py-4 rounded-2xl font-bold"
        >
          Back to Login
        </Link>

      </div>
    </main>
  );
}