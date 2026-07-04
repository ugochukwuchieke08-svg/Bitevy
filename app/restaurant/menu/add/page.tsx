"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";


  type Category = {
  id: number;
  name: string;
};

export default function AddFoodPage() {
  const router = useRouter();

 const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [categoryId, setCategoryId] = useState("");
  
 const { user, loading: authLoading } = useAuth();

if (authLoading) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      Loading...
    </main>
  );
} 
  

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      setCategories(data || []);
    }

    loadCategories();
  }, []);

  async function handleSubmit() {
      
     if (saving) return;

     setSaving(true);

      if (!user) {
        alert("Please login.");
        return;
      }

      const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (restaurantError || !restaurant) {
      alert("You don't have a restaurant yet.");
      return;
    }

    if (!image) {
    alert("Please choose an image.");
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

if (!upload.ok) {
  alert(uploadData.error?.message || "Image upload failed");
  return;
}

const imageUrl = uploadData.secure_url;
console.log("Image URL:", imageUrl);
    const { error } = await supabase
      .from("menu_items")
      .insert({
        restaurant_id: restaurant.id, 
        name,
        price: Number(price),
        image: imageUrl,
        category_id: Number(categoryId),
       
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Food added successfully!");

    router.push("/restaurant/menu");
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      <h1 className="text-3xl font-black text-black mb-8">
        Add Food
      </h1>

      <div className="space-y-5">

        <input
          placeholder="Food name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

        

        <input
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

     <div className="space-y-3">

          {preview ? (

            <img
              src={preview}
              alt="Preview"
              className="w-full h-56 object-cover rounded-3xl border"
            />

          ) : (

            <div className="w-full h-56 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-white text-gray-500">

              📷 Choose Food Image

            </div>

          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {

              if (!e.target.files?.[0]) return;

              const file = e.target.files[0];

              setImage(file);

              setPreview(URL.createObjectURL(file));

            }}
           className="w-full bg-white rounded-2xl p-4 border text-black"
          />

        </div>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full text-black bg-white rounded-2xl p-4 border"
        >
          <option value="">Select category</option>

          {categories.map((category: any) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
       <button
        onClick={handleSubmit}
        disabled={saving}
        className={`w-full py-4 rounded-2xl font-bold text-white ${
          saving
            ? "bg-green-400 cursor-not-allowed"
            : "bg-green-700"
        }`}
      >
        {saving ? "Saving..." : "Save Food"}
      </button>

      </div>

    </main>
  );
}