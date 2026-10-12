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
    .select("id, flutterwave_subaccount_id, payout_status")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

if (restaurantError || !restaurant) {
  console.error("Settlement restaurant lookup failed:", {
    error: restaurantError,
    userId: user.id,
    restaurantFound: !!restaurant,
  });

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

// Temporarily retrieve settlement history for the current calendar year.
// We'll establish the correct historical starting date separately.
// Retrieve all available settlement history for this restaurant.
const settlements: Array<Record<string, any>> = [];
const maxPages = 1000;

for (let page = 1; page <= maxPages; page++) {
  const params = new URLSearchParams({
    page: String(page),
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

  const totalPages = Number(
    result.meta?.page_info?.total_pages ?? 0
  );

  if (totalPages > 0) {
    if (page >= totalPages) break;
  } else if (pageData.length < 20) {
    break;
  }
}

// Return only the fields needed to verify the response structure.
// Do not expose bank details, customer details, or API credentials.
const detailedResults = await Promise.all(
  settlements.map(async (item) => {
    const settlementId = item.id;

    const response = await fetch(
      `https://api.flutterwave.com/v3/settlements/${encodeURIComponent(
        String(settlementId)
      )}`,
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

    if (!response.ok || result.status !== "success" || !result.data) {
      console.error("Settlement detail request failed:", {
        settlementId,
        status: response.status,
        message: result.message,
      });

      throw new Error("Unable to retrieve settlement details.");
    }

    const settlement = result.data;

    const transactions = Array.isArray(settlement.transactions)
      ? settlement.transactions as Array<Record<string, unknown>>
      : [];

    return {
      id: settlement.id ?? null,
      status: settlement.status ?? null,
      processed_date: settlement.processed_date ?? null,
      currency: settlement.currency ?? null,
      gross_amount: settlement.gross_amount ?? null,
      net_amount: settlement.net_amount ?? null,
      transaction_count: settlement.transaction_count ?? null,
      destination: settlement.destination ?? null,
      transactions: transactions.map((transaction) => ({
        tx_ref: transaction.tx_ref ?? null,
        flw_ref: transaction.flw_ref ?? null,
        status: transaction.status ?? null,
        charged_amount: transaction.charged_amount ?? null,
        settlement_amount: transaction.settlement_amount ?? null,
        subaccount_settlement:
          transaction.subaccount_settlement ?? null,
      })),
    };
  })
);

const summary = detailedResults;
 
// Collect transaction references from completed settlements.
const settledTransactions = detailedResults.flatMap((settlement) => {
  if (settlement.status !== "completed") {
    return [];
  }

  return settlement.transactions
    .filter((transaction) => transaction.status === "successful")
    .map((transaction) => ({
      paymentReference: transaction.tx_ref,
      amount: Number(transaction.settlement_amount ?? 0),
      processedDate: settlement.processed_date,
    }));
});

const settledReferences = settledTransactions
  .map((transaction) => transaction.paymentReference)
  .filter((reference): reference is string => typeof reference === "string");

// Find the corresponding Bitevy orders.
const { data: matchedOrders, error: matchedOrdersError } =
  settledReferences.length > 0
    ? await supabase
        .from("orders")
        .select(
          "id, payment_reference, restaurant_amount, payment_status, status"
        )
        .eq("restaurant_id", restaurant.id)
        .in("payment_reference", settledReferences)
    : { data: [], error: null };

if (matchedOrdersError) {
  console.error("Settlement order matching failed:", matchedOrdersError);

  return NextResponse.json(
    { error: "Unable to match settlements to orders." },
    { status: 500 }
  );
}

const matchedReferenceSet = new Set(
  (matchedOrders ?? [])
    .map((order) => order.payment_reference)
    .filter(Boolean)
);

const unmatchedSettlements = settledTransactions.filter(
  (transaction) =>
    !matchedReferenceSet.has(transaction.paymentReference)
);

console.log("Restaurant settlement reconciliation:", {
  restaurantId: restaurant.id,
  settlementTransactions: settledTransactions.length,
  matchedOrders: matchedOrders?.length ?? 0,
  unmatchedSettlements: unmatchedSettlements.length,
});

// Flatten transactions from all settlements
// Use Nigeria's local date for today's revenue.
const nigeriaDate = (date: string | Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));

const today = nigeriaDate(new Date());

// Revenue actually settled today.
const revenueToday = settledTransactions
  .filter(
    (transaction) =>
      transaction.processedDate &&
      nigeriaDate(transaction.processedDate) === today
  )
  .reduce(
    (total, transaction) => total + transaction.amount,
    0
  );

// Total settled earnings in the retrieved date range.
const totalEarnings = settledTransactions.reduce(
  (total, transaction) => total + transaction.amount,
  0
);

// Retrieve the restaurant's paid orders.
const { data: paidOrders, error: ordersError } = await supabase
  .from("orders")
  .select("payment_reference, restaurant_amount, payment_status")
  .eq("restaurant_id", restaurant.id)
  .eq("payment_status", "paid");

if (ordersError) {
  console.error("Failed to fetch paid orders:", ordersError);

  return NextResponse.json(
    { error: "Unable to calculate restaurant earnings." },
    { status: 500 }
  );
}

// References already matched to completed settlements.

// References already matched to completed settlements.
const settledReferenceSet = new Set(
  settledTransactions
    .map((transaction) => transaction.paymentReference)
    .filter(
      (reference): reference is string =>
        typeof reference === "string" && reference.length > 0
    )
);

const pendingPayout = (paidOrders ?? [])
  .filter(
    (order) =>
      typeof order.payment_reference === "string" &&
      order.payment_reference.length > 0 &&
      !settledReferenceSet.has(order.payment_reference)
  )
  .reduce((total, order) => {
    const amount = Number(order.restaurant_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return total;
    }

    return total + amount;
  }, 0);


return NextResponse.json({
  success: true,
  restaurantId: restaurant.id,
 dateRange: {
  from: null,
  to: new Date().toISOString().slice(0, 10),
  scope: "all_available_history",
}, 
  settlementCount: summary.length,
  settlements: summary,
  earnings: {
    revenueToday,
    totalEarnings,
    pendingPayout,
  },
});


} catch (error) {
console.error("Restaurant settlement API error:", error);

return NextResponse.json(
  { error: "An unexpected error occurred." },
  { status: 500 }
);


}
}
