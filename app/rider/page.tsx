"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RiderPage() {

const [orders, setOrders] = useState<any[]>([]);
const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
const [user, setUser] = useState<any>(null);
const [allowed, setAllowed] = useState(false);
const [loading, setLoading] = useState(true);
const [acceptingId, setAcceptingId] = useState<string | null>(null);
const [deliveringId, setDeliveringId] = useState<string | null>(null);

async function loadOrders() {


const {
  data: { user }
} = await supabase.auth.getUser();

if (!user) {
  setLoading(false);
  return;
}

setUser(user);

const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

if (profile?.role !== "rider") {
  setLoading(false);
  return;
}

setAllowed(true);

const { data: availableOrders } = await supabase
  .from("orders")
  .select("*")
  .eq("status", "pending")
  .is("rider_id", null)
  .order("created_at", { ascending: false });

const { data: myOrders } = await supabase
  .from("orders")
  .select("*")
  .eq("rider_id", user.id)
  .eq("status", "out_for_delivery")
  .order("created_at", { ascending: false });

setOrders(availableOrders || []);
setMyDeliveries(myOrders || []);

setLoading(false);


}

useEffect(() => {


loadOrders();




}, []);

async function acceptOrder(orderId: string) {

  if (!user) return;

  setAcceptingId(orderId);

  const { error } = await supabase
    .from("orders")
    .update({
      rider_id: user.id,
      status: "out_for_delivery",
    })
    .eq("id", orderId);

  if (error) {
    console.log(error);
    setAcceptingId(null);
    return;
  }

  await loadOrders();

  setAcceptingId(null);
}

async function markDelivered(orderId: string) {

  setDeliveringId(orderId);

  const { error } = await supabase
    .from("orders")
    .update({
      status: "delivered",
    })
    .eq("id", orderId);

  if (error) {
    console.log(error);
    setDeliveringId(null);
    return;
  }

  await loadOrders();

  setDeliveringId(null);
}

if (loading) {
return ( <main className="p-5"> <h1 className="text-black">
Loading... </h1> </main>
);
}

if (!allowed) {
return ( <main className="p-5"> <h1 className="text-red-600 text-3xl font-bold">
Access Denied </h1> </main>
);
}

return ( <main className="min-h-screen bg-[#fff8f0] p-5">


  <h1 className="text-3xl font-black text-black mb-6">
    Rider Dashboard
  </h1>

  <h2 className="text-2xl font-black text-black mb-5">
    Available Orders
  </h2>

  {orders.length === 0 ? (

    <div className="bg-white rounded-3xl p-5">
      <p className="text-gray-600">
        No deliveries available.
      </p>
    </div>

  ) : (

    <div className="space-y-5">

      {orders.map((order) => (

        <div
          key={order.id}
          className="bg-white rounded-3xl p-5"
        >

          <h2 className="font-bold text-xl text-black">
            Order #{order.id.slice(0, 8)}
          </h2>

          <div className="mt-4 space-y-2">

            <p className="text-black">
              👤 {order.customer_name}
            </p>

            <p className="text-black">
              📞 {order.phone}
            </p>

            <p className="text-black">
              📍 {order.delivery_address}
            </p>

            <p className="font-bold text-green-700">
              ₦{order.total.toLocaleString()}
            </p>

          </div>

          <button
          onClick={() => acceptOrder(order.id)}
          disabled={acceptingId === order.id}
          className="mt-5 bg-green-700 text-white px-5 py-3 rounded-full font-bold disabled:opacity-50"
        >
          {acceptingId === order.id
            ? "Accepting..."
            : "Accept Delivery"}
        </button>

        </div>

      ))}

    </div>

  )}

  <h2 className="text-2xl font-black text-black mt-10 mb-5">
    My Deliveries
  </h2>

  {myDeliveries.length === 0 ? (

    <div className="bg-white rounded-3xl p-5">
      <p className="text-gray-600">
        No active deliveries.
      </p>
    </div>

  ) : (

    <div className="space-y-5">

      {myDeliveries.map((order) => (

        <div
          key={order.id}
          className="bg-white rounded-3xl p-5"
        >

          <h2 className="font-bold text-xl text-black">
            Order #{order.id.slice(0, 8)}
          </h2>

          <p className="mt-3 font-bold text-green-700">
            ₦{order.total.toLocaleString()}
          </p>

         <button
            onClick={() => markDelivered(order.id)}
            disabled={deliveringId === order.id}
            className="mt-5 bg-blue-700 text-white px-5 py-3 rounded-full font-bold disabled:opacity-50"
          >
            {deliveringId === order.id
              ? "Updating..."
              : "Mark Delivered"}
          </button>

        </div>

      ))}

    </div>

  )}

</main>


);
}
