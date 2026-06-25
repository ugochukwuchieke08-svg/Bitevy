"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RiderSignupPage() {

const router = useRouter();

const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [bikeType, setBikeType] = useState("");

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [loading, setLoading] = useState(false);

async function handleSignup() {


if (
  !fullName ||
  !phone ||
  !bikeType ||
  !email ||
  !password
) {
  alert("Please fill all fields");
  return;
}

setLoading(true);



// Create auth account

const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

if (error) {
  alert(error.message);
  setLoading(false);
  return;
}

const user = data.user;

if (!user) {
  alert("User creation failed");
  setLoading(false);
  return;
}



// Create profile

const { error: profileError } = await supabase
  .from("profiles")
  .update({
    full_name: fullName,
    phone: phone,
    role: "rider",
  })
  .eq("id", user.id);

if (profileError) {
 console.log("PROFILE ERROR:", profileError);
  alert("Profile creation failed");
  setLoading(false);
  return;
}



// Create rider record

const { error: riderError } = await supabase
  .from("rider_applications")
  .insert({
    user_id: user.id,
    full_name: fullName,
    phone,
    bike_type: bikeType,
    status: "active",
  });

if (riderError) {
  console.log(riderError);
  alert("Rider registration failed");
  setLoading(false);
  return;
}



alert("Rider account created!");

router.push("/rider");


}

return (


<main className="min-h-screen bg-[#fff8f0] p-5 flex items-center justify-center">

  <div className="bg-white rounded-3xl p-6 w-full max-w-md">

    <h1 className="text-3xl font-black text-black mb-6">
      Become a Rider
    </h1>



    <div className="space-y-4">

      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full Name"
        className="w-full border rounded-xl p-3 text-black"
      />



      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone Number"
        className="w-full border rounded-xl p-3 text-black"
      />



      <input
        value={bikeType}
        onChange={(e) => setBikeType(e.target.value)}
        placeholder="Bike Type"
        className="w-full border rounded-xl p-3 text-black"
      />



      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border rounded-xl p-3 text-black"
      />



      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border rounded-xl p-3 text-black"
      />



      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full bg-green-700 text-white py-4 rounded-full font-bold"
      >
        {loading
          ? "Creating Account..."
          : "Create Rider Account"}
      </button>

    </div>

  </div>

</main>


);

}
