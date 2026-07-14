"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
export default function RestaurantSignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [delivery, setDelivery] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const { user, loading: authLoading } = useAuth();
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }
  async function handleSubmit() {
  

    if (!user) {
      alert("Please login.");
      return;
    }

    if (!image) {
      alert("Choose an image.");
      return;
    }

    const formData = new FormData();

    formData.append("file", image);

    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const upload = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadData = await upload.json();

    const imageUrl = uploadData.secure_url;

    const { error } = await supabase
      .from("restaurants")
      .insert({
        owner_id: user.id,
        name,
        image: imageUrl,
        rating: 5,
        time,
        delivery,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Restaurant created!");

    router.push("/restaurant/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      <h1 className="text-3xl font-black text-black mb-8">
        Register Restaurant
      </h1>

      <div className="space-y-5">

        {preview ? (
          <img
            src={preview}
            className="w-full h-56 object-cover rounded-3xl"
          />
        ) : (
          <div className="w-full h-56 rounded-3xl border-2 border-dashed flex items-center justify-center bg-white text-black">
            Restaurant Image
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (!e.target.files?.length) return;

            const file = e.target.files[0];

            setImage(file);

            setPreview(URL.createObjectURL(file));
          }}
          className="w-full text-gray-500"
        />

        <input
          placeholder="Restaurant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

        <input
          placeholder="Delivery time (e.g. 20-30 mins)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

        <input
          placeholder="Delivery fee (e.g. ₦1000)"
          value={delivery}
          onChange={(e) => setDelivery(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold"
        >
          Create Restaurant
        </button>

      </div>

    </main>
  );
}