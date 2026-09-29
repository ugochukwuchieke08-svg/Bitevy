"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Image as ImageIcon,
  MapPin,
  Phone,
  Store,
  Wallet,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LocationPicker from "@/components/location/LocationPicker";

export default function RestaurantSignupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState("");

  const [name, setName] = useState("");
  const [time, setTime] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

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
  const [bankSearch, setBankSearch] = useState("");
  const [showBankList, setShowBankList] = useState(false);

  const bankPickerRef = useRef<HTMLDivElement>(null);

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        bankPickerRef.current &&
        !bankPickerRef.current.contains(event.target as Node)
      ) {
        setShowBankList(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowBankList(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center">
        <p className="text-sm font-medium text-gray-500">
          Loading...
        </p>
      </main>
    );
  }

  function validateStepOne() {
    if (!name.trim()) {
      alert("Enter the restaurant name.");
      return false;
    }

    if (!phone.trim()) {
      alert("Enter the restaurant phone number.");
      return false;
    }

    if (!time.trim()) {
      alert("Enter the restaurant delivery time.");
      return false;
    }

    if (!image) {
      alert("Choose a restaurant image.");
      return false;
    }

    if (!bankCode || accountNumber.length !== 10) {
      alert("Enter and verify the restaurant payout account.");
      return false;
    }

    if (!accountVerified) {
      alert("Please verify the restaurant bank account first.");
      return false;
    }

    return true;
  }

  function validateStepTwo() {
    if (
      latitude === null ||
      longitude === null ||
      !address
    ) {
      alert("Please select your restaurant location.");
      return false;
    }

    return true;
  }

  function handleNext() {
    if (step === 1) {
      if (!validateStepOne()) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!validateStepTwo()) return;
      setStep(3);
    }
  }

  function handleBack() {
    if (submitting) return;

    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
    }
  }

  async function handleSubmit() {
    if (submitting) return;

    if (!validateStepOne()) {
      setStep(1);
      return;
    }

    if (!validateStepTwo()) {
      setStep(2);
      return;
    }

    if (!user) {
      alert("Please login.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("file", image!);

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

      if (!upload.ok || !uploadData.secure_url) {
        throw new Error("Restaurant image upload failed.");
      }

      const imageUrl = uploadData.secure_url;

      const { data, error } = await supabase
        .from("restaurants")
        .insert({
          owner_id: user.id,
          name,
          image: imageUrl,
          rating: 5,
          time,
          address,
          latitude,
          longitude,
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

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

        const subaccountData =
          await subaccountResponse.json();

        if (
          !subaccountResponse.ok ||
          !subaccountData.success
        ) {
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

        const {
          error: payoutUpdateError,
        } = await supabase
          .from("restaurants")
          .update({
            flutterwave_subaccount_id:
              subaccountData.subaccountId,
            payout_bank_code: bankCode,
            payout_account_name:
              subaccountData.accountName,
            payout_account_last4:
              accountNumber.slice(-4),
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
        console.error(
          "SUBACCOUNT CREATION ERROR:",
          error
        );

        const { error: statusError } =
          await supabase
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
    } catch (error) {
      console.error(
        "RESTAURANT CREATION ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your restaurant."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-orange-600">
            Restaurant onboarding
          </p>

          <h1 className="mt-1 text-3xl sm:text-4xl font-black text-black">
            Register your restaurant
          </h1>

          <p className="mt-2 text-sm sm:text-base text-gray-500">
            Complete these steps to start receiving orders on Bitevy.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-2">
            {[1, 2, 3].map((item) => {
              const active = step === item;
              const completed = step > item;

              return (
                <div
                  key={item}
                  className="flex flex-1 items-center gap-2"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                      completed || active
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {completed ? (
                      <Check size={17} />
                    ) : (
                      item
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-bold ${
                        active
                          ? "text-black"
                          : "text-gray-400"
                      }`}
                    >
                      {item === 1
                        ? "Information"
                        : item === 2
                        ? "Location"
                        : "Start"}
                    </p>
                  </div>

                  {item !== 3 && (
                    <div
                      className={`ml-auto h-px flex-1 ${
                        step > item
                          ? "bg-orange-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <section className="space-y-5">
            <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <Store size={20} />
                  <h2 className="text-xl font-bold text-black">
                    Restaurant information
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Tell customers a little about your restaurant.
                </p>
              </div>

              {/* Image */}
              <div className="space-y-3">
                {preview ? (
                  <img
                    src={preview}
                    alt="Restaurant preview"
                    className="h-52 sm:h-64 w-full rounded-3xl object-cover"
                  />
                ) : (
                  <div className="flex h-52 sm:h-64 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                    <ImageIcon size={32} />
                    <p className="mt-2 text-sm font-medium">
                      Restaurant image
                    </p>
                  </div>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-black">
                    Restaurant image
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (!e.target.files?.length) return;

                      const file = e.target.files[0];

                      setImage(file);
                      setPreview(
                        URL.createObjectURL(file)
                      );
                    }}
                    className="w-full text-sm text-gray-500 file:mr-3 file:rounded-xl file:border-0 file:bg-orange-50 file:px-4 file:py-3 file:font-semibold file:text-orange-600"
                  />
                </label>
              </div>

              {/* Name */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-black">
                  Restaurant name
                </label>

                <div className="relative">
                  <Store
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    placeholder="e.g. Bitevy Kitchen"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-11 pr-4 text-black outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-black">
                  Restaurant phone number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    inputMode="tel"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-11 pr-4 text-black outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Delivery time */}
              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-black">
                  Average delivery time
                </label>

                <div className="relative">
                  <Clock3
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    placeholder="e.g. 20-30 mins"
                    value={time}
                    onChange={(e) =>
                      setTime(e.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-11 pr-4 text-black outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Payout */}
            <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <Wallet size={20} />
                  <h2 className="text-xl font-bold text-black">
                    Payout account
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Your restaurant earnings will be paid into this account.
                </p>
              </div>

              <div
                ref={bankPickerRef}
                className="relative"
              >
                <label className="mb-2 block text-sm font-semibold text-black">
                  Bank
                </label>

                <input
                  type="text"
                  placeholder={
                    loadingBanks
                      ? "Loading banks..."
                      : "Search for your bank"
                  }
                  value={bankSearch}
                  disabled={loadingBanks}
                  onFocus={() => {
                    if (!bankCode) {
                      setShowBankList(true);
                    }
                  }}
                  onChange={(e) => {
                    setBankSearch(e.target.value);
                    setBankCode("");
                    setAccountVerified(false);
                    setAccountName("");
                    setShowBankList(true);
                  }}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-black outline-none focus:border-orange-500 focus:bg-white"
                />

                {showBankList && !loadingBanks && (
                  <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map((bank) => (
                        <button
                          key={bank.code}
                          type="button"
                          onClick={() => {
                            setBankCode(bank.code);
                            setBankSearch(bank.name);
                            setShowBankList(false);
                            setAccountVerified(false);
                            setAccountName("");
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-black transition hover:bg-orange-50"
                        >
                          {bank.name}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-sm text-gray-500">
                        No bank found.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-black">
                  Account number
                </label>

                <input
                  placeholder="10-digit account number"
                  value={accountNumber}
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(/\D/g, "");

                    setAccountNumber(value);
                    setAccountVerified(false);
                    setAccountName("");
                  }}
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-black outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

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
                          "Content-Type":
                            "application/json",
                        },
                        body: JSON.stringify({
                          accountNumber,
                          bankCode,
                        }),
                      }
                    );

                    const data =
                      await response.json();

                    if (
                      !response.ok ||
                      !data.success
                    ) {
                      throw new Error(
                        data.message ||
                          "Unable to verify account."
                      );
                    }

                    setAccountName(
                      data.accountName
                    );
                    setAccountVerified(true);
                  } catch (error) {
                    console.error(
                      "ACCOUNT VERIFICATION ERROR:",
                      error
                    );

                    alert(
                      error instanceof Error
                        ? error.message
                        : "Unable to verify account."
                    );
                  } finally {
                    setVerifyingAccount(false);
                  }
                }}
                className="mt-4 w-full rounded-2xl bg-black py-4 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifyingAccount
                  ? "Verifying..."
                  : "Verify Account"}
              </button>

              {accountVerified && (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check size={18} />
                    <p className="text-sm font-semibold">
                      Account verified
                    </p>
                  </div>

                  <p className="mt-1 font-bold text-green-900">
                    {accountName}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600"
            >
              Continue
              <ArrowRight size={19} />
            </button>
          </section>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <section>
            <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <h2 className="text-xl font-bold text-black">
                    Restaurant location
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Select the exact location of your restaurant.
                </p>
              </div>

              <LocationPicker
                onLocationConfirm={({
                  latitude,
                  longitude,
                  address,
                }) => {
                  setLatitude(latitude);
                  setLongitude(longitude);
                  setAddress(address);
                }}
              />

              {address && (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-green-700"
                    />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                        Selected location
                      </p>

                      <p className="mt-1 text-sm font-medium text-green-900">
                        {address}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 font-bold text-black"
              >
                <ArrowLeft size={19} />
                Back
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600"
              >
                Continue
                <ArrowRight size={19} />
              </button>
            </div>
          </section>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <section>
            <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                  <Check size={28} />
                </div>

                <h2 className="mt-4 text-2xl font-black text-black">
                  Ready to start receiving orders?
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Review your restaurant details before creating your restaurant.
                </p>
              </div>

              {/* Restaurant summary */}
              <div className="overflow-hidden rounded-3xl border border-gray-200">
                {preview && (
                  <img
                    src={preview}
                    alt={name}
                    className="h-48 w-full object-cover"
                  />
                )}

                <div className="divide-y divide-gray-100">
                  <div className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Restaurant
                      </p>
                      <p className="mt-1 font-bold text-black">
                        {name}
                      </p>
                    </div>

                    <Store
                      size={19}
                      className="shrink-0 text-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Phone
                      </p>
                      <p className="mt-1 font-medium text-black">
                        {phone}
                      </p>
                    </div>

                    <Phone
                      size={19}
                      className="shrink-0 text-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Delivery time
                      </p>
                      <p className="mt-1 font-medium text-black">
                        {time}
                      </p>
                    </div>

                    <Clock3
                      size={19}
                      className="shrink-0 text-gray-400"
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 p-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Location
                      </p>
                      <p className="mt-1 font-medium text-black">
                        {address}
                      </p>
                    </div>

                    <MapPin
                      size={19}
                      className="mt-1 shrink-0 text-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Payout account
                      </p>

                      <p className="mt-1 font-medium text-black">
                        {accountName}
                      </p>

                      <p className="text-sm text-gray-500">
                        ****{accountNumber.slice(-4)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 text-green-600">
                      <Check size={17} />
                      <span className="text-sm font-semibold">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-orange-50 p-4">
                <p className="text-sm leading-6 text-orange-900">
                  Once your restaurant is created, you can add your menu and
                  start receiving orders through Bitevy.
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 font-bold text-black disabled:opacity-50"
              >
                <ArrowLeft size={19} />
                Back
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex flex-[1.8] items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  "Creating restaurant..."
                ) : (
                  <>
                    Create Restaurant
                    <Check size={19} />
                  </>
                )}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}