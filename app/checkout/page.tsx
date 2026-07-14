"use client";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const cart = useCartStore((state) => state.cart);



  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const clearCart = useCartStore(
    (state) => state.clearCart
  );


  

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [deliveryAreas, setDeliveryAreas] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<any>(null);

  const SERVICE_FEE = 150;

   const subtotal = cart.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);

const deliveryFee = selectedArea?.fee || 0;

const total = subtotal + deliveryFee + SERVICE_FEE;


   useEffect(() => {
  async function loadProfile() {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, address")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    setName(profile.full_name || "");
    setPhone(profile.phone || "");
    setAddress(profile.address || "");
  }

  async function loadDeliveryAreas() {
  const { data, error } = await supabase
    .from("delivery_areas")
    .select("*")
    .eq("is_active", true)
    .order("fee");

  if (!error) {
    setDeliveryAreas(data || []);
  }
}

loadDeliveryAreas();

  loadProfile();
}, [user]);

    if (authLoading) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      Loading...
    </main>
  );
}

 const handleOrder = async () => {


  if (loading) return;
  try{
  setLoading(true);

 if (!name || !phone || !address) {
    alert("Please fill all required fields");
    return;
}

if (!selectedArea) {
  alert("Please select a delivery area.");
  return;
}


// TEMP: Disable auth while building payments
if (!user) {
  alert("Please login first");
  setLoading(false);
  router.push("/login");
  return;
}

  const restaurantId = cart[0]?.restaurant_id;
  console.log(cart);

 if (cart.length === 0) {
  alert("Cart is empty");
  setLoading(false);
  return;
}

const { data: restaurant, error: restaurantError } = await supabase
  .from("restaurants")
  .select("owner_id, is_open")
  .eq("id", restaurantId)
  .single();

if (restaurantError) {
  console.error(restaurantError);
  alert("Unable to verify restaurant.");
  return;
}

if (!restaurant.is_open) {
  alert("Sorry, this restaurant is currently closed.");
  return;
}

console.log("Sending cart:", cart);

console.log(
  "Mapped cart:",
  cart.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  }))
);

const response = await fetch("/api/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
  cart: cart.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  })),
  userId: user.id,
  name,
  phone,
  address,
  note,
  deliveryAreaId: selectedArea.id,
}),
});

const result = await response.json();
if (!response.ok) {
  alert(result.error);
  setLoading(false);
  return;
}

console.log(result);


 const payment = await fetch("/api/opay/initiate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    orderId: result.orderId,
    paymentReference: result.paymentReference,
    total: result.total,
    customerName: name,
    customerPhone: phone,

    // Replace with the logged-in user's email later
    customerEmail: user?.email,
  }),
});

const paymentResult = await payment.json();

if (!payment.ok) {
  alert(paymentResult.error);
  return;
}

clearCart();

router.push(paymentResult.paymentUrl);

} catch (error) {
    console.error(error);
    alert("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      <h1 className="text-3xl font-bold text-black mb-6">
        Checkout
      </h1>

      <div className="bg-white rounded-3xl p-5 space-y-4">

        <input
        disabled={loading}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full border rounded-xl p-3 text-black"
        />

        <input
        disabled={loading}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          className="w-full border rounded-xl p-3 text-black"
        />

        <select
        disabled={loading}
        value={selectedArea?.id || ""}
        onChange={(e) => {
          const area = deliveryAreas.find(
            (a) => a.id === Number(e.target.value)
          );

          setSelectedArea(area);
        }}
        className="w-full border rounded-xl p-3 text-black"
      >
        <option value="">Select Delivery Area</option>

        {deliveryAreas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.name} - ₦{area.fee.toLocaleString()}
          </option>
        ))}
      </select>

        <textarea
        disabled={loading}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Detailed Delivery Address (House No., Street, Landmark...)"
          className="w-full border rounded-xl p-3 text-black"
          rows={3}
        />

        <textarea
        disabled={loading}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Order Notes (Optional)"
          className="w-full border rounded-xl p-3 text-black"
          rows={3}
        />

      </div>

      <div className="bg-white rounded-3xl p-5 mt-6">

        <h2 className="text-xl font-bold text-black">
          Order Summary
        </h2>

        <div className="space-y-2 mt-4">

        <div className="flex justify-between text-black">
          <span>Food Total</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-black">
          <span>Delivery Fee</span>
          <span>₦{deliveryFee.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-black">
          <span>Service Fee</span>
          <span>₦{SERVICE_FEE.toLocaleString()}</span>
        </div>

        <hr />

        <div className="flex justify-between text-xl font-bold text-green-700">
          <span>Total</span>
          <span>₦{total.toLocaleString()}</span>
        </div>

      </div>

        <button
          onClick={handleOrder}
          disabled={loading}
          className={`
            w-full mt-6
            bg-green-700 hover:bg-green-800
            disabled:bg-green-400
            disabled:cursor-not-allowed
            text-white
            py-4
            rounded-full
            font-bold
            text-lg
            transition-all
            duration-200
            flex
            items-center
            justify-center
            shadow-lg
            hover:shadow-xl
          `}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Processing Order...
            </>
          ) : (
            "Continue to Payment"
          )}
      </button>

      </div>

    </main>
  );
}