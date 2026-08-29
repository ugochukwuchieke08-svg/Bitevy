"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  ImageIcon,
  Loader2,
  MapPin,
  Phone,
  Store,
  FileText,
} from "lucide-react";

export default function EditRestaurantForm({
  restaurant,
}: {
  restaurant: any;
}) {
  const router = useRouter();

  const [name, setName] = useState(restaurant.name || "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(restaurant.image || "");
  const [address, setAddress] = useState(restaurant.address || "");
  const [phone, setPhone] = useState(restaurant.phone || "");
  const [description, setDescription] = useState(
    restaurant.description || ""
  );
  const [isOpen, setIsOpen] = useState(
    restaurant.is_open ?? true
  );

  const [saving, setSaving] = useState(false);

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("Please enter your restaurant name.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl = restaurant.image;

      /*
       * Upload new image only if the user selected one.
       */
      if (image) {
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

        if (!upload.ok) {
          throw new Error("Image upload failed.");
        }

        const uploadData = await upload.json();

        if (!uploadData.secure_url) {
          throw new Error("Cloudinary did not return an image URL.");
        }

        imageUrl = uploadData.secure_url;
      }

      const { error } = await supabase
        .from("restaurants")
        .update({
          name: name.trim(),
          image: imageUrl,
          address: address.trim(),
          phone: phone.trim(),
          description: description.trim(),
          is_open: isOpen,
        })
        .eq("id", restaurant.id);

      if (error) {
        throw new Error(error.message);
      }

      router.refresh();

      alert("Restaurant updated successfully.");
    } catch (error: any) {
      alert(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Restaurant Information */}
      <section className="bg-white rounded-[28px] border border-black/5 shadow-sm overflow-hidden">

        <div className="px-5 sm:px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-orange-600" />
            </div>

            <div>
              <h2 className="font-black text-lg text-gray-900">
                Restaurant Information
              </h2>

              <p className="text-sm text-gray-500 mt-0.5">
                Update your restaurant details.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Restaurant Name
            </label>

            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mama's Kitchen"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 outline-none transition focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Restaurant Address
            </label>

            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your restaurant address"
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 outline-none resize-none transition focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Phone Number
            </label>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                type="tel"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 outline-none transition focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Description
            </label>

            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers a little about your restaurant..."
                rows={5}
                maxLength={500}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 outline-none resize-none transition focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <p className="text-xs text-gray-400 text-right mt-1">
              {description.length}/500
            </p>
          </div>

        </div>
      </section>

      {/* Restaurant Image */}
      <section className="bg-white rounded-[28px] border border-black/5 shadow-sm overflow-hidden">

        <div className="px-5 sm:px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-orange-600" />
            </div>

            <div>
              <h2 className="font-black text-lg text-gray-900">
                Restaurant Image
              </h2>

              <p className="text-sm text-gray-500 mt-0.5">
                Use a clear image that represents your restaurant.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">

          <label
            htmlFor="restaurant-image"
            className="group relative block cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-orange-400 hover:bg-orange-50/40 transition"
          >

            {preview ? (
              <div className="relative">

                <img
                  src={preview}
                  alt="Restaurant preview"
                  className="w-full h-64 sm:h-80 object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">

                  <div className="opacity-0 group-hover:opacity-100 transition bg-white rounded-2xl px-5 py-3 flex items-center gap-2 shadow-xl">
                    <Camera className="w-5 h-5 text-gray-900" />

                    <span className="font-bold text-gray-900">
                      Change Image
                    </span>
                  </div>

                </div>

              </div>
            ) : (
              <div className="h-64 sm:h-80 flex flex-col items-center justify-center text-center px-6">

                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-orange-600" />
                </div>

                <h3 className="mt-4 font-black text-gray-900">
                  Upload restaurant image
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Click to choose an image from your device
                </p>

                <span className="mt-3 text-xs text-gray-400">
                  JPG, PNG or WEBP • Max 5MB
                </span>

              </div>
            )}

            <input
              id="restaurant-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

          </label>

          {image && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-700 font-semibold">
              <Check className="w-4 h-4" />
              New image selected
            </div>
          )}

        </div>
      </section>


{/* Restaurant Status */}
<section className="bg-white rounded-[28px] border border-black/5 shadow-sm p-5 sm:p-6">

  <div className="flex items-center justify-between gap-5">

    {/* Status information */}
    <div className="flex items-center gap-4 min-w-0">

      <div
        className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
          isOpen
            ? "bg-green-100"
            : "bg-gray-100"
        }`}
      >
        <span
          className={`h-3.5 w-3.5 rounded-full transition-colors ${
            isOpen
              ? "bg-green-500"
              : "bg-gray-400"
          }`}
        />
      </div>

      <div className="min-w-0">
        <h2 className="font-black text-gray-900">
          Restaurant Status
        </h2>

        <p
          className={`text-sm font-semibold mt-0.5 ${
            isOpen
              ? "text-green-600"
              : "text-gray-500"
          }`}
        >
          {isOpen ? "Currently Open" : "Currently Closed"}
        </p>

        <p className="text-xs text-gray-400 mt-1 hidden sm:block">
          {isOpen
            ? "Customers can place orders."
            : "Customers cannot place new orders."
          }
        </p>
      </div>

    </div>

    {/* Toggle */}
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      aria-label={
        isOpen
          ? "Close restaurant"
          : "Open restaurant"
      }
      aria-pressed={isOpen}
      className={`relative shrink-0 w-[68px] h-9 rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-4 ${
        isOpen
          ? "bg-green-500 focus:ring-green-500/20"
          : "bg-gray-300 focus:ring-gray-300/30"
      }`}
    >

      {/* Toggle knob */}
      <span
        className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow-md transition-transform duration-300 ${
          isOpen
            ? "translate-x-7"
            : "translate-x-0"
        }`}
      />

    </button>

  </div>

</section>



      {/* Save Button */}
      <div className="sticky bottom-4 z-20">

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-black text-white py-4 px-6 font-black text-base shadow-xl shadow-black/10 hover:bg-gray-800 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>

      </div>

    </div>
  );
}