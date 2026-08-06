"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";


export default function RiderPage() {

const [orders, setOrders] = useState<any[]>([]);
const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
const [user, setUser] = useState<any>(null);
const [applicationStatus, setApplicationStatus] = useState<
  "pending" | "active" | "rejected" | "none" | null
>(null);
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

const { data: application, error: applicationError } = await supabase
  .from("rider_applications")
  .select("status")
  .eq("user_id", user.id)
  .maybeSingle();

if (applicationError) {
  console.error("Rider application check failed:", applicationError);
  setApplicationStatus("none");
  setLoading(false);
  return;
}

if (!application) {
  setApplicationStatus("none");
  setLoading(false);
  return;
}

setApplicationStatus(application.status);

if (application.status !== "active") {
  setLoading(false);
  return;
};

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
  .eq("status", "ready")
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
    .eq("id", orderId)
    .is("rider_id", null);

  if (error) {
    console.log(error);
    setAcceptingId(null);
    return;
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("user_id")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    console.log(orderError);
    setAcceptingId(null);
    return;
  }

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: order.user_id,
      order_id: orderId,
      title: "Rider Assigned",
      message: "Your rider is on the way.",
      link: `/orders/${orderId}`,
    });

  if (notificationError) {
    console.log(notificationError);
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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("user_id")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    console.log(orderError);
    setDeliveringId(null);
    return;
  }

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: order.user_id,
      order_id: orderId,
      title: "Order Delivered",
      message: "Your food has been delivered.",
      link: `/orders/${orderId}`,
    });

  if (notificationError) {
    console.log(notificationError);
  }

  await loadOrders();

  setDeliveringId(null);
} 

if (loading) {
return ( <main className="p-5"> <h1 className="text-black">
Loading... </h1> </main>
);
}

if (applicationStatus === "none") {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
          <span className="text-4xl">🏍️</span>
        </div>

        <h1 className="text-2xl text-black font-bold text-slate-900">
          Become a Bitevy Rider
        </h1>

        <p className="mt-3 text-gray-700 text-slate-600 leading-relaxed">
          You don't have a rider account yet. Register now to start receiving
          delivery requests and earning with Bitevy.
        </p>

        <a
          href="/signup/rider"
          className="mt-8 block w-full rounded-2xl bg-orange-500 py-4 text-center font-semibold text-white transition hover:bg-orange-600"
        >
          Register Now
        </a>

        <a
          href="/"
          className="mt-3 block w-full rounded-2xl border border-slate-300 py-4 text-center font-semibold text-gray-700 mtext-slate-700 transition hover:bg-slate-50"
        >
          Back to Home
        </a>
      </div>
    </main>
  );
}

if (applicationStatus === "pending") {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full text-gray-700 max-w-md bg-white rounded-3xl shadow-sm p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
          <span className="text-4xl">⏳</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Application Under Review
        </h1>

        <p className="mt-3 text-slate-600 leading-relaxed">
          Your rider application has been submitted successfully and is
          currently being reviewed by the Bitevy team.
        </p>

        <p className="mt-4 text-sm text-slate-500">
          We'll notify you once your application has been approved.
        </p>

        <a
          href="/"
          className="mt-8 block w-full rounded-2xl border border-slate-300 py-4 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Home
        </a>
      </div>
    </main>
  );
}

if (applicationStatus === "rejected") {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-4xl">✕</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Application Not Approved
        </h1>

        <p className="mt-3 text-slate-600 leading-relaxed">
          Unfortunately, your rider application was not approved at this time.
        </p>

        <a
          href="/"
          className="mt-8 block w-full rounded-2xl bg-orange-500 py-4 text-center font-semibold text-white transition hover:bg-orange-600"
        >
          Back to Bitevy
        </a>
      </div>
    </main>
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
