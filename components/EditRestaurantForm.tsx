"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function EditRestaurantForm({
  restaurant,
}: {
  restaurant: any;
}) {
  const router = useRouter();

  const [name, setName] = useState(restaurant.name);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(restaurant.image);
  const [address, setAddress] = useState(restaurant.address || "");
  const [phone, setPhone] = useState(restaurant.phone || "");
  const [description, setDescription] = useState(
    restaurant.description || ""
  );
  const [isOpen, setIsOpen] = useState(
    restaurant.is_open ?? true
  );

  async function handleSave() {
    let imageUrl = restaurant.image;

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

      const uploadData = await upload.json();

      imageUrl = uploadData.secure_url;
    }

   const { error } = await supabase
  .from("restaurants")
  .update({
    name,
    image: imageUrl,
    address,
    phone,
    description,
    is_open: isOpen,
  })
  .eq("id", restaurant.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Restaurant updated!");

    router.refresh();
  }

  return (
    <div className="space-y-6">

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-white border rounded-2xl p-4 text-black"
      />
       
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Restaurant Address"
        className="w-full bg-white border rounded-2xl p-4 text-black"
      />
      
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Restaurant Phone"
        className="w-full bg-white border rounded-2xl p-4 text-black"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Restaurant Description"
        className="w-full bg-white border rounded-2xl p-4 h-36 text-black"
      />

      <div className="bg-white rounded-2xl border p-4 flex justify-between items-center">

        <span className="font-semibold text-black">
          Restaurant Open
        </span>

        <input
          type="checkbox"
          checked={isOpen}
          onChange={(e) => setIsOpen(e.target.checked)}
          className="w-6 h-6"
        />

      </div>

      <div className="space-y-3">

        <img
          src={preview}
          className="w-full h-56 object-cover rounded-3xl"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (!e.target.files?.length) return;

            const file = e.target.files[0];

            setImage(file);

            setPreview(URL.createObjectURL(file));
          }}
          className="w-full bg-white border rounded-2xl p-4 text-black"
        />

      </div>

      <button
        onClick={handleSave}
        className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold"
      >
        Save Changes
      </button>

    </div>
  );
}