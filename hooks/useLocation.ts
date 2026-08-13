"use client";

import { useState } from "react";

export function useLocation() {
  const [loading, setLoading] = useState(false);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const getCurrentLocation = () =>
    new Promise<{ latitude: number; longitude: number }>(
      (resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by this browser."));
          return;
        }

        setLoading(true);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const accuracy = position.coords.accuracy;

            console.log("GPS SUCCESS");
            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);
            console.log("Accuracy:", position.coords.accuracy);

            setLatitude(latitude);
            setLongitude(longitude);
            setLoading(false);

            resolve({
              latitude,
              longitude,
            });
          },

          (error) => {
            console.error("GPS ERROR CODE:", error.code);
            console.error("GPS ERROR MESSAGE:", error.message);

            setLoading(false);

            reject(
              new Error(
                `Location error ${error.code}: ${error.message}`
              )
            );
          },

          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0,
          }
        );
      }
    );

  return {
    latitude,
    longitude,
    loading,
    getCurrentLocation,
  };
}