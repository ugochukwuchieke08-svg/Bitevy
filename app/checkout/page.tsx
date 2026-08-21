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
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(true);

  
  useEffect(() => {
  async function calculateDelivery() {
    if (!user || cart.length === 0) {
      setDeliveryLoading(false);
      return;
    }

    const restaurantId = cart[0]?.restaurant_id;

    if (!restaurantId) {
      setDeliveryLoading(false);
      return;
    }

    try {
      setDeliveryLoading(true);

      const response = await fetch("/api/delivery/estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          restaurantId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(result.error);
        setDeliveryFee(0);
        setDistanceKm(null);
        return;
      }

      setDeliveryFee(result.deliveryFee);
      setDistanceKm(result.distanceKm);
    } catch (error) {
      console.error("Delivery calculation failed:", error);
      setDeliveryFee(0);
      setDistanceKm(null);
    } finally {
      setDeliveryLoading(false);
    }
  }

  calculateDelivery();
}, [user, cart]);

  const SERVICE_FEE = 150;

   const subtotal = cart.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);

const total = subtotal + deliveryFee + SERVICE_FEE;

 // LOAD PROFILE
useEffect(() => {
  async function loadProfile() {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .single();

    if (profile) {
      setName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }

  loadProfile();
}, [user]);


// LOAD SAVED MAP LOCATION
useEffect(() => {
  async function loadSavedLocation() {
    if (!user) return;

    const { data: location, error } = await supabase
      .from("addresses")
      .select("address, latitude, longitude")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle();

    if (error) {
      console.error("Failed to load saved location:", error);
      return;
    }

    if (location) {
      setAddress(location.address || "");
    }
  }

  loadSavedLocation();
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

  if (!name || !phone || !address) {
    alert("Please fill all required fields");
    return;
  }

  if (!user) {
    alert("Please login first");
    router.push("/login");
    return;
  }

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  if (deliveryLoading || distanceKm === null) {
    alert("Please wait for delivery calculation to finish.");
    return;
  }

  // Open confirmation modal
  setShowAddressModal(true);
};
const confirmAddressAndPlaceOrder = async () => {
  if (loading || !user) return;

  try {
    setLoading(true);

    const restaurantId = cart[0]?.restaurant_id;

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

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      cart: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          portion: item.portion ?? null,
          portion_id: item.portion_id ?? null,
        })),
        userId: user.id,
        name,
        phone,
        address,
        note,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error);
      return;
    }

    console.log("Checkout result:", result);

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
        customerEmail: user.email,
      }),
    });

    const paymentResult = await payment.json();

    if (!payment.ok) {
      alert(paymentResult.error);
      return;
    }

    setShowAddressModal(false);

    if (paymentResult.bypass) {
      clearCart();
      router.push("/order-success");
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
          <textarea
            disabled={loading}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your saved delivery location"
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
            <span>
              <span>Delivery Fee</span>

              {distanceKm !== null && (
                <span className="block text-xs text-gray-500">
                  {distanceKm.toFixed(1)} km away
                </span>
              )}
            </span>

            <span>
              {deliveryLoading
                ? "Calculating..."
                : `₦${deliveryFee.toLocaleString()}`}
            </span>
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
          disabled={loading || deliveryLoading || distanceKm === null}
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
          ) : deliveryLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Calculating Delivery...
            </>
          ) : (
            "Continue to Payment"
          )}
      </button>

      </div>
{showAddressModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-3xl px-5">
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

      <h2 className="text-2xl font-bold text-gray-900">
        Confirm delivery address
      </h2>

      <p className="mt-3 text-sm text-gray-500">
        Please confirm that you want your order delivered to:
      </p>

      <div className="mt-4 rounded-2xl bg-orange-50 border border-orange-100 p-4">
        <p className="text-xs font-semibold text-orange-600 uppercase">
          Delivering to
        </p>

        <p className="mt-1 text-base font-bold text-gray-900">
          {address}
        </p>
      </div>

      {distanceKm !== null && (
        <p className="mt-3 text-sm text-gray-500">
          📍 {distanceKm.toFixed(1)} km from the restaurant
        </p>
      )}

      <div className="mt-6 flex gap-3">

        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setShowAddressModal(false);
            router.push("/location");
          }}
          className="flex-1 rounded-full border border-gray-200 py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Change Location
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={confirmAddressAndPlaceOrder}
          className="flex-1 rounded-full bg-green-700 py-3 font-bold text-white hover:bg-green-800 disabled:bg-green-400"
        >
          {loading ? "Processing..." : "Confirm & Continue"}
        </button>

      </div>

    </div>
  </div>
)}
    </main>
  );
}