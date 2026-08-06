"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export default function RiderSignupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bikeType, setBikeType] = useState("");

  const [ninNumber, setNinNumber] = useState("");

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [ninImage, setNinImage] = useState<File | null>(null);

  const [profilePreview, setProfilePreview] = useState("");
  const [ninPreview, setNinPreview] = useState("");

  const [loading, setLoading] = useState(false);

  // Load existing profile information
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

  async function uploadToCloudinary(file: File) {
    const formData = new FormData();

    formData.append("file", file);

    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
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
      throw new Error("Cloudinary did not return an image URL.");
    }

    return data.secure_url;
  }

  async function handleSubmit() {
    if (!user) {
      alert("Please log in to apply as a rider.");
      router.push("/login?redirect=/signup/rider");
      return;
    }

    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (!bikeType.trim()) {
      alert("Please enter your bike type.");
      return;
    }

    if (!ninNumber.trim()) {
      alert("Please enter your NIN number.");
      return;
    }

    if (!profileImage) {
      alert("Please upload a profile photo.");
      return;
    }

    if (!ninImage) {
      alert("Please upload your NIN photo.");
      return;
    }

    setLoading(true);

    try {
      // Check if user already has an active or pending application
      const { data: existingApplication, error: existingError } =
        await supabase
          .from("rider_applications")
          .select("id, status")
          .eq("user_id", user.id)
          .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingApplication) {
        if (existingApplication.status === "pending") {
          alert("Your rider application is already under review.");
          router.push("/rider");
          return;
        }

        if (existingApplication.status === "active") {
          alert("You already have an active rider account.");
          router.push("/rider");
          return;
        }
      }

      // Upload profile image
      const profileImageUrl = await uploadToCloudinary(profileImage);

      // Upload NIN image
      const ninImageUrl = await uploadToCloudinary(ninImage);

      // Create rider application
      const { error: applicationError } = await supabase
        .from("rider_applications")
        .upsert(
          {
            user_id: user.id,
            full_name: fullName.trim(),
            phone: phone.trim(),
            bike_type: bikeType.trim(),
            nin_number: ninNumber.trim(),
            nin_image: ninImageUrl,
            profile_image: profileImageUrl,
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
      console.error("Rider application error:", error);

      alert(
        error?.message ||
          "Something went wrong while submitting your application."
      );
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center p-5">
        <p className="text-gray-700 font-semibold">
          Loading...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#fff8f0] flex items-center justify-center p-5">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-black text-gray-900">
            Login Required
          </h1>

          <p className="mt-3 text-gray-600">
            Please log in to your Bitevy account before applying to become a
            rider.
          </p>

          <button
            onClick={() =>
              router.push("/login?redirect=/signup/rider")
            }
            className="mt-6 w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-2xl font-bold transition"
          >
            Login to Continue
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5">
      <div className="max-w-md mx-auto">

        <h1 className="text-3xl font-black text-black mb-2">
          Become a Bitevy Rider
        </h1>

        <p className="text-gray-600 mb-8">
          Submit your details for review. You'll be notified once your rider
          application is approved.
        </p>

        <div className="space-y-5">

          {/* Profile image */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Profile Photo
            </label>

            {profilePreview ? (
              <img
                src={profilePreview}
                alt="Profile preview"
                className="w-full h-56 object-cover rounded-3xl"
              />
            ) : (
              <div className="w-full h-56 rounded-3xl border-2 border-dashed flex items-center justify-center bg-white text-gray-500">
                Upload Profile Photo
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                setProfileImage(file);
                setProfilePreview(URL.createObjectURL(file));
              }}
              className="w-full mt-3 text-gray-500"
            />
          </div>

          {/* Full name */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Full Name
            </label>

            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-white rounded-2xl p-4 border border-gray-200 text-black outline-none focus:border-green-700"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Phone Number
            </label>

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="w-full bg-white rounded-2xl p-4 border border-gray-200 text-black outline-none focus:border-green-700"
            />
          </div>

          {/* Bike */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Bike Type
            </label>

            <input
              value={bikeType}
              onChange={(e) => setBikeType(e.target.value)}
              placeholder="e.g. Boxer, Honda, TVS"
              className="w-full bg-white rounded-2xl p-4 border border-gray-200 text-black outline-none focus:border-green-700"
            />
          </div>

          {/* NIN */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              NIN Number
            </label>

            <input
              value={ninNumber}
              onChange={(e) => setNinNumber(e.target.value)}
              placeholder="Enter your NIN"
              className="w-full bg-white rounded-2xl p-4 border border-gray-200 text-black outline-none focus:border-green-700"
            />
          </div>

          {/* NIN image */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              NIN Photo
            </label>

            {ninPreview ? (
              <img
                src={ninPreview}
                alt="NIN preview"
                className="w-full h-56 object-cover rounded-3xl"
              />
            ) : (
              <div className="w-full h-56 rounded-3xl border-2 border-dashed flex items-center justify-center bg-white text-gray-500">
                Upload NIN Photo
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                setNinImage(file);
                setNinPreview(URL.createObjectURL(file));
              }}
              className="w-full mt-3 text-gray-500"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white py-4 rounded-2xl font-bold transition"
          >
            {loading ? "Submitting Application..." : "Submit Application"}
          </button>

        </div>
      </div>
    </main>
  );
}