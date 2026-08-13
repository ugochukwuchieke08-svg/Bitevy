"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocation } from "@/hooks/useLocation";
import { Search, MapPin } from "lucide-react";import { supabase } from "@/lib/supabase/client";


const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full rounded-3xl bg-gray-200 flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

type LocationPickerProps = {
  onLocationConfirm?: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
};

export default function LocationPicker({
  onLocationConfirm,
}: LocationPickerProps) {
const router = useRouter();

  const {
    loading,
    getCurrentLocation,
  } = useLocation();

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [address, setAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const addressTimer = useRef<NodeJS.Timeout | null>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const [savingLocation, setSavingLocation] = useState(false);

  // Cleanup timer when component unmounts
useEffect(() => {
  loadSavedLocation();

  return () => {
    if (addressTimer.current) {
      clearTimeout(addressTimer.current);
    }

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
  };
}, []);

async function loadSavedLocation() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("addresses")
      .select("latitude, longitude, address")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      // No saved location yet.
      return;
    }

    setLatitude(Number(data.latitude));
    setLongitude(Number(data.longitude));
    setAddress(data.address || "");
  } catch (error) {
    console.error("Failed to load saved location:", error);
  }
}

async function saveLocation() {
  if (latitude === null || longitude === null) {
    alert("Please select a delivery location first.");
    return;
  }

  if (!address) {
    alert("Please wait for the address to load.");
    return;
  }

  // Prevent duplicate clicks
  if (savingLocation) return;

  try {
    setSavingLocation(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      alert("Please log in first.");
      return;
    }

    if (onLocationConfirm) {
      onLocationConfirm({
        latitude,
        longitude,
        address,
      });

      return;
    }

    const { error } = await supabase
      .from("addresses")
      .upsert(
        {
          user_id: user.id,
          address,
          latitude,
          longitude,
          label: "Delivery address",
          is_default: true,
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      throw error;
    }

    router.push("/");
     router.refresh();

  } catch (error) {
    console.error("Save location error:", error);

    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("Unable to save delivery location.");
    }
  } finally {
    setSavingLocation(false);
  }
}

  async function getSearchSuggestions(query: string) {
  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  try {
    setSearchLoading(true);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        query
      )}&countrycodes=ng&limit=5&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();

    setSearchResults(data);
  } catch (error) {
    console.error(
      "Suggestion search failed:",
      error
    );

    setSearchResults([]);
  } finally {
    setSearchLoading(false);
  }
}

  // Search for a location
 async function searchLocation() {
  const query = search.trim();

  if (!query) return;

  try {
    setSearchLoading(true);
    setSearchResults([]);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        query
      )}&countrycodes=ng&limit=8&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error(
        `Search failed: ${response.status}`
      );
    }

    const data = await response.json();

    console.log("Search results:", data);

    if (!data || data.length === 0) {
      alert(
        "Location not found. Try adding the city or area."
      );
      return;
    }

    /*
     * Prefer results inside Owerri when
     * the search itself contains Owerri.
     *
     * Otherwise use Nominatim's ranking.
     */
    const normalizedQuery = query.toLowerCase();

    let result = data[0];

    if (normalizedQuery.includes("owerri")) {
      const owerriResult = data.find(
        (item: any) =>
          item.display_name
            ?.toLowerCase()
            .includes("owerri")
      );

      if (owerriResult) {
        result = owerriResult;
      }
    }

    const lat = Number(result.lat);
    const lng = Number(result.lon);

    console.log("Selected search result:", {
      name: result.name,
      latitude: lat,
      longitude: lng,
      address: result.display_name,
    });

    setLatitude(lat);
    setLongitude(lng);

    setAddress(
      result.display_name || "Address not found"
    );

    setSearch(
      result.display_name || query
    );

  } catch (error) {
    console.error(
      "Location search failed:",
      error
    );

    alert(
      "Unable to search for this location."
    );
  } finally {
    setSearchLoading(false);
  }
}
  // Get current GPS location
  async function loadLocation() {
    try {
      const location = await getCurrentLocation();

      setLatitude(location.latitude);
      setLongitude(location.longitude);

      getAddress(
        location.latitude,
        location.longitude
      );
    } catch (error) {
      console.error("Location error:", error);

      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  // Reverse geocode coordinates into an address
  async function getAddress(
    lat: number,
    lng: number
  ) {
    try {
      setAddressLoading(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );

      if (!response.ok) {
        throw new Error("Failed to find address");
      }

      const data = await response.json();

      setAddress(
        data.display_name || "Address not found"
      );
    } catch (error) {
      console.error(
        "Address lookup failed:",
        error
      );

      setAddress("Unable to find address");
    } finally {
      setAddressLoading(false);
    }
  }

  // Called when the user moves the map
  function handleLocationChange(
    lat: number,
    lng: number
  ) {
    setLatitude(lat);
    setLongitude(lng);

    setAddressLoading(true);

    // Cancel previous request
    if (addressTimer.current) {
      clearTimeout(addressTimer.current);
    }

    // Wait until the user stops moving the map
    addressTimer.current = setTimeout(() => {
      getAddress(lat, lng);
    }, 700);
  }

  // User selects a search result
  function selectSearchResult(result: any) {
    const lat = Number(result.lat);
    const lng = Number(result.lon);

    setLatitude(lat);
    setLongitude(lng);

    setAddress(result.display_name);

    setSearch(result.display_name);

    setSearchResults([]);
  }

  // Wait for GPS before showing the map
 const mapLatitude = latitude ?? 5.4850;
const mapLongitude = longitude ?? 7.0350;

  return (
    <main className="min-h-screen bg-white p-5">

      <h1 className="text-2xl font-bold text-black">
        Choose delivery location
      </h1>

      <p className="mt-1 text-gray-500">
        Search for a place or move the map.
      </p>

      {/* SEARCH */}
      <div className="relative mt-5">

        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 shadow-sm">

         <Search className="h-5 w-5 shrink-0 text-gray-400" />

          <input
  value={search}
  onChange={(e) => {
    const value = e.target.value;

    setSearch(value);

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimer.current = setTimeout(() => {
      getSearchSuggestions(value);
    }, 500);
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      searchLocation();
    }
  }}
  placeholder="Search for your delivery location"
  className="w-full py-4 text-black outline-none"
/>



          <button
            onClick={searchLocation}
            disabled={searchLoading}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
          >
            {searchLoading ? "..." : "Search"}
          </button>

        </div>

        {searchResults.length > 0 && (
  <div className="absolute left-0 right-0 top-full z-[9999] mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

    {searchResults.map((result: any) => (
      <button
        key={result.place_id}
        type="button"
        onClick={() => {
          const lat = Number(result.lat);
          const lng = Number(result.lon);

          setLatitude(lat);
          setLongitude(lng);

          setAddress(
            result.display_name
          );

          setSearch(
            result.display_name
          );

          setSearchResults([]);
        }}
        className="flex w-full items-start gap-3 border-b border-gray-100 p-4 text-left last:border-0 hover:bg-gray-50"
      >
        <MapPin className="mt-1 h-5 w-5 shrink-0 text-orange-500" />

        <div>
          <p className="font-semibold text-black">
            {result.name || "Location"}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {result.display_name}
          </p>
        </div>
      </button>
    ))}

  </div>
)}

      </div>

      {/* MAP */}
      <div className="mt-5">
        <LocationMap
          latitude={mapLatitude}
          longitude={mapLongitude}
          onLocationChange={handleLocationChange}
        />
      </div>

      {/* ADDRESS */}
      <div className="mt-4 rounded-2xl bg-gray-50 p-4">

        <p className="text-sm font-semibold text-gray-500">
          Delivering to
        </p>

        <p className="mt-1 text-black font-semibold">
          {addressLoading
            ? "Finding address..."
            : address ||
              "Address not found"}
        </p>

      </div>

      {/* CURRENT LOCATION */}
     <button
      onClick={loadLocation}
      disabled={loading}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-500 py-4 font-semibold text-orange-500"
    >
      <MapPin className="h-5 w-5" />

      <span>
        {loading
          ? "Getting location..."
          : "Use my current location"}
      </span>
    </button>

      {/* CONFIRM */}
      <button
        onClick={saveLocation}
        disabled={
          savingLocation ||
          addressLoading ||
          latitude === null ||
          longitude === null
        }
        className="mt-3 w-full rounded-2xl bg-orange-500 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {savingLocation
          ? "Confirming location..."
          : addressLoading
          ? "Finding address..."
          : "Confirm delivery location"}
      </button>

    </main>
  );
}