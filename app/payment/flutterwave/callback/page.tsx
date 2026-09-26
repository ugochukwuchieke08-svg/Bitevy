 
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

      console.log("========== FLUTTERWAVE CALLBACK ==========");
      console.log("Transaction ID:", transactionId);
      console.log("TX REF:", txRef);
      console.log("Status:", status);

      if (!transactionId || !txRef) {
        console.error("Missing transaction information.");
        setMessage("Payment information is missing.");
        return;
      }

      try {
        console.log("========== CALLING VERIFY API ==========");

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

        console.log("========== VERIFY API RESPONDED ==========");
        console.log("HTTP status:", response.status);

        const data = await response.json();

        console.log("========== VERIFY RESPONSE ==========");
        console.log(data);

        if (!response.ok || !data.success) {
          console.error("Payment verification failed:", data);

          setMessage(
            data.error || "We could not verify your payment."
          );

          return;
        }

        console.log("========== PAYMENT VERIFIED ==========");
        console.log("Order ID:", data.orderId);

        setMessage("Payment successful! Redirecting...");

        router.replace(`/order-success?orderId=${data.orderId}`);
      } catch (error) {
        console.error("========== VERIFY REQUEST FAILED ==========");
        console.error(error);

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

