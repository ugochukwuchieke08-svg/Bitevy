"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  Save,
  Tag,
  Utensils,
  Banknote,
  Loader2,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
};

export default function EditFoodPage() {
  const { id } = useParams();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFood();
    loadCategories();
  }, []);

  async function handleImageUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Image must be smaller than 5MB.");
    return;
  }

  setUploading(true);

  try {
    const formData = new FormData();

    formData.append("file", file);

    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message || "Image upload failed."
      );
    }

    setImage(data.secure_url);
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to upload image."
    );
  } finally {
    setUploading(false);
  }
}

  async function loadFood() {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      alert("Food item could not be found.");
      router.push("/restaurant/menu");
      return;
    }

    setName(data.name || "");
    setPrice(data.price?.toString() || "");
    setImage(data.image || "");
    setCategoryId(data.category_id?.toString() || "");

    setLoading(false);
  }

  async function loadCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    setCategories(data || []);
  }

  async function saveChanges() {
    if (!name.trim()) {
      alert("Please enter the food name.");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (!categoryId) {
      alert("Please select a category.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("menu_items")
      .update({
        name: name.trim(),
        price: Number(price),
        image: image.trim(),
        category_id: Number(categoryId),
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/restaurant/menu");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-semibold">Loading food...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] pb-12">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#fff8f0]/90 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center">

          <Link
            href="/restaurant/menu"
            className="w-10 h-10 rounded-full bg-white border border-black/5 shadow-sm flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </Link>

          <div className="ml-4">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">
              Menu Management
            </p>

            <h1 className="text-xl font-black text-gray-950">
              Edit Food
            </h1>
          </div>

        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 pt-7">

        {/* Intro */}
        <div className="mb-7">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
            Update your dish
          </h2>

          <p className="mt-2 text-gray-500">
            Keep your menu information accurate so customers know exactly
            what they're ordering.
          </p>
        </div>

        {/* Image Preview */}
        <section className="bg-white rounded-[28px] border border-black/5 shadow-sm overflow-hidden mb-5">

          <div className="relative h-56 sm:h-72 bg-gray-100">

            {image ? (
              <img
                src={image}
                alt={name || "Food preview"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <ImageIcon className="w-7 h-7" />
                </div>

                <p className="mt-3 text-sm font-semibold">
                  No image preview
                </p>
              </div>
            )}

            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                Food Preview
              </span>
            </div>

          </div>

        </section>

        {/* Form */}
        <section className="bg-white rounded-[28px] border border-black/5 shadow-sm p-5 sm:p-7">

          <div className="flex items-center gap-3 mb-7">

            <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-orange-600" />
            </div>

            <div>
              <h2 className="font-black text-gray-950">
                Food Information
              </h2>

              <p className="text-sm text-gray-500">
                Update the details customers will see.
              </p>
            </div>

          </div>

          <div className="space-y-6">

            {/* Food Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                <Utensils className="w-4 h-4 text-gray-400" />
                Food Name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jollof Rice & Chicken"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-950 font-semibold outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            {/* Price */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                <Banknote className="w-4 h-4 text-gray-400" />
                Price
              </label>

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-500">
                  ₦
                </span>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-4 text-gray-950 font-bold outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />

              </div>
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                <Tag className="w-4 h-4 text-gray-400" />
                Category
              </label>

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-950 font-semibold outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="">
                  Select a category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                Image URL
              </label>

              <div>
  <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
    <ImageIcon className="w-4 h-4 text-gray-400" />
    Food Image
  </label>

  <div className="relative">

    <input
      id="food-image"
      type="file"
      accept="image/*"
      onChange={handleImageUpload}
      disabled={uploading}
      className="hidden"
    />

    <label
      htmlFor="food-image"
      className={`w-full min-h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-orange-50 hover:border-orange-300 transition cursor-pointer flex flex-col items-center justify-center text-center px-5 ${
        uploading ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >

      {uploading ? (
        <>
          <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />

          <p className="mt-3 font-bold text-gray-800">
            Uploading image...
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Please wait
          </p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-orange-600" />
          </div>

          <p className="mt-3 font-bold text-gray-800">
            Choose food image
          </p>

          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG or WEBP • Max 5MB
          </p>
        </>
      )}

    </label>
        </div>

        {image && !uploading && (
          <div className="mt-3 flex items-center justify-between">

            <p className="text-xs font-semibold text-green-600">
              ✓ Image uploaded successfully
            </p>

            <button
              type="button"
              onClick={() => setImage("")}
              className="text-xs font-bold text-red-500 hover:text-red-600"
            >
              Remove
            </button>

          </div>
        )}
      </div>

              <p className="text-xs text-gray-400 mt-2">
                Use a direct image URL. The preview above updates automatically.
              </p>
            </div>

          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3">

            <Link
              href="/restaurant/menu"
              className="flex-1 h-14 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 transition active:scale-[0.98]"
            >
              Cancel
            </Link>

            <button
              onClick={saveChanges}
              disabled={saving}
              className="flex-[1.5] h-14 rounded-2xl bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-green-700/10 transition active:scale-[0.98]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}