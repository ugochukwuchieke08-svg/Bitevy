"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

export default function HomeMenu() {

const [showMenu, setShowMenu] = useState(false);

const router = useRouter();

async function handleLogout() {


await supabase.auth.signOut();

router.push("/login");


}

return ( <div className="relative">

  <button
    onClick={() => setShowMenu(!showMenu)}
    className="w-10 h-10 rounded-full flex items-center justify-center"
  >
    <FontAwesomeIcon
      icon={faEllipsisVertical}
      className="text-black"
    />
  </button>

  {showMenu && (

    <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-lg overflow-hidden z-50 w-56">

      <Link
        href="/account"
        className="block px-5 py-4 border-b text-black"
      >
        My Account
      </Link>

      <Link
        href="/orders"
        className="block px-5 py-4 border-b text-black"
      >
        My Orders
      </Link>

      <Link
        href="/rider-signup"
        className="block px-5 py-4 border-b text-black"
      >
        Become a Rider
      </Link>

      <Link
        href="/restaurant-signup"
        className="block px-5 py-4 border-b text-black"
      >
        Partner Restaurant
      </Link>

      <button
        onClick={handleLogout}
        className="w-full text-left px-5 py-4 text-red-600"
      >
        Logout
      </button>

    </div>

  )}

</div>


);
}
