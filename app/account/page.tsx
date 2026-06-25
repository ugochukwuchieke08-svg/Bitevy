"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  console.log("PROFILE DATA:", profile);
  useEffect(() => {
    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);
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
  }, []);

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
    <main className="min-h-screen bg-[#fff8f0] p-5">

     <div className="flex items-center gap-3 mb-6">

  <button
    onClick={() => router.push("/")}
    className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-black text-xl"
  >
    ←
  </button>

  <h1 className="text-3xl text-black font-bold">
    My Account
  </h1>

</div>

      <main className="min-h-screen bg-[#fff8f0]">

  <div className="bg-white shadow rounded-b-[40px] p-6 text-white">


<div className="flex flex-col items-center">

  <div className="w-24 h-24 rounded-full bg-white shadow flex items-center justify-center text-4xl">
    👤
  </div>

<h1 className="text-black text-2xl font-bold mt-4">
  {profile?.full_name || "User"}
</h1>

  <p className="opacity-90">
    {profile?.email || user?.email}
  </p>

  <Link
  href="/account/edit"
  className="mt-4 bg-white text-green-700 px-5 py-2 rounded-full font-bold"
>
  Edit Profile
</Link>

</div>


  </div>

  <div className="p-5">


<div className="bg-white rounded-3xl p-5 mb-5">

  <h2 className="font-bold text-black mb-3">
    Contact Information
  </h2>

  <div className="space-y-4">

    <div>
      <p className="text-gray-500 text-sm">
        Phone
      </p>

      <p className="font-bold text-black">
        {profile?.phone || "Not added"}
      </p>
    </div>

    <div>
      <p className="text-gray-500 text-sm">
        Delivery Address
      </p>

      <p className="font-bold text-black">
        {profile?.address || "Not added"}
      </p>
    </div>

  </div>

</div>

<div className="bg-white text-gray-500 text rounded-3xl overflow-hidden">

  <Link href="/orders" className="flex justify-between p-5 border-b">
    <span>📦 My Orders</span>
    <span>›</span>
  </Link>

  <Link href="/favorites" className="flex justify-between p-5 border-b">
    <span>❤️ Favorites</span>
    <span>›</span>
  </Link>

  <Link href="/settings" className="flex justify-between p-5">
    <span>⚙️ Settings</span>
    <span>›</span>
  </Link>

</div>

  </div>

</main>


    </main>
  );
}