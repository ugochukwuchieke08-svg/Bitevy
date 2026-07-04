"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
export default function EditProfilePage() {

  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      Loading...
    </main>
  );
}

  useEffect(() => {

    async function loadProfile(){



      if(!user){
        router.push("/login?redirect=/account/edit");
        return;
      }


      setUserId(user.id);


      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();


      if(data){

        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");

      }


      setLoading(false);

    }


    loadProfile();

  }, [router]);



  async function saveProfile() {

setSaving(true);

const {
data: { user }
} = await supabase.auth.getUser();

if (!user) {
alert("Please login again");
return;
}

const { data, error } = await supabase
.from("profiles")
.upsert({
id: user.id,
email: user.email,
full_name: fullName,
phone,
address,
})
.select();

console.log("UPSERT DATA:", data);
console.log("UPSERT ERROR:", error);

if (error) {
alert(error.message);
setSaving(false);
return;
}

setSaving(false);
router.push("/account");
}


  if(loading){

    return (
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center">

        <h1 className="font-bold text-black">
          Loading...
        </h1>

      </main>
    );

  }



  return (

    <main className="min-h-screen bg-[#fff8f0] p-5">


      <div className="flex items-center mb-6">

        <Link
          href="/account"
          className="text-green-700 font-bold"
        >
          ← Back
        </Link>


        <h1 className="text-3xl font-black text-black mx-auto">
          Edit Profile
        </h1>


      </div>



      <div className="bg-white rounded-3xl p-6 space-y-5">


        <div>

          <label className="text-gray-500 text-sm">
            Full Name
          </label>

          <input

            value={fullName}

            onChange={(e)=>setFullName(e.target.value)}

            className="w-full mt-2 p-4 rounded-2xl border text-black"

            placeholder="Your name"

          />

        </div>



        <div>

          <label className="text-gray-500 text-sm">
            Phone Number
          </label>

          <input

            value={phone}

            onChange={(e)=>setPhone(e.target.value)}

            className="w-full mt-2 p-4 rounded-2xl border text-black"

            placeholder="08012345678"

          />

        </div>




        <div>

          <label className="text-gray-500 text-sm">
            Delivery Address
          </label>

          <textarea

            value={address}

            onChange={(e)=>setAddress(e.target.value)}

            className="w-full mt-2 p-4 rounded-2xl border text-black h-32"

            placeholder="Enter delivery address"

          />

        </div>




        <button

          onClick={saveProfile}

          className="w-full bg-green-700 text-white py-4 rounded-full font-bold"

        >

          {saving ? "Saving..." : "Save Changes"}

        </button>



      </div>


    </main>

  );

}