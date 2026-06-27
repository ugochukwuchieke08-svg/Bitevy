"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


export default function AdminPage() {

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);



  useEffect(() => {

    async function loadOrders() {


      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();



      if(!user){

        setLoading(false);
        return;

      }




      // Check admin role

      const { data: profile } = await supabase

        .from("profiles")

        .select("role")

        .eq("id", user.id)

        .single();



      if(profile?.role !== "admin"){

        setLoading(false);
        return;

      }



      setAllowed(true);




      // Get all orders

      const { data, error } = await supabase

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

        .order("created_at", {
          ascending:false
        });



      if(error){

        console.log(error);

      }


      setOrders(data || []);

      setLoading(false);


    }


    loadOrders();


  }, []);




  async function updateStatus(
    id:string,
    status:string
  ){


    const { error } = await supabase

      .from("orders")

      .update({
        status
      })

      .eq("id", id);



    if(error){

      console.log(error);
      return;

    }



    setOrders((prev)=>
      prev.map((order)=>
        order.id === id
        ? {...order,status}
        : order
      )
    );


  }





  if(loading){

    return (

      <main className="p-5">

        <h1 className="text-black font-bold">
          Loading dashboard...
        </h1>

      </main>

    );

  }



  if(!allowed){

    return (

      <main className="min-h-screen bg-[#fff8f0] p-5">

        <h1 className="text-3xl font-bold text-red-600">

          Access Denied

        </h1>

        <p className="text-black mt-2">

          You are not allowed to view this page.

        </p>

      </main>

    );

  }





  return (

    <main className="min-h-screen bg-[#fff8f0] p-5">


      <h1 className="text-3xl font-black text-black mb-6">

        Admin Dashboard

      </h1>




      <div className="space-y-5">



        {
          orders.map((order)=>(


            <div

              key={order.id}

              className="bg-white rounded-3xl p-5 shadow"

            >



              <h2 className="font-bold text-xl text-black">

                Order #{order.id.slice(0,8)}

              </h2>



              <div className="mt-4 space-y-2 text-gray-700">


                <p>

                  👤 {order.customer_name}

                </p>


                <p>

                  📞 {order.phone}

                </p>


                <p>

                  📍 {order.delivery_address}

                </p>


                <p className="font-bold text-green-700">

                  ₦{order.total.toLocaleString()}

                </p>

              </div>

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

      <p className="font-bold text-orange-600">
        🍽️ {order.restaurants?.name}
      </p>
    </div>

  ))}
</div>



              <div className="mt-5">


                <p className="font-bold text-black mb-2">

                  Status:
                  {" "}
                  {order.status}

                </p>




                <div className="flex gap-2 flex-wrap">


                  <button

                    onClick={()=>
                      updateStatus(order.id,"preparing")
                    }

                    className="bg-orange-500 text-white px-4 py-2 rounded-full"

                  >

                    Preparing

                  </button>




                  <button

                    onClick={()=>
                      updateStatus(order.id,"ready_for_pickup")
                    }

                    className="bg-blue-600 text-white px-4 py-2 rounded-full"

                  >

                    Ready

                  </button>




                  <button

                    onClick={()=>
                      updateStatus(order.id,"delivered")
                    }

                    className="bg-green-700 text-white px-4 py-2 rounded-full"

                  >

                    Delivered

                  </button>



                </div>


              </div>



            </div>


          ))
        }



      </div>


    </main>

  );

}