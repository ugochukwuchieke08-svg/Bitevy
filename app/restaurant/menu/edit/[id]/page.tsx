"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

export default function EditFoodPage() {
  const { id } = useParams();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    loadFood();
    loadCategories();
  }, []);

  async function loadFood() {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", id)
      .single();

    if (!data) return;

    setName(data.name);
    setPrice(data.price.toString());
    setImage(data.image);
    setCategoryId(data.category_id.toString());
  }

  async function loadCategories() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    setCategories(data || []);
  }

  async function saveChanges() {
    const { error } = await supabase
      .from("menu_items")
      .update({
        name,
        price: Number(price),
        image,
        category_id: Number(categoryId),
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Food updated.");

    router.push("/restaurant/menu");
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      <h1 className="text-3xl font-black text-black mb-8">
        Edit Food
      </h1>

      <div className="space-y-5">

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        >
          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        <button
          onClick={saveChanges}
          className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold"
        >
          Save Changes
        </button>

      </div>

    </main>
  );
}