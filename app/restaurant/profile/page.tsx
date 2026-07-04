import { createServerSupabaseClient } from "@/lib/supabase/server";
import EditRestaurantForm from "@/components/EditRestaurantForm";

export default async function RestaurantProfilePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <h1>Please login.</h1>;
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!restaurant) {
    return <h1>No restaurant found.</h1>;
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      <h1 className="text-3xl font-black text-black mb-8">
        Edit Restaurant
      </h1>

      <EditRestaurantForm restaurant={restaurant} />

    </main>
  );
}