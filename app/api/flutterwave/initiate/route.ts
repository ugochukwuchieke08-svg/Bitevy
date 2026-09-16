import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
    } = await req.json();

    if (!orderId || !customerName || !customerEmail) {
      return NextResponse.json(
        {
          error: "Missing required payment information.",
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.FLW_SECRET_KEY;

    if (!secretKey) {
      console.error("FLW_SECRET_KEY is missing");

      return NextResponse.json(
        {
          error: "Payment configuration error.",
        },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();

const authSupabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component / Route Handler may not allow setting cookies here.
        }
      },
    },
  }
);

const {
  data: { user },
  error: authError,
} = await authSupabase.auth.getUser();

if (authError || !user) {
  return NextResponse.json(
    {
      error: "You must be logged in to make a payment.",
    },
    { status: 401 }
  );
}

    // Server-side Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the real order from Supabase
    const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
      total,
      payment_reference,
      payment_status,
      customer_name,
      phone,
      restaurant_id,
      restaurant_amount
    `)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

    if (orderError || !order) {
      console.error("Order lookup failed:", orderError);

      return NextResponse.json(
        {
          error: "Order not found.",
        },
        { status: 404 }
      );
    }
 
   const { data: restaurant, error: restaurantError } = await supabase
  .from("restaurants")
  .select("id, flutterwave_subaccount_id, payout_status")
  .eq("id", order.restaurant_id)
  .single();

if (restaurantError || !restaurant) {
  console.error(
    "Restaurant lookup failed:",
    restaurantError
  );

  return NextResponse.json(
    {
      error: "Restaurant not found.",
    },
    { status: 404 }
  );
}

if (
  typeof restaurant.flutterwave_subaccount_id !== "string" ||
  !restaurant.flutterwave_subaccount_id.trim() ||
  restaurant.payout_status !== "active"
) {
  return NextResponse.json(
    {
      error: "Restaurant payout account is not active.",
    },
    { status: 400 }
  );
}

    // Don't initialize payment for an already-paid order
    if (order.payment_status === "paid") {
      return NextResponse.json(
        {
          error: "This order has already been paid for.",
        },
        { status: 400 }
      );
    }

    if (
  !Number.isFinite(Number(order.total)) ||
  !Number.isFinite(Number(order.restaurant_amount)) ||
  Number(order.total) <= 0 ||
  Number(order.restaurant_amount) <= 0 ||
  Number(order.restaurant_amount) > Number(order.total)
) {
  console.error("INVALID PAYMENT AMOUNTS:", {
    orderId: order.id,
    total: order.total,
    restaurantAmount: order.restaurant_amount,
  });

  return NextResponse.json(
    {
      error: "Invalid order payment amount.",
    },
    { status: 400 }
  );
}

    // Make sure the order actually has a payment reference
    if (!order.payment_reference) {
      return NextResponse.json(
        {
          error: "Order does not have a payment reference.",
        },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.bitevy.app";

    // IMPORTANT:
    // total and payment_reference come from our database,
    // NOT from the browser.
    const paymentReference = order.payment_reference;
    const total = order.total;

    const response = await fetch(
      "https://api.flutterwave.com/v3/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: paymentReference,
          amount: Number(total),
          currency: "NGN",

          redirect_url: `${baseUrl}/payment/flutterwave/callback`,

          customer: {
            email: customerEmail,
            name: customerName,
            phonenumber: customerPhone || order.phone,
          },

          subaccounts: [
            {
              id: restaurant.flutterwave_subaccount_id,
              transaction_charge_type: "flat_subaccount",
              transaction_charge: Number(order.restaurant_amount),
            },
          ],

          customizations: {
            title: "Bitevy",
            description: `Payment for Bitevy order ${order.id}`,
          },

          meta: {
            order_id: order.id,
          },
        }),
      }
    );

    const data = await response.json();

    console.log("Flutterwave response:", data);

    if (!response.ok || data.status !== "success") {
      return NextResponse.json(
        {
          error: data.message || "Unable to initialize payment.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentLink: data.data.link,
      orderId: order.id,
      paymentReference,
    });
  } catch (err) {
    console.error("Flutterwave initiation error:", err);

    return NextResponse.json(
      {
        error: "Unable to initialize payment.",
      },
      { status: 500 }
    );
  }
}