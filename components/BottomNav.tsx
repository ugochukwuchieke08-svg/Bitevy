"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faMagnifyingGlass,
  faBox,
  faUser
} from "@fortawesome/free-solid-svg-icons";


export default function BottomNav() {

  return (

    <nav className="fixed bottom-0 left-0 right-0 bg-orange-500 border-t shadow-lg flex justify-around py-3">

      <Link
        href="/"
        className="flex flex-col items-center text-green-700"
      >
        <FontAwesomeIcon icon={faHouse} />
        <span className="text-[8px] mt-1">
          Home
        </span>
      </Link>


      <Link
        href="/search"
        className="flex flex-col items-center text-gray"
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        <span className="text-[8px] mt-1">
          Search
        </span>
      </Link>


      <Link
        href="/orders"
        className="flex flex-col items-center text-gray"
      >
        <FontAwesomeIcon icon={faBox} />
        <span className="text-[8px] mt-1">
          Orders
        </span>
      </Link>


      <Link href="/account" className="flex flex-col items-center text-gray">
        <FontAwesomeIcon icon={faUser} />
        <span className="text-[8px] mt-1">
          Profile
        </span>
      </Link>


    </nav>

  );
}