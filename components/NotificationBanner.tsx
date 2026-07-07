"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

type Props = {
  title: string;
  message: string;
};

export default function NotificationBanner({
  title,
  message,
}: Props) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setVisible(true);

    const hide = setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => clearTimeout(hide);
  }, []);

  return (
    <div
      onClick={() => router.push("/notifications")}
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999]
      w-[92%] max-w-md bg-green-700 text-white rounded-2xl shadow-xl
      p-4 cursor-pointer transition-all duration-500
      ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-24 opacity-0"
      }`}
    >
      <div className="flex items-start gap-3">

        <FontAwesomeIcon
          icon={faBell}
          className="text-xl mt-1"
        />

        <div>

          <h3 className="font-bold text-lg">
            {title}
          </h3>

          <p className="text-sm text-green-100">
            {message}
          </p>

        </div>

      </div>
    </div>
  );
}