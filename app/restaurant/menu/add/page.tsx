"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Category = {
  id: number;
  name: string;
};

type Portion = {
  name: string;
  price: string;
};

export default function AddFoodPage() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Portions
  const [hasPortions, setHasPortions] = useState(false);

  const [portions, setPortions] = useState<Portion[]>([
    {
      name: "",
      price: "",
    },
  ]);

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Failed to load categories:", error);
        return;
      }

      setCategories(data || []);
    }

    loadCategories();
  }, []);

  function addPortion() {
    setPortions((current) => [
      ...current,
      {
        name: "",
        price: "",
      },
    ]);
  }

  function removePortion(index: number) {
    setPortions((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  function updatePortion(
    index: number,
    field: keyof Portion,
    value: string
  ) {
    setPortions((current) =>
      current.map((portion, i) =>
        i === index
          ? {
              ...portion,
              [field]: value,
            }
          : portion
      )
    );
  }

  async function handleSubmit() {
    if (saving) return;

    if (!user) {
      alert("Please login.");
      return;
    }

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

    if (!image) {
      alert("Please choose an image.");
      return;
    }

    // Validate portions
    if (hasPortions) {
      if (portions.length === 0) {
        alert("Please add at least one portion.");
        return;
      }

      const invalidPortion = portions.some(
        (portion) =>
          !portion.name.trim() ||
          !portion.price ||
          Number(portion.price) <= 0
      );

      if (invalidPortion) {
        alert("Please enter a name and valid price for every portion.");
        return;
      }
    }

    setSaving(true);

    try {
      // --------------------------------------------------
      // FIND RESTAURANT
      // --------------------------------------------------

      const { data: restaurant, error: restaurantError } =
        await supabase
          .from("restaurants")
          .select("id")
          .eq("owner_id", user.id)
          .single();

      if (restaurantError || !restaurant) {
        alert("You don't have a restaurant yet.");
        return;
      }

      // --------------------------------------------------
      // UPLOAD IMAGE
      // --------------------------------------------------

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
        alert(
          uploadData.error?.message ||
            "Image upload failed"
        );
        return;
      }

      const imageUrl = uploadData.secure_url;

      // --------------------------------------------------
      // CREATE FOOD
      // --------------------------------------------------

      const { data: food, error: foodError } =
        await supabase
          .from("menu_items")
          .insert({
            restaurant_id: restaurant.id,
            name: name.trim(),
            price: Number(price),
            image: imageUrl,
            category_id: Number(categoryId),
          })
          .select("id")
          .single();

      if (foodError || !food) {
        alert(
          foodError?.message ||
            "Failed to create food."
        );
        return;
      }

      // --------------------------------------------------
      // CREATE PORTIONS
      // --------------------------------------------------

      if (hasPortions) {
        const { data: optionGroup, error: groupError } =
          await supabase
            .from("menu_item_option_groups")
            .insert({
              menu_item_id: food.id,
              name: "Portion",
              selection_type: "single",
              required: true,
              min_selections: 1,
              max_selections: 1,
            })
            .select("id")
            .single();

        if (groupError || !optionGroup) {
          console.error("Option group error:", groupError);

          // Remove food if portion setup failed
          await supabase
            .from("menu_items")
            .delete()
            .eq("id", food.id);

          alert(
            groupError?.message ||
              "Failed to create portion group."
          );

          return;
        }

        const optionRows = portions.map((portion) => ({
          option_group_id: optionGroup.id,
          name: portion.name.trim(),
          price: Number(portion.price),
        }));

        const { error: optionsError } =
          await supabase
            .from("menu_item_options")
            .insert(optionRows);

        if (optionsError) {
          console.error(
            "Portion options error:",
            optionsError
          );

          // Clean up what we created
          await supabase
            .from("menu_item_option_groups")
            .delete()
            .eq("id", optionGroup.id);

          await supabase
            .from("menu_items")
            .delete()
            .eq("id", food.id);

          alert(
            optionsError.message ||
              "Failed to create portions."
          );

          return;
        }
      }

      // --------------------------------------------------
      // SUCCESS
      // --------------------------------------------------

      alert(
        hasPortions
          ? "Food and portions added successfully!"
          : "Food added successfully!"
      );

      router.push("/restaurant/menu");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5 pb-10">

      <h1 className="text-3xl font-black text-black mb-8">
        Add Food
      </h1>

      <div className="space-y-5">

        {/* FOOD NAME */}
        <input
          placeholder="Food name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

        {/* BASE PRICE */}
        <input
          placeholder="Base price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

        {/* IMAGE */}
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

        {/* CATEGORY */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full text-black bg-white rounded-2xl p-4 border"
        >
          <option value="">
            Select category
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

        {/* PORTIONS */}
        <div className="bg-white rounded-3xl border p-5 space-y-5">

          <button
  type="button"
  onClick={() => setHasPortions((current) => !current)}
  className="w-full flex items-center justify-between text-left"
>
  <div>
    <h2 className="text-lg font-black text-black">
      Portions
    </h2>

    <p className="text-sm text-gray-500 mt-1">
      Let customers choose a portion size.
    </p>
  </div>

  <div
    className={`relative w-12 h-7 rounded-full transition ${
      hasPortions
        ? "bg-green-600"
        : "bg-gray-300"
    }`}
  >
    <span
      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
        hasPortions
          ? "left-6"
          : "left-1"
      }`}
    />
  </div>
</button>
          {hasPortions && (
            <div className="space-y-4">

              {portions.map((portion, index) => (
                <div
                  key={index}
                  className="bg-[#fff8f0] rounded-2xl p-4 space-y-3"
                >

                  <div className="flex items-center justify-between">

                    <span className="font-bold text-gray-800">
                      Portion {index + 1}
                    </span>

                    {portions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removePortion(index)
                        }
                        className="text-red-500 text-sm font-semibold"
                      >
                        Remove
                      </button>
                    )}

                  </div>

                  <input
                    type="text"
                    placeholder="e.g. Half Portion"
                    value={portion.name}
                    onChange={(e) =>
                      updatePortion(
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    className="w-full bg-white rounded-2xl p-3 border text-black"
                  />

                  <input
                    type="number"
                    placeholder="Price"
                    value={portion.price}
                    onChange={(e) =>
                      updatePortion(
                        index,
                        "price",
                        e.target.value
                      )
                    }
                    className="w-full bg-white rounded-2xl p-3 border text-black"
                  />

                </div>
              ))}

              <button
                type="button"
                onClick={addPortion}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-green-600 text-green-700 font-bold"
              >
                + Add Another Portion
              </button>

            </div>
          )}

        </div>

        {/* SAVE */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className={`w-full py-4 rounded-2xl font-bold text-white ${
            saving
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-700"
          }`}
        >
          {saving
            ? "Saving..."
            : "Save Food"}
        </button>

      </div>

    </main>
  );
}