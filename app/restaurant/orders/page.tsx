import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function RestaurantOrdersPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    return <h1>Please login.</h1>;
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!restaurant) {
    return <h1>No restaurant found.</h1>;
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", {
      ascending: false,
    });

  const pending =
    orders?.filter(
      (o) => o.status === "pending"
    ) || [];

  const preparing =
    orders?.filter(
      (o) => o.status === "preparing"
    ) || [];

  const ready =
    orders?.filter(
      (o) => o.status === "ready"
    ) || [];

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      <h1 className="text-3xl font-black text-black mb-8">
        Restaurant Orders
      </h1>

      <OrderSection
        title="🟠 New Orders"
        orders={pending}
      />

      <OrderSection
        title="🔵 Preparing"
        orders={preparing}
      />

      <OrderSection
        title="🟢 Ready"
        orders={ready}
      />

    </main>
  );
}

function OrderSection({
  title,
  orders,
}: {
  title: string;
  orders: any[];
}) {
  return (
    <section className="mb-10">

      <h2 className="text-2xl font-bold text-black mb-4">
        {title}
      </h2>

      {orders.length === 0 ? (

        <div className="bg-white rounded-2xl p-5 text-gray-500">
          No orders
        </div>

      ) : (

        <div className="space-y-4">

          {orders.map((order) => (

            <Link
              key={order.id}
              href={`/restaurant/orders/${order.id}`}
              className="block bg-white rounded-3xl p-5 shadow"
            >

              <div className="flex justify-between">

                <div>

                  <h3 className="text-xl font-bold text-black">
                    {order.customer_name}
                  </h3>

                  <p className="text-gray-500">
                    {order.phone}
                  </p>

                </div>

                <p className="text-green-700 font-black text-xl">
                  ₦{order.total.toLocaleString()}
                </p>

              </div>

              <p className="mt-4 text-gray-600">
                {order.delivery_address}
              </p>

            </Link>

          ))}

        </div>

      )}

    </section>
  );
}