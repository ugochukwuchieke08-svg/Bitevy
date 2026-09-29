"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  CreditCard,
  FileCheck,
  Image as ImageIcon,
  Phone,
  User,
  Wallet,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export default function RiderSignupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bikeType, setBikeType] = useState("");

  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [banks, setBanks] = useState<
    { code: string; name: string }[]
  >([]);

  const [bankLoading, setBankLoading] = useState(false);
  const [verifyingAccount, setVerifyingAccount] =
    useState(false);
  const [accountVerified, setAccountVerified] =
    useState(false);

  const [bankSearch, setBankSearch] = useState("");

  const [ninNumber, setNinNumber] = useState("");

  const [profileImage, setProfileImage] =
    useState<File | null>(null);
  const [ninImage, setNinImage] =
    useState<File | null>(null);

  const [profilePreview, setProfilePreview] =
    useState("");
  const [ninPreview, setNinPreview] =
    useState("");

  // --------------------------------------------------
  // Load existing profile information
  // --------------------------------------------------

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return;
      }

      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      }
    }

    loadProfile();
  }, [user]);

  // --------------------------------------------------
  // Load banks
  // --------------------------------------------------

  useEffect(() => {
    async function loadBanks() {
      setBankLoading(true);

      try {
        const response = await fetch(
          "/api/flutterwave/banks"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load banks."
          );
        }

        const uniqueBanks: { code: string; name: string }[] = Array.from(
        new Map<string, { code: string; name: string }>(
          (data.banks || []).map(
            (bank: { code: string; name: string }) => [bank.code, bank]
          )
        ).values()
      );

        setBanks(uniqueBanks);
      } catch (error) {
        console.error("Bank loading error:", error);
        alert(
          "Unable to load banks. Please try again."
        );
      } finally {
        setBankLoading(false);
      }
    }

    loadBanks();
  }, []);

  // --------------------------------------------------
  // Upload to Cloudinary
  // --------------------------------------------------

  async function uploadToCloudinary(file: File) {
    const formData = new FormData();

    formData.append("file", file);

    formData.append(
      "upload_preset",
      process.env
        .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Image upload failed.");
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error(
        "Cloudinary did not return an image URL."
      );
    }

    return data.secure_url;
  }

  // --------------------------------------------------
  // Verify bank account
  // --------------------------------------------------

  async function verifyBankAccount() {
    if (!bankCode || !bankName) {
      alert("Please select your bank.");
      return;
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      alert(
        "Please enter a valid 10-digit account number."
      );
      return;
    }

    setVerifyingAccount(true);

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
        setAccountVerified(false);
        setAccountName("");

        alert(
          data.message ||
            "Unable to verify bank account."
        );

        return;
      }

      setAccountName(data.accountName);
      setAccountVerified(true);
    } catch (error) {
      console.error(
        "Account verification error:",
        error
      );

      setAccountVerified(false);
      setAccountName("");

      alert("Unable to verify bank account.");
    } finally {
      setVerifyingAccount(false);
    }
  }

  // --------------------------------------------------
  // Step validation
  // --------------------------------------------------

  function validateStepOne() {
    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return false;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return false;
    }

    if (!bikeType.trim()) {
      alert("Please enter your bike type.");
      return false;
    }

    if (!profileImage) {
      alert("Please upload a profile photo.");
      return false;
    }

    return true;
  }

  function validateStepTwo() {
    if (!ninNumber.trim()) {
      alert("Please enter your NIN number.");
      return false;
    }

    if (!ninImage) {
      alert("Please upload your NIN photo.");
      return false;
    }

    return true;
  }

  function validateStepThree() {
    if (!bankCode || !bankName) {
      alert("Please select your bank.");
      return false;
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      alert(
        "Please enter a valid 10-digit account number."
      );
      return false;
    }

    if (!accountVerified || !accountName) {
      alert(
        "Please verify your bank account before submitting."
      );
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
    if (loading) return;

    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
    }
  }

  // --------------------------------------------------
  // Submit application
  // --------------------------------------------------

  async function handleSubmit() {
    // Prevent multiple submissions
    if (loading) return;

    if (!user) {
      alert(
        "Please log in to apply as a rider."
      );

      router.push(
        "/login?redirect=/signup/rider"
      );

      return;
    }

    if (!validateStepOne()) {
      setStep(1);
      return;
    }

    if (!validateStepTwo()) {
      setStep(2);
      return;
    }

    if (!validateStepThree()) {
      setStep(3);
      return;
    }

    setLoading(true);

    try {
      // Check if user already has an active or pending application
      const {
        data: existingApplication,
        error: existingError,
      } = await supabase
        .from("rider_applications")
        .select("id, status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingApplication) {
        if (
          existingApplication.status === "pending"
        ) {
          alert(
            "Your rider application is already under review."
          );

          router.push("/rider");
          return;
        }

        if (
          existingApplication.status === "active"
        ) {
          alert(
            "You already have an active rider account."
          );

          router.push("/rider");
          return;
        }
      }

      // Upload profile image
      if (!profileImage || !ninImage) {
      alert("Please upload both your profile photo and NIN photo.");
      return;
    }

    const profileImageUrl = await uploadToCloudinary(profileImage);
    const ninImageUrl = await uploadToCloudinary(ninImage);

      // Create / update rider application
      const { error: applicationError } =
        await supabase
          .from("rider_applications")
          .upsert(
            {
              user_id: user.id,
              full_name: fullName.trim(),
              phone: phone.trim(),
              bike_type: bikeType.trim(),
              bank_code: bankCode.trim(),
              bank_name: bankName.trim(),
              account_number:
                accountNumber.trim(),
              account_name:
                accountName.trim(),
              nin_number: ninNumber.trim(),
              nin_image: ninImageUrl,
              profile_image:
                profileImageUrl,
              status: "pending",
            },
            {
              onConflict: "user_id",
            }
          );

      if (applicationError) {
        throw applicationError;
      }

      alert(
        "Your rider application has been submitted successfully. We will notify you after review."
      );

      router.push("/rider");
    } catch (error: any) {
      console.error(
        "Rider application error:",
        error
      );

      alert(
        error?.message ||
          "Something went wrong while submitting your application."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Auth loading
  // --------------------------------------------------

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center p-5">
        <p className="text-gray-700 font-semibold">
          Loading...
        </p>
      </main>
    );
  }

  // --------------------------------------------------
  // Not logged in
  // --------------------------------------------------

  if (!user) {
    return (
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <Bike size={27} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-gray-900">
            Login Required
          </h1>

          <p className="mt-3 text-gray-600">
            Please log in to your Bitevy account before
            applying to become a rider.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/login?redirect=/signup/rider"
              )
            }
            className="mt-6 w-full rounded-2xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600"
          >
            Login to Continue
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-orange-600">
            Rider application
          </p>

          <h1 className="mt-1 text-3xl font-black text-black sm:text-4xl">
            Become a Bitevy Rider
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Complete your application and submit it for
            review.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2">

            {[1, 2, 3].map((item) => {
              const active = step === item;
              const completed = step > item;

              return (
                <div
                  key={item}
                  className="flex flex-1 items-center gap-2"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      active || completed
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
                      className={`text-xs font-bold sm:text-sm ${
                        active
                          ? "text-black"
                          : "text-gray-400"
                      }`}
                    >
                      {item === 1
                        ? "Information"
                        : item === 2
                        ? "Identity"
                        : "Submit"}
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

        {/* ==========================================
            STEP 1 — RIDER INFORMATION
        ========================================== */}

        {step === 1 && (
          <section className="space-y-5">

            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <User size={20} />

                  <h2 className="text-xl font-bold text-black">
                    Rider information
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  Tell us about yourself and the bike
                  you use for deliveries.
                </p>
              </div>

              {/* Profile photo */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Profile photo
                </label>

                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                    className="h-56 w-full rounded-3xl object-cover"
                  />
                ) : (
                  <div className="flex h-56 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                    <ImageIcon size={32} />

                    <p className="mt-2 text-sm font-medium">
                      Upload profile photo
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (!file) return;

                    setProfileImage(file);
                    setProfilePreview(
                      URL.createObjectURL(file)
                    );
                  }}
                  className="mt-3 w-full text-sm text-gray-500 file:mr-3 file:rounded-xl file:border-0 file:bg-orange-50 file:px-4 file:py-3 file:font-semibold file:text-orange-600"
                />
              </div>

              {/* Full name */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Full name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    placeholder="Your full name"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-11 pr-4 text-black outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="mt-4">
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Phone number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="Phone number"
                    inputMode="tel"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-11 pr-4 text-black outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Bike */}
              <div className="mt-4">
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Bike type
                </label>

                <div className="relative">
                  <Bike
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={bikeType}
                    onChange={(e) =>
                      setBikeType(e.target.value)
                    }
                    placeholder="e.g. Boxer, Honda, TVS"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-11 pr-4 text-black outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>
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

        {/* ==========================================
            STEP 2 — IDENTITY
        ========================================== */}

        {step === 2 && (
          <section>

            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <FileCheck size={20} />

                  <h2 className="text-xl font-bold text-black">
                    Identity verification
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  We need your NIN details to verify your
                  rider application.
                </p>
              </div>

              {/* NIN */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  NIN number
                </label>

                <input
                  value={ninNumber}
                  onChange={(e) =>
                    setNinNumber(e.target.value)
                  }
                  placeholder="Enter your NIN"
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-black outline-none transition focus:border-orange-500 focus:bg-white"
                />
              </div>

              {/* NIN image */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  NIN photo
                </label>

                {ninPreview ? (
                  <img
                    src={ninPreview}
                    alt="NIN preview"
                    className="h-56 w-full rounded-3xl object-cover"
                  />
                ) : (
                  <div className="flex h-56 w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                    <CreditCard size={32} />

                    <p className="mt-2 text-sm font-medium">
                      Upload NIN photo
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (!file) return;

                    setNinImage(file);
                    setNinPreview(
                      URL.createObjectURL(file)
                    );
                  }}
                  className="mt-3 w-full text-sm text-gray-500 file:mr-3 file:rounded-xl file:border-0 file:bg-orange-50 file:px-4 file:py-3 file:font-semibold file:text-orange-600"
                />
              </div>

              <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                <p className="text-sm leading-6 text-gray-600">
                  Make sure your NIN details and photo
                  are clear and readable. Your application
                  will be reviewed before you can start
                  accepting deliveries.
                </p>
              </div>

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

        {/* ==========================================
            STEP 3 — PAYOUT + REVIEW
        ========================================== */}

        {step === 3 && (
          <section>

            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-6 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                  <Bike size={27} />
                </div>

                <h2 className="mt-4 text-2xl font-black text-black">
                  Ready to ride?
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Add your payout account and review
                  your application before submitting.
                </p>

              </div>

              {/* Payout */}
              <div className="border-b border-gray-100 pb-6">

                <div className="mb-5 flex items-center gap-2">
                  <Wallet size={20} />

                  <h3 className="text-lg font-bold text-black">
                    Payout account
                  </h3>
                </div>

                <p className="mb-4 text-sm text-gray-500">
                  This is where your rider earnings will
                  be paid.
                </p>

                {/* Bank */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    Bank
                  </label>

                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => {
                      setBankSearch(e.target.value);
                      setBankCode("");
                      setBankName("");
                      setAccountVerified(false);
                      setAccountName("");
                    }}
                    placeholder={
                      bankLoading
                        ? "Loading banks..."
                        : "Search your bank"
                    }
                    disabled={bankLoading}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-black outline-none focus:border-orange-500 focus:bg-white"
                  />

                  {bankSearch.trim() &&
                    !bankCode && (
                      <div className="mt-2 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white">

                        {banks
                          .filter((bank) =>
                            bank.name
                              .toLowerCase()
                              .includes(
                                bankSearch.toLowerCase()
                              )
                          )
                          .slice(0, 20)
                          .map((bank) => (
                            <button
                              key={bank.code}
                              type="button"
                              onClick={() => {
                                setBankCode(
                                  bank.code
                                );
                                setBankName(
                                  bank.name
                                );
                                setBankSearch(
                                  bank.name
                                );
                                setAccountVerified(
                                  false
                                );
                                setAccountName("");
                              }}
                              className="w-full px-4 py-3 text-left text-black transition hover:bg-orange-50"
                            >
                              {bank.name}
                            </button>
                          ))}

                        {banks.filter((bank) =>
                          bank.name
                            .toLowerCase()
                            .includes(
                              bankSearch.toLowerCase()
                            )
                        ).length === 0 && (
                          <p className="px-4 py-3 text-gray-500">
                            No bank found.
                          </p>
                        )}

                      </div>
                    )}

                  {bankCode && (
                    <div className="mt-2 flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-3">

                      <span className="font-semibold text-green-800">
                        {bankName}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setBankCode("");
                          setBankName("");
                          setBankSearch("");
                          setAccountVerified(
                            false
                          );
                          setAccountName("");
                          setAccountNumber("");
                        }}
                        className="text-sm font-bold text-red-600"
                      >
                        Change
                      </button>

                    </div>
                  )}
                </div>

                {/* Account */}
                {bankCode && (
                  <div className="mt-4">

                    <label className="mb-2 block text-sm font-bold text-gray-800">
                      Account number
                    </label>

                    <div className="flex flex-col gap-2 sm:flex-row">

                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => {
                          setAccountNumber(
                            e.target.value.replace(
                              /\D/g,
                              ""
                            )
                          );

                          setAccountVerified(
                            false
                          );

                          setAccountName("");
                        }}
                        placeholder="10-digit account number"
                        inputMode="numeric"
                        maxLength={10}
                        className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-black outline-none focus:border-orange-500 focus:bg-white"
                      />

                      <button
                        type="button"
                        onClick={
                          verifyBankAccount
                        }
                        disabled={
                          verifyingAccount ||
                          !bankCode ||
                          accountNumber.length !==
                            10
                        }
                        className="rounded-2xl bg-black px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {verifyingAccount
                          ? "Verifying..."
                          : "Verify"}
                      </button>

                    </div>

                  </div>
                )}

                {/* Verified */}
                {accountVerified &&
                  accountName && (
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

                      <p className="mt-1 text-sm text-green-700">
                        {bankName} •{" "}
                        {accountNumber}
                      </p>

                    </div>
                  )}

              </div>

              {/* Application summary */}
              <div className="pt-6">

                <div className="mb-4 flex items-center gap-2">
                  <FileCheck size={20} />

                  <h3 className="text-lg font-bold text-black">
                    Application summary
                  </h3>
                </div>

                <div className="overflow-hidden rounded-3xl border border-gray-200">

                  {profilePreview && (
                    <img
                      src={profilePreview}
                      alt={fullName}
                      className="h-48 w-full object-cover"
                    />
                  )}

                  <div className="divide-y divide-gray-100">

                    <div className="flex items-center justify-between gap-4 p-4">
                      <div>
                        <p className="text-xs text-gray-400">
                          Full name
                        </p>

                        <p className="mt-1 font-bold text-black">
                          {fullName}
                        </p>
                      </div>

                      <User
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
                          Bike
                        </p>

                        <p className="mt-1 font-medium text-black">
                          {bikeType}
                        </p>
                      </div>

                      <Bike
                        size={19}
                        className="shrink-0 text-gray-400"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4">
                      <div>
                        <p className="text-xs text-gray-400">
                          NIN
                        </p>

                        <p className="mt-1 font-medium text-black">
                          {ninNumber}
                        </p>
                      </div>

                      <FileCheck
                        size={19}
                        className="shrink-0 text-gray-400"
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
                          ****
                          {accountNumber.slice(
                            -4
                          )}
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

              </div>

              <div className="mt-5 rounded-2xl bg-orange-50 p-4">
                <p className="text-sm leading-6 text-orange-900">
                  After submitting, your application
                  will be reviewed by Bitevy. You can
                  start receiving delivery requests once
                  your rider account is approved.
                </p>
              </div>

            </div>

            {/* Final actions */}
            <div className="mt-5 flex gap-3">

              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 font-bold text-black disabled:opacity-50"
              >
                <ArrowLeft size={19} />
                Back
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex flex-[1.8] items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Submitting Application..."
                ) : (
                  <>
                    Submit Application
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