"use client";

import { useEffect } from "react";

export default function FirebaseBridge() {
  useEffect(() => {
    (window as any).receiveFCMToken = async (token: string) => {
      console.log("Received FCM Token:", token);

      try {
        const res = await fetch("/api/device-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        console.log(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
  }, []);

  return null;
}