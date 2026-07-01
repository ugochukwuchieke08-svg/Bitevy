"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  id: number;
};

export default function DeleteFoodButton({ id }: Props) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = confirm("Delete this food?");

    if (!confirmed) return;

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 text-white px-4 py-3 rounded-xl"
    >
      Delete
    </button>
  );
}