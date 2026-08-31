import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateRoadDistance } from "@/lib/location/roadDistance";
import { sendNotification } from "@/lib/sendNotification";

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
  .select("id, restaurant_id, name, price, image")
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

const verifiedOrderItems: {
  order_id?: string | number;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  portion: string | null;
  portion_id: number | null;
}[] = [];

for (const cartItem of cart) {
  const food = foods.find(
    (f) => String(f.id) === String(cartItem.id)
  );

  if (!food) {
    return NextResponse.json(
      { error: "Food not found." },
      { status: 400 }
    );
  }

  if (!cartItem.quantity || cartItem.quantity <= 0) {
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

  let unitPrice = Number(food.price);
  let portionName: string | null = null;
  let portionId: number | null = null;

  /*
   * If the customer selected a portion,
   * verify it against Supabase.
   */
  if (cartItem.portion_id) {
    const { data: option, error: optionError } =
      await supabase
        .from("menu_item_options")
        .select(`
          id,
          name,
          price,
          menu_item_option_groups!inner (
            menu_item_id
          )
        `)
        .eq("id", cartItem.portion_id)
        .single();

    if (optionError || !option) {
      console.error(
        "Portion validation failed:",
        optionError
      );

      return NextResponse.json(
        {
          error:
            "Selected portion is no longer available.",
        },
        { status: 400 }
      );
    }

    const optionGroup =
      Array.isArray(option.menu_item_option_groups)
        ? option.menu_item_option_groups[0]
        : option.menu_item_option_groups;

    /*
     * Make sure the portion actually belongs
     * to the food being ordered.
     */
    if (
      !optionGroup ||
      String(optionGroup.menu_item_id) !==
        String(food.id)
    ) {
      return NextResponse.json(
        { error: "Invalid portion selected." },
        { status: 400 }
      );
    }

    unitPrice = Number(option.price);
    portionName = option.name;
    portionId = option.id;
  }

  subtotal += unitPrice * cartItem.quantity;

 verifiedOrderItems.push({
  name: food.name,
  price: unitPrice,
  quantity: cartItem.quantity,
  image: food.image ?? null,
  portion: portionName,
  portion_id: portionId,
});
}

const restaurantId = foods[0].restaurant_id;

const { data: customerLocation, error: customerLocationError } =
  await supabase
    .from("addresses")
    .select("latitude, longitude, address")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();

if (
  customerLocationError ||
  !customerLocation ||
  customerLocation.latitude === null ||
  customerLocation.longitude === null
) {
  return NextResponse.json(
    { error: "Please select a delivery location before placing your order." },
    { status: 400 }
  );
}

const { data: restaurantLocation, error: restaurantLocationError } =
  await supabase
    .from("restaurants")
    .select("latitude, longitude")
    .eq("id", restaurantId)
    .single();

if (
  restaurantLocationError ||
  !restaurantLocation ||
  restaurantLocation.latitude === null ||
  restaurantLocation.longitude === null
) {
  return NextResponse.json(
    { error: "This restaurant does not have a delivery location yet." },
    { status: 400 }
  );
}

const route = await calculateRoadDistance(
  Number(customerLocation.latitude),
  Number(customerLocation.longitude),
  Number(restaurantLocation.latitude),
  Number(restaurantLocation.longitude)
);

if (!route) {
  return NextResponse.json(
    {
      error:
        "Unable to calculate delivery distance. Please try again.",
    },
    { status: 500 }
  );
}

const distanceKm = route.distanceKm;
let deliveryFee: number;

if (distanceKm <= 1) {
  deliveryFee = 500;
} else if (distanceKm <= 2) {
  deliveryFee = 700;
} else if (distanceKm <= 3) {
  deliveryFee = 900;
} else if (distanceKm <= 5) {
  deliveryFee = 1200;
} else if (distanceKm <= 7) {
  deliveryFee = 1500;
} else if (distanceKm <= 10) {
  deliveryFee = 2000;
} else {
  deliveryFee = 2500;
}

const SERVICE_FEE = 150;

const total = subtotal + deliveryFee + SERVICE_FEE;

console.log("🚚 DELIVERY CALCULATED:", {
  restaurantId,
  distanceKm,
  durationMinutes: route.durationMinutes,
  deliveryFee,
  subtotal,
  serviceFee: SERVICE_FEE,
  total,
});

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

const { data: restaurant, error: restaurantError } = await supabase
  .from("restaurants")
  .select("owner_id, name")
  .eq("id", restaurantId)
  .single();

if (restaurantError) {
  console.error("Failed to fetch restaurant:", restaurantError);
} else if (restaurant?.owner_id) {
  try {
    await sendNotification({
      userId: restaurant.owner_id,
      title: "New Order Received 🍔",
      body: `${name} placed a new order.`,
      data: {
        orderId: order.id.toString(),
        type: "new_order",
      },
    });

    console.log("Restaurant notification sent.");
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
}

const orderItems = verifiedOrderItems.map((item) => ({
  ...item,
  order_id: order.id,
}));

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
  console.error("ORDER ITEMS ERROR:", orderItemsError);

  return NextResponse.json(
    {
      error: "Unable to create order items.",
      details: orderItemsError.message,
      code: orderItemsError.code,
      hint: orderItemsError.hint,
    },
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