"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";


export default function OrdersPage() {

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);



  useEffect(() => {

    async function getOrders(){

      const {
        data:{
          user
        }
      } = await supabase.auth.getUser();



      if(!user){
        setLoading(false);
        return;
      }


      setUser(user);



      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending:false
        });



      if(error){
        console.log(error);
      }


      setOrders(data || []);
      setLoading(false);

    }


    getOrders();


  },[]);



  if(loading){

    return (
      <main className="min-h-screen bg-[#fff8f0] p-5">

        <h1 className="text-2xl font-bold text-black">
          Loading orders...
        </h1>

      </main>
    );

  }



  if(!user){

    return (

      <main className="min-h-screen bg-[#fff8f0] p-5">

        <h1 className="text-3xl font-bold text-black">
          Please login to view orders
        </h1>


        <Link
          href="/login?redirect=/orders"
          className="inline-block mt-5 bg-green-700 text-white px-5 py-3 rounded-full"
        >
          Login
        </Link>


      </main>

    );

  }



  return (

    <main className="min-h-screen bg-[#fff8f0] p-5">


      <h1 className="text-3xl font-bold text-black mb-6">
        My Orders
      </h1>



      {
        orders.length === 0 ? (

          <div className="bg-white rounded-3xl p-5">

            <p className="text-gray-600">
              No orders yet.
            </p>

          </div>


        ) : (


          <div className="space-y-5">


            {orders.map((order)=>(


              <div
                key={order.id}
                className="bg-white rounded-3xl p-5"
              >


                <div className="flex justify-between">

                  <h2 className="font-bold text-black">
                    Order #{order.id.slice(0,8)}
                  </h2>


                  <span className="text-green-700 font-bold">
                    {order.status}
                  </span>


                </div>



                <div className="mt-4 space-y-3">


                  {order.order_items?.map((item:any)=>(


                    <div
                      key={item.id}
                      className="flex items-center gap-3"
                    >


                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />


                      <div>

                        <h3 className="font-bold text-black">
                          {item.name}
                        </h3>


                        <p className="text-gray-600">
                          {item.quantity} × ₦{item.price}
                        </p>


                      </div>


                    </div>


                  ))}


                </div>



                <div className="border-t mt-5 pt-4">

                  <p className="text-xl font-bold text-green-700">
                    Total: ₦{order.total.toLocaleString()}
                  </p>

                </div>


              </div>


            ))}


          </div>


        )
      }
    </main>

  );

}