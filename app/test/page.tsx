import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*");

  if (error) {
    return (
      <main className="p-10 text-red-500">
        Error: {error.message}
      </main>
    );
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-5">
        Restaurants
      </h1>

      {data?.map((restaurant) => (
        <div
          key={restaurant.id}
          className="border p-4 rounded mb-3"
        >
          {restaurant.name}
        </div>
      ))}
    </main>
  );
}