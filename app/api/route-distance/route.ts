import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { customer, restaurant } = await request.json();

    if (
      !customer?.latitude ||
      !customer?.longitude ||
      !restaurant?.latitude ||
      !restaurant?.longitude
    ) {
      return NextResponse.json(
        { error: "Missing coordinates" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTESERVICE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouteService API key is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.heigit.org/openrouteservice/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [
              Number(customer.longitude),
              Number(customer.latitude),
            ],
            [
              Number(restaurant.longitude),
              Number(restaurant.latitude),
            ],
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouteService error:", data);

      return NextResponse.json(
        { error: "Unable to calculate road distance" },
        { status: response.status }
      );
    }

    const summary = data.routes?.[0]?.summary;

    if (!summary) {
      return NextResponse.json(
        { error: "No route found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      distanceKm: summary.distance / 1000,
      durationMinutes: summary.duration / 60,
    });
  } catch (error) {
    console.error("Route distance error:", error);

    return NextResponse.json(
      { error: "Failed to calculate route distance" },
      { status: 500 }
    );
  }
}