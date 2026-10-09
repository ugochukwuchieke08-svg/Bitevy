import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
try {
const secretKey = process.env.FLW_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


if (!secretKey || !supabaseUrl || !anonKey || !serviceRoleKey) {
  console.error("Settlement API configuration is incomplete.");

  return NextResponse.json(
    { error: "Settlement service is not configured." },
    { status: 500 }
  );
}

const cookieStore = await cookies();

const authSupabase = createServerClient(
  supabaseUrl,
  anonKey,
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
          // Cookie updates may not be available in this context.
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
    { error: "You must be logged in." },
    { status: 401 }
  );
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const { data: restaurant, error: restaurantError } =
  await supabase
    .from("restaurants")
    .select(
      "id, created_at, flutterwave_subaccount_id, payout_status"
    )
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

if (restaurantError || !restaurant) {
  return NextResponse.json(
    { error: "Restaurant not found." },
    { status: 404 }
  );
}

if (
  !restaurant.flutterwave_subaccount_id ||
  restaurant.payout_status !== "active"
) {
  return NextResponse.json(
    { error: "Restaurant payout account is not active." },
    { status: 400 }
  );
}

const fromDate = restaurant.created_at
  ? new Date(restaurant.created_at).toISOString().slice(0, 10)
  : new Date().toISOString().slice(0, 10);

const toDate = new Date().toISOString().slice(0, 10);

const settlements: Array<Record<string, unknown>> = [];
const maxPages = 20;

for (let page = 1; page <= maxPages; page++) {
  const params = new URLSearchParams({
    page: String(page),
    from: fromDate,
    to: toDate,
    subaccount_id: restaurant.flutterwave_subaccount_id,
  });

  const response = await fetch(
    `https://api.flutterwave.com/v3/settlements?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok || result.status !== "success") {
    console.error(
      "Flutterwave settlements request failed:",
      response.status,
      result.message
    );

    return NextResponse.json(
      { error: "Unable to retrieve settlement information." },
      { status: 502 }
    );
  }

  const pageData = Array.isArray(result.data)
    ? result.data
    : result.data
      ? [result.data]
      : [];

  settlements.push(...pageData);

  if (
    pageData.length === 0 ||
    pageData.length < 20
  ) {
    break;
  }
}

// Return only the fields needed to verify the response structure.
// Do not expose bank details, customer details, or API credentials.
const summary = settlements.map((item) => {
  const transactions = Array.isArray(item.transactions)
    ? item.transactions as Array<Record<string, unknown>>
    : [];

  return {
    id: item.id ?? null,
    status: item.status ?? null,
    processed_date: item.processed_date ?? null,
    currency: item.currency ?? null,
    gross_amount: item.gross_amount ?? null,
    net_amount: item.net_amount ?? null,
    transaction_count: item.transaction_count ?? null,
    transactions: transactions.map((transaction) => ({
      tx_ref: transaction.tx_ref ?? null,
      status: transaction.status ?? null,
      charged_amount: transaction.charged_amount ?? null,
      settlement_amount: transaction.settlement_amount ?? null,
      subaccount_settlement:
        transaction.subaccount_settlement ?? null,
    })),
  };
});

return NextResponse.json({
  success: true,
  restaurantId: restaurant.id,
  dateRange: {
    from: fromDate,
    to: toDate,
  },
  settlementCount: summary.length,
  settlements: summary,
});


} catch (error) {
console.error("Restaurant settlement API error:", error);

return NextResponse.json(
  { error: "An unexpected error occurred." },
  { status: 500 }
);


}
}
