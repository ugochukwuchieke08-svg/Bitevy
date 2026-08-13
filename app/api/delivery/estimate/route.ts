import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateRoadDistance } from "@/lib/location/roadDistance";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, restaurantId } = await req.json();

    if (!userId || !restaurantId) {
      return NextResponse.json(
        { error: "Missing user or restaurant." },
        { status: 400 }
      );
    }

    // Customer's saved location
    const { data: customerLocation, error: customerError } =
      await supabase
        .from("addresses")
        .select("latitude, longitude, address")
        .eq("user_id", userId)
        .eq("is_default", true)
        .maybeSingle();

    if (
      customerError ||
      !customerLocation ||
      customerLocation.latitude === null ||
      customerLocation.longitude === null
    ) {
      return NextResponse.json(
        { error: "Please select a delivery location first." },
        { status: 400 }
      );
    }

    // Restaurant location
    const { data: restaurant, error: restaurantError } =
      await supabase
        .from("restaurants")
        .select("latitude, longitude")
        .eq("id", restaurantId)
        .single();

    if (
      restaurantError ||
      !restaurant ||
      restaurant.latitude === null ||
      restaurant.longitude === null
    ) {
      return NextResponse.json(
        { error: "Restaurant location is unavailable." },
        { status: 400 }
      );
    }

    // Calculate actual road distance
    const route = await calculateRoadDistance(
      Number(customerLocation.latitude),
      Number(customerLocation.longitude),
      Number(restaurant.latitude),
      Number(restaurant.longitude)
    );

    if (!route) {
      return NextResponse.json(
        { error: "Unable to calculate delivery distance." },
        { status: 500 }
      );
    }

    const distanceKm = route.distanceKm;

    // Distance-based pricing
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

    return NextResponse.json({
      distanceKm,
      durationMinutes: route.durationMinutes,
      deliveryFee,
      address: customerLocation.address,
    });
  } catch (error) {
    console.error("Delivery estimate error:", error);

    return NextResponse.json(
      { error: "Unable to calculate delivery estimate." },
      { status: 500 }
    );
  }
}