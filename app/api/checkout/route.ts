import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
 const {
  cart,
  userId,
  name,
  phone,
  address,
  note,
  deliveryAreaId,
} = await req.json();

    if (!cart?.length) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Get all food IDs
const foodIds = cart.map((item: any) => item.id);

// Fetch foods from the database
const { data: foods, error: foodError } = await supabase
  .from("menu_items")
  .select("id, restaurant_id, name, price")
  .in("id", foodIds);



if (foodError) {
  console.log("Food Error:", foodError);

  return NextResponse.json(
  {
    error: "Food query failed",
    details: foodError,
  },
  { status: 400 }
);
}

if (!foods) {
  return NextResponse.json(
    { error: "No foods returned" },
    { status: 400 }
  );
}

const restaurantIds = [...new Set(foods.map(food => food.restaurant_id))];

if (restaurantIds.length !== 1) {
  return NextResponse.json(
    { error: "Items must belong to one restaurant." },
    { status: 400 }
  );
}

let subtotal = 0;

for (const cartItem of cart) {
  const food = foods.find((f) => f.id === cartItem.id);
  
  if (!food) {
    return NextResponse.json(
      { error: "Food not found" },
      { status: 400 }
    );
  }

  if (cartItem.quantity <= 0) {
  return NextResponse.json(
    { error: "Invalid quantity." },
    { status: 400 }
  );
}

if (!userId) {
  return NextResponse.json(
    { error: "User not logged in." },
    { status: 401 }
  );
}

  subtotal += food.price * cartItem.quantity;
}

const { data: deliveryArea, error: deliveryError } = await supabase
  .from("delivery_areas")
  .select("id, fee")
  .eq("id", deliveryAreaId)
  .single();

if (deliveryError || !deliveryArea) {
  return NextResponse.json(
    { error: "Invalid delivery area." },
    { status: 400 }
  );
}

const SERVICE_FEE = 150;

const deliveryFee = deliveryArea.fee;

const total = subtotal + deliveryFee + SERVICE_FEE;

const restaurantId = foods[0].restaurant_id;

const paymentReference =
  "BTV-" +
  Date.now() +
  "-" +
  Math.random().toString(36).substring(2, 8).toUpperCase();

const { data: order, error: orderError } = await supabase
  .from("orders")
  .insert({
    restaurant_id: restaurantId,
    user_id: userId,
    customer_name: name,
    phone,
    delivery_address: address,
    note,
    payment_reference: paymentReference,
    total,

    delivery_fee: deliveryFee,
    service_fee: SERVICE_FEE,
    bitevy_amount: SERVICE_FEE,
    restaurant_amount: subtotal,

    delivery_area_id: deliveryArea.id,

    status: "pending",
    payment_status: "pending",
  })
  .select()
  .single();

if (orderError || !order) {
  console.log(orderError);

  return NextResponse.json(
    { error: "Unable to create order." },
    { status: 400 }
  );
}

const orderItems = cart.map((cartItem: any) => {
  const food = foods.find((f) => f.id === cartItem.id)!;

 return {
  order_id: order.id,
  name: food.name,
  price: food.price,
  quantity: cartItem.quantity,
  image: cartItem.image,
};
});

const { error: orderItemsError } = await supabase
  .from("order_items")
  .insert(orderItems);

  await supabase
  .from("profiles")
  .update({
    full_name: name,
    phone,
    address,
  })
  .eq("id", userId);

if (orderItemsError) {
  console.log(orderItemsError);

  return NextResponse.json(
    { error: "Unable to create order items." },
    { status: 400 }
  );
}

return NextResponse.json({
  success: true,
  orderId: order.id,
  paymentReference,
  restaurantId,
  subtotal,
  deliveryFee,
  serviceFee: SERVICE_FEE,
  total,
  paymentStatus: "pending",
});

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}