export async function reverseGeocode(
  latitude: number,
  longitude: number
) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  );

  const data = await response.json();

  return data.display_name;
}