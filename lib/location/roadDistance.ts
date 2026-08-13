import "server-only";

export async function calculateRoadDistance(
  customerLatitude: number,
  customerLongitude: number,
  restaurantLatitude: number,
  restaurantLongitude: number
): Promise<{
  distanceKm: number;
  durationMinutes: number;
} | null> {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;

  if (!apiKey) {
    console.error("OPENROUTESERVICE_API_KEY is missing");
    return null;
  }

  try {
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
              Number(customerLongitude),
              Number(customerLatitude),
            ],
            [
              Number(restaurantLongitude),
              Number(restaurantLatitude),
            ],
          ],
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.text();

      console.error(
        "OpenRouteService error:",
        response.status,
        errorData
      );

      return null;
    }

    const data = await response.json();

    const summary = data.routes?.[0]?.summary;

    if (!summary) {
      console.error("No route found");
      return null;
    }

    return {
      distanceKm: summary.distance / 1000,
      durationMinutes: summary.duration / 60,
    };
  } catch (error) {
    console.error("Road distance calculation failed:", error);

    return null;
  }
}4