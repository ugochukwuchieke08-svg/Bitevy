import { createServerSupabaseClient } from "@/lib/supabase/server";


export default async function OrderDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) {
    return <h1>Order not found.</h1>;
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      <h1 className="text-3xl font-black text-black">
        Order #{order.id}
      </h1>

      <div className="bg-white rounded-3xl shadow mt-6 p-6">

        <h2 className="text-2xl font-bold text-black">
          {order.customer_name}
        </h2>

        <p className="text-gray-500 mt-2">
          {order.phone}
        </p>

        <p className="text-gray-500">
          {order.delivery_address}
        </p>

        {order.note && (
          <div className="mt-5">
            <h3 className="font-bold text-black">
              Note
            </h3>

            <p className="text-gray-600">
              {order.note}
            </p>
          </div>
        )}

      </div>

      {order.delivery_pin && (
  <div className="mt-6 bg-orange-50 border border-orange-200 rounded-3xl p-6 text-center">
    <p className="text-sm font-bold text-orange-700">
      DELIVERY PIN
    </p>

    <p className="mt-2 text-5xl font-black tracking-[0.35em] text-black">
      {order.delivery_pin}
    </p>

    <p className="mt-3 text-sm text-gray-600">
      Give this PIN to your rider only when your food arrives.
    </p>
  </div>
)}

      <div className="mt-8 bg-white rounded-3xl shadow p-6">

        <h2 className="text-2xl font-bold text-black mb-5">
          Ordered Items
        </h2>

        <div className="space-y-5">

          {items?.map((item) => (

            <div
              key={item.id}
              className="flex gap-4 items-center"
            >

              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-2xl object-cover"
              />

              <div className="flex-1">

                <h3 className="font-bold text-black">
                  {item.name}
                </h3>

                {item.portion && (
                  <p className="mt-1 text-sm font-semibold text-orange-600">
                    {item.portion} Portion
                  </p>
                )}

                <p className="text-gray-500">
                  Qty: {item.quantity}
                </p>

              </div>

              <p className="font-black text-green-700">
                ₦{(item.price * item.quantity).toLocaleString()}
              </p>

            </div>

          ))}

        </div>

      </div>

      <div className="mt-8 bg-white rounded-3xl shadow p-6">

        <div className="flex justify-between">

          <span className="text-xl text-black font-bold">
            Total
          </span>

          <span className="text-3xl text-green-700 font-black">
            ₦{order.total.toLocaleString()}
          </span>

        </div>

      </div>

    </main>
  );
}