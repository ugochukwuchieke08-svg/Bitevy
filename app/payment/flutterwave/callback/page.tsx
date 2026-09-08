"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function FlutterwaveCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const transactionId = searchParams.get("transaction_id");
      const txRef = searchParams.get("tx_ref");
      const status = searchParams.get("status");

      if (!transactionId || !txRef) {
        setMessage("Payment information is missing.");
        return;
      }

      if (status !== "successful") {
        setMessage("Payment was not successful.");
        return;
      }

      try {
        const response = await fetch("/api/flutterwave/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionId,
            txRef,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          console.error("Payment verification failed:", data);

          setMessage(
            data.error || "We could not verify your payment."
          );

          return;
        }

        setMessage("Payment successful! Redirecting...");

        setTimeout(() => {
          router.replace(`/order-success?orderId=${data.orderId}`);
        }, 1000);
      } catch (error) {
        console.error("Verification request failed:", error);

        setMessage(
          "Something went wrong while verifying your payment."
        );
      }
    };

    verifyPayment();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

        <h1 className="text-xl font-semibold">
          {message}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Please don't close this page.
        </p>
      </div>
    </main>
  );
}