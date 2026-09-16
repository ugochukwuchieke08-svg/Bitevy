"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LocationPicker from "@/components/location/LocationPicker";
export default function RestaurantSignupPage() {
  const router = useRouter();

const [latitude, setLatitude] = useState<number | null>(null);
const [longitude, setLongitude] = useState<number | null>(null);
const [address, setAddress] = useState("");

const [name, setName] = useState("");
const [time, setTime] = useState("");
const [delivery, setDelivery] = useState("");

const [image, setImage] = useState<File | null>(null);
const [preview, setPreview] = useState("");
const { user, loading: authLoading } = useAuth();

const [banks, setBanks] = useState<
{ code: string; name: string }[]
  >([]);
const [phone, setPhone] = useState("");

const [bankCode, setBankCode] = useState("");
const [accountNumber, setAccountNumber] = useState("");
const [accountName, setAccountName] = useState("");

const [loadingBanks, setLoadingBanks] = useState(true);
const [verifyingAccount, setVerifyingAccount] = useState(false);
const [accountVerified, setAccountVerified] = useState(false);

  useEffect(() => {
  async function loadBanks() {
    try {
      const response = await fetch("/api/flutterwave/banks");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load banks");
      }

      setBanks(data.banks);
    } catch (error) {
      console.error("BANK LOADING ERROR:", error);
      alert("Unable to load banks.");
    } finally {
      setLoadingBanks(false);
    }
  }

  loadBanks();
}, []);

 if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }
  async function handleSubmit() {

    if (!phone.trim()) {
  alert("Enter the restaurant phone number.");
  return;
}

if (!bankCode || accountNumber.length !== 10) {
  alert("Enter and verify the restaurant payout account.");
  return;
}

if (!accountVerified) {
  alert("Please verify the restaurant bank account first.");
  return;
}

    if (!user) {
      alert("Please login.");
      return;
    }

    if (!image) {
      alert("Choose an image.");
      return;
    }

    if (
      latitude === null ||
      longitude === null ||
      !address
    ) {
      alert("Please select your restaurant location.");
      return;
    }

    const formData = new FormData();

    formData.append("file", image);

    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const upload = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadData = await upload.json();

    const imageUrl = uploadData.secure_url;
    console.log("RESTAURANT DATA BEFORE INSERT:", {
      owner_id: user.id,
      name,
      address,
      latitude,
      longitude,
    });
   const { data, error } = await supabase
  .from("restaurants")
  .insert({
    owner_id: user.id,
    name,
    image: imageUrl,
    rating: 5,
    time,
    delivery,
    address,
    latitude,
    longitude,
  })
  .select()
  .single();

console.log("RESTAURANT INSERT RESULT:", {
  data,
  error,
});

if (error) {
  alert(error.message);
  return;
}

// Create Flutterwave subaccount
try {
  const normalizedPhone = phone
    .replace(/\s/g, "")
    .replace(/^0/, "+234");

  const subaccountResponse = await fetch(
    "/api/flutterwave/create-subaccount",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bankCode,
        accountNumber,
        businessName: name,
        businessEmail: user.email,
        businessMobile: normalizedPhone,
        businessContact: name,
      }),
    }
  );

  const subaccountData = await subaccountResponse.json();

  if (!subaccountResponse.ok || !subaccountData.success) {
    console.error(
      "SUBACCOUNT CREATION FAILED:",
      subaccountData
    );

    alert(
      subaccountData.message ||
        "Restaurant created, but payout account setup failed."
    );

    return;
  }

console.log(
  "FLUTTERWAVE SUBACCOUNT CREATED:",
  subaccountData
);

// Save payout information to the restaurant
const { error: payoutUpdateError } = await supabase
  .from("restaurants")
  .update({
    flutterwave_subaccount_id: subaccountData.subaccountId,
    payout_bank_code: bankCode,
    payout_account_name: subaccountData.accountName,
    payout_account_last4: accountNumber.slice(-4),
    payout_status: "active",
  })
  .eq("id", data.id)
  .eq("owner_id", user.id);

if (payoutUpdateError) {
  console.error(
    "PAYOUT INFORMATION UPDATE ERROR:",
    payoutUpdateError
  );

  alert(
    "Restaurant was created, but we couldn't save the payout information."
  );

  return;
}

alert("Restaurant and payout account created!");

router.push("/restaurant/dashboard");

} catch (error) {
  console.error("SUBACCOUNT CREATION ERROR:", error);

  // Keep the restaurant, but mark payout setup as failed
  const { error: statusError } = await supabase
    .from("restaurants")
    .update({
      payout_status: "failed",
    })
    .eq("id", data.id)
    .eq("owner_id", user.id);

  if (statusError) {
    console.error(
      "PAYOUT STATUS UPDATE ERROR:",
      statusError
    );
  }

  alert(
    "Restaurant was created, but the payout account could not be set up. Please try again."
  );
}
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">

      <h1 className="text-3xl font-black text-black mb-8">
        Register Restaurant
      </h1>

      <div className="space-y-5">

        {preview ? (
          <img
            src={preview}
            className="w-full h-56 object-cover rounded-3xl"
          />
        ) : (
          <div className="w-full h-56 rounded-3xl border-2 border-dashed flex items-center justify-center bg-white text-black">
            Restaurant Image
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (!e.target.files?.length) return;

            const file = e.target.files[0];

            setImage(file);

            setPreview(URL.createObjectURL(file));
          }}
          className="w-full text-gray-500"
        />

        <input
          placeholder="Restaurant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

        <input
          type="tel"
          placeholder="Restaurant phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

        <input
          placeholder="Delivery time (e.g. 20-30 mins)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />

        <input
          placeholder="Delivery fee (e.g. ₦1000)"
          value={delivery}
          onChange={(e) => setDelivery(e.target.value)}
          className="w-full bg-white rounded-2xl p-4 border text-black"
        />
<div className="space-y-4 pt-2">
  <h2 className="text-lg font-bold text-black">
    Restaurant payout account
  </h2>

  <p className="text-sm text-gray-500">
    This is where your restaurant earnings will be paid.
  </p>

  <select
    value={bankCode}
    onChange={(e) => {
      setBankCode(e.target.value);
      setAccountVerified(false);
      setAccountName("");
    }}
    disabled={loadingBanks}
    className="w-full bg-white rounded-2xl p-4 border text-black"
  >
    <option value="">
      {loadingBanks ? "Loading banks..." : "Select your bank"}
    </option>

    {banks.map((bank) => (
      <option key={bank.code} value={bank.code}>
        {bank.name}
      </option>
    ))}
  </select>

  <input
    placeholder="Account number"
    value={accountNumber}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, "");

      setAccountNumber(value);
      setAccountVerified(false);
      setAccountName("");
    }}
    inputMode="numeric"
    maxLength={10}
    className="w-full bg-white rounded-2xl p-4 border text-black"
  />

  <button
    type="button"
    disabled={
      verifyingAccount ||
      !bankCode ||
      accountNumber.length !== 10
    }
    onClick={async () => {
      setVerifyingAccount(true);
      setAccountVerified(false);
      setAccountName("");

      try {
        const response = await fetch(
          "/api/flutterwave/resolve-account",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              accountNumber,
              bankCode,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to verify account."
          );
        }

        setAccountName(data.accountName);
        setAccountVerified(true);
      } catch (error) {
        console.error("ACCOUNT VERIFICATION ERROR:", error);

        alert(
          error instanceof Error
            ? error.message
            : "Unable to verify account."
        );
      } finally {
        setVerifyingAccount(false);
      }
    }}
    className="w-full bg-black text-white py-3 rounded-2xl font-bold disabled:opacity-50"
  >
    {verifyingAccount ? "Verifying..." : "Verify Account"}
  </button>

  {accountVerified && (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
      <p className="text-sm text-green-700">
        Account verified
      </p>

      <p className="font-bold text-green-900">
        {accountName}
      </p>
    </div>
  )}
</div>
         

        <div className="pt-2">
          <h2 className="mb-2 text-lg font-bold text-black">
            Restaurant location
          </h2>

          <p className="mb-4 text-sm text-gray-500">
            Select the exact location of your restaurant.
          </p>

         <LocationPicker
            onLocationConfirm={({ latitude, longitude, address }) => {
              console.log("LOCATION CONFIRMED:", {
                latitude,
                longitude,
                address,
              });

              setLatitude(latitude);
              setLongitude(longitude);
              setAddress(address);
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold"
        >
          Create Restaurant
        </button>

      </div>

    </main>
  );
}