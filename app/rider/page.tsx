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
const [activeTab, setActiveTab] = useState("orders");

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

const { data: availableOrders, error } = await supabase
  .from("orders")
 .select(`
  *,
  restaurants (
    id,
    name
  ),
  order_items (
    name,
    quantity,
    price,
    image
  )
`)
  .eq("status", "pending")
  .is("rider_id", null)
  .order("created_at", { ascending: false });
console.log("AVAILABLE ORDERS:", availableOrders);
console.log("AVAILABLE ERROR:", error);

const { data: myOrders } = await supabase
  .from("orders")
 .select(`
  *,
  restaurants (
    id,
    name
  ),
  order_items (
    name,
    quantity,
    price,
    image
  )
`)
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

  setActiveTab("deliveries");
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

return ( <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-100 p-5">


 <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 p-8 mb-8 shadow-2xl">
  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

  <p className="text-orange-100 font-semibold tracking-wide">
    DELIVERY PARTNER
  </p>

  <h1 className="text-4xl font-black text-white mt-2">
    Rider Dashboard
  </h1>

  <p className="text-orange-100 mt-2">
    Manage deliveries and track active orders.
  </p>
</div>
<div className="flex bg-white p-1 rounded-2xl mb-6">
  <button
    onClick={() => setActiveTab("deliveries")}
    className={`flex-1 py-3 rounded-xl font-bold ${
      activeTab === "deliveries"
        ? "bg-green-600 text-white"
        : "text-gray-600"
    }`}
  >
    My Deliveries ({myDeliveries.length})
  </button>

  <button
    onClick={() => setActiveTab("orders")}
    className={`flex-1 py-3 rounded-xl font-bold ${
      activeTab === "orders"
        ? "bg-orange-500 text-white"
        : "text-gray-600"
    }`}
  >
    Available Orders ({orders.length})
  </button>
</div>

{activeTab === "orders" && (
  <>
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
            <div className="mt-4">


  <h3 className="font-bold text-black mb-2">
    Items
  </h3>

  {order.order_items?.map((item:any) => (
      
    <div key={item.name} className=" flex justify-between items-center py-3 border-b border-gray-100"
>
      <div className="bg-orange-50 rounded-2xl p-4 mb-4">

        <p className="font-bold text-orange-700">
          🍽️ {order.restaurants?.name}
        </p>

      </div>
      <div>

        <p className="font-semibold text-black">
          {item.name}
        </p>

        <p className="text-gray-500 text-sm">
          Qty: {item.quantity}
        </p>

      </div>

      <p className="font-bold text-green-700">
        ₦{item.price}
      </p>


    </div>

  ))}

</div>


            <div className="mt-5 bg-green-50 rounded-2xl p-4">

              <p className="text-gray-500 text-sm">
                Delivery Value
              </p>

              <p className="text-3xl font-black text-green-700">
                ₦{order.total.toLocaleString()}
              </p>

            </div>

          </div>

          <button
          onClick={() => acceptOrder(order.id)}
          disabled={acceptingId === order.id}
          className="mt-5 w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-2xl font-bold transition disabled:opacity-50"
        >
          {acceptingId === order.id
            ? "Accepting..."
            : "Accept Delivery"}
        </button>

        </div>

      ))}

    </div>
    
  )}
  </>
)}

{activeTab === "deliveries" && (
  <>
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

          <div className="mt-4">
  <h3 className="font-bold text-black mb-2">
    Items
  </h3>

  {order.order_items?.map((item:any) => (

    <div
      key={item.name}
      className="flex justify-between border-b py-2"
    >

      <div>

        <p className="font-semibold text-black">
          {item.name}
        </p>

        <p className="text-gray-500 text-sm">
          Qty: {item.quantity}
        </p>

      </div>

      <p className="font-bold text-green-700">
        ₦{item.price}
      </p>

    </div>

  ))}

</div>



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
</>
)}
</main>


);
}
