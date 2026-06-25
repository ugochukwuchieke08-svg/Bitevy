"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";

export default function CheckoutPage() {
  const cart = useCartStore((state) => state.cart);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const router = useRouter();

  const clearCart = useCartStore(
    (state) => state.clearCart
  );

  const addOrder = useOrderStore(
  (state) => state.addOrder
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

 const handleOrder = async () => {

  if (!name || !phone || !address) {
    alert("Please fill all required fields");
    return;
  }


  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();


  if (!user) {
    alert("Please login first");
    router.push("/login");
    return;
  }

  
  const { data: order, error } = await supabase
    
    .from("orders")
    .insert({
      user_id: user.id,
      total: total,
      status: "pending",
      customer_name: name,
      phone: phone,
      delivery_address: address,
      note: note,
    })
    .select()
    .single();


  if(error){
    console.log(error);
    alert("Order failed");
    return;
  }



  const orderItems = cart.map((item)=>({
    order_id: order.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));



  const { error:itemError } = await supabase
    .from("order_items")
    .insert(orderItems);



  if(itemError){
    console.log(itemError);
    alert("Items failed");
    return;
  }



  clearCart();

  router.push("/order-success");

};

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      <h1 className="text-3xl font-bold text-black mb-6">
        Checkout
      </h1>

      <div className="bg-white rounded-3xl p-5 space-y-4">

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full border rounded-xl p-3 text-black"
        />

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          className="w-full border rounded-xl p-3 text-black"
        />

        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Delivery Address"
          className="w-full border rounded-xl p-3 text-black"
          rows={3}
        />

        <textarea
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

        <p className="mt-3 text-black">
          Items: {cart.length}
        </p>

        <p className="mt-2 text-2xl font-bold text-green-700">
          ₦{total.toLocaleString()}
        </p>

        <button
          onClick={handleOrder}
          disabled={loading}
          className={`w-full mt-5 text-white py-4 rounded-full font-bold transition ${
            loading
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-700"
          }`}
        >
          {loading ? "Taking Order..." : "Place Order"}
        </button>

      </div>

    </main>
  );
}