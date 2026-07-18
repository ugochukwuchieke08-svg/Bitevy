"use client";
import HomeMenu from "@/components/HomeMenu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";
export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  if (authLoading) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      Loading...
    </main>
  );
}
  console.log("PROFILE DATA:", profile);
  useEffect(() => {
    async function getProfile() {
      

      if (!user) {
        setLoading(false);
        return;
      }

      
const { data: profile, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();


console.log("PROFILE FROM SUPABASE:", profile);
console.log("PROFILE ERROR:", error);


setProfile(profile);
setLoading(false);
    }

    getProfile();
  }, [user]);

  if (loading) {
    return <div className="p-5">Loading...</div>;
  }

  if (!user) {
    return (
      <main className="p-5">
        <h1>Please login</h1>

        <Link href="/login?redirect=/account">
          Login
        </Link>
      </main>
    );
  }
  return (
  <main className="min-h-screen bg-[#fff8f0] pb-32">

    {/* Header */}
    <header className="sticky top-0 z-40 bg-[#fff8f0]/90 backdrop-blur-xl px-5 pt-5 pb-4">

      <div className="flex items-center justify-between">

        <button
          onClick={() => router.push("/")}
          className="h-11 w-11 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700"
        >
          ←
        </button>

        <h1 className="text-2xl font-black text-gray-900">
          My Account
        </h1>

        <HomeMenu />

      </div>

    </header>

    {/* Profile Card */}
    <section className="px-5 mt-6">

      <div className="rounded-[32px] bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-xl">

        <div className="flex items-center gap-5">

          <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-lg">

            <span className="text-5xl">
              👤
            </span>

          </div>

          <div className="flex-1">

            <h2 className="text-2xl font-black">
              {profile?.full_name || "User"}
            </h2>

            <p className="mt-1 text-orange-100">
              {profile?.email || user?.email}
            </p>

            <Link
              href="/account/edit"
              className="inline-block mt-4 rounded-full bg-white px-5 py-2 font-bold text-orange-600 shadow"
            >
              Edit Profile
            </Link>

          </div>

        </div>

      </div>

    </section>

    {/* Quick Stats */}
    <section className="px-5 mt-6">

      <div className="grid grid-cols-3 gap-4">

        <div className="rounded-3xl bg-white p-5 text-center shadow">

          <h3 className="text-3xl font-black text-orange-500">
            0
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Orders
          </p>

        </div>

        <div className="rounded-3xl bg-white p-5 text-center shadow">

          <h3 className="text-3xl font-black text-orange-500">
            0
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Favorites
          </p>

        </div>

        <div className="rounded-3xl bg-white p-5 text-center shadow">

          <h3 className="text-3xl font-black text-orange-500">
            ★
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Level
          </p>

        </div>

      </div>

    </section>

    {/* Contact */}
    <section className="px-5 mt-7">

      <h2 className="mb-3 text-xl text-black font-bold">
        Contact Information
      </h2>

      <div className="rounded-3xl bg-white p-5 shadow space-y-5">

        <div>

          <p className="text-sm text-gray-500">
            Phone Number
          </p>

          <p className="mt-1 font-bold text-gray-900">
            {profile?.phone || "Not added"}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Delivery Address
          </p>

          <p className="mt-1 font-bold text-gray-900">
            {profile?.address || "Not added"}
          </p>

        </div>

      </div>

    </section>

    {/* Menu */}
    <section className="px-5 mt-7">

      <div className="overflow-hidden rounded-3xl bg-white shadow">

        <Link
          href="/orders"
          className="flex items-center justify-between border-b p-5 hover:bg-orange-50"
        >
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
              📦
            </div>

            <span className="font-semibold text-gray-700">
              My Orders
            </span>

          </div>

          <span className="text-xl text-gray-400">
            ›
          </span>

        </Link>

        <Link
          href="/favorites"
          className="flex items-center justify-between border-b p-5 hover:bg-orange-50"
        >
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
              ❤️
            </div>

            <span className="font-semibold text-gray-700">
              Favorites
            </span>

          </div>

          <span className="text-xl text-gray-400">
            ›
          </span>

        </Link>

        <Link
          href="/settings"
          className="flex items-center justify-between p-5 hover:bg-orange-50"
        >
          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
              ⚙️
            </div>

            <span className="font-semibold text-gray-700">
              Settings
            </span>

          </div>

          <span className="text-xl text-gray-400">
            ›
          </span>

        </Link>

      </div>

    </section>

    <BottomNav />

  </main>
);
}