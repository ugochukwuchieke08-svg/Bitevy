"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  ShoppingBag,
  Trash2,
  Truck,
  Utensils,
} from "lucide-react";
import { useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export default function NotificationsList({
  notifications: initialNotifications,
}: {
  notifications: Notification[];
}) {
  const [notifications, setNotifications] =
    useState(initialNotifications);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [clearingAll, setClearingAll] =
    useState(false);

  async function deleteNotification(id: string) {
    if (deletingId || clearingAll) return;

    const confirmed = window.confirm(
      "Remove this notification?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(
        "/api/notifications/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId: id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to remove notification"
        );
      }

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification.id !== id
        )
      );
    } catch (error) {
      console.error(
        "DELETE NOTIFICATION ERROR:",
        error
      );

      alert(
        "Could not remove this notification. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function clearAll() {
    if (
      notifications.length === 0 ||
      clearingAll
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Remove all notifications?"
    );

    if (!confirmed) return;

    setClearingAll(true);

    try {
      const response = await fetch(
        "/api/notifications/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deleteAll: true,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to clear notifications"
        );
      }

      setNotifications([]);
    } catch (error) {
      console.error(
        "CLEAR NOTIFICATIONS ERROR:",
        error
      );

      alert(
        "Could not clear notifications. Please try again."
      );
    } finally {
      setClearingAll(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-900 shadow-sm"
          >
            <ArrowLeft
              size={19}
              strokeWidth={2.5}
            />
          </Link>

          <div>
            <h1 className="text-3xl font-black text-black">
              Notifications
            </h1>

            {notifications.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                Stay updated on your orders
              </p>
            )}
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            disabled={
              clearingAll ||
              deletingId !== null
            }
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={16} />

            {clearingAll
              ? "Clearing..."
              : "Clear all"}
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
            <Bell
              size={28}
              className="text-orange-500"
            />
          </div>

          <h2 className="mt-5 text-xl font-black text-gray-950">
            You're all caught up
          </h2>

          <p className="mt-4 text-sm leading-6 text-gray-500">
            New updates about your orders will
            appear here.
          </p>
        </div>
      ) : (
        <>
        

          <div className="space-y-3">
            {notifications.map(
              (notification) => (
                <SwipeableNotification
                  key={notification.id}
                  notification={notification}
                  disabled={
                    clearingAll ||
                    deletingId !== null
                  }
                  deleting={
                    deletingId ===
                    notification.id
                  }
                  onDelete={() =>
                    deleteNotification(
                      notification.id
                    )
                  }
                />
              )
            )}
          </div>
        </>
      )}
    </>
  );
}

function SwipeableNotification({
  notification,
  disabled,
  deleting,
  onDelete,
}: {
  notification: Notification;
  disabled: boolean;
  deleting: boolean;
  onDelete: () => Promise<void>;
}) {
  const [touchStart, setTouchStart] =
    useState<number | null>(null);

  const [swipeOffset, setSwipeOffset] =
    useState(0);

  function handleTouchStart(
    e: React.TouchEvent<HTMLDivElement>
  ) {
    if (disabled) return;

    setTouchStart(
      e.touches[0].clientX
    );
  }

  function handleTouchMove(
    e: React.TouchEvent<HTMLDivElement>
  ) {
    if (
      touchStart === null ||
      disabled
    ) {
      return;
    }

    const currentX =
      e.touches[0].clientX;

    const diff =
      currentX - touchStart;

    /*
     * Only allow horizontal movement.
     */
    if (Math.abs(diff) < 150) {
      setSwipeOffset(diff);
    }
  }

  async function handleTouchEnd() {
    if (
      touchStart === null ||
      disabled
    ) {
      return;
    }

    const offset = swipeOffset;

    setTouchStart(null);

    /*
     * Swipe wasn't far enough.
     */
    if (Math.abs(offset) < 80) {
      setSwipeOffset(0);
      return;
    }

    /*
     * IMPORTANT:
     * Ask for confirmation BEFORE permanently
     * moving the card away.
     */
    const confirmed = window.confirm(
      "Remove this notification?"
    );

    /*
     * User pressed Cancel.
     * Put card immediately back.
     */
    if (!confirmed) {
      setSwipeOffset(0);
      return;
    }

    /*
     * User confirmed.
     * Animate card away.
     */
    setSwipeOffset(
      offset > 0 ? 500 : -500
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 150)
    );

    await onDelete();
  }

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Delete background */}
      <div className="absolute inset-0 flex items-center justify-between bg-red-500 px-6">
        <Trash2
          size={21}
          className="text-white"
        />

        <Trash2
          size={21}
          className="text-white"
        />
      </div>

      {/* Card */}
      <div
        className={`relative rounded-3xl shadow-sm transition-transform duration-150 ${
          notification.read
            ? "bg-white"
            : "bg-green-50 ring-1 ring-green-200"
        }`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          opacity: deleting ? 0 : 1,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link
          href={`/notifications/${notification.id}`}
          className="block p-4"
        >
          <div className="flex gap-4">

            {/* Notification icon */}
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${getIconStyle(
                notification.title,
                notification.read
              )}`}
            >
              {getNotificationIcon(
                notification.title
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold text-black leading-5 text-gray-950">
                  {notification.title}
                </h2>

                {!notification.read && (
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-green-600" />
                )}
              </div>

              <p className="mt-1.5 text-sm leading-6 text-gray-600">
                {notification.message}
              </p>

              <p className="mt-2 text-xs font-medium text-gray-400">
                {getTimeAgo(
                  notification.created_at
                )}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

function getNotificationIcon(
  title: string
) {
  const text =
    title.toLowerCase();

  if (
    text.includes("delivered") ||
    text.includes("completed")
  ) {
    return <CheckCircle2 size={20} />;
  }

  if (
    text.includes("rider") ||
    text.includes("delivery") ||
    text.includes("picked")
  ) {
    return <Truck size={20} />;
  }

  if (
    text.includes("order") ||
    text.includes("food")
  ) {
    return <ShoppingBag size={20} />;
  }

  if (
    text.includes("restaurant") ||
    text.includes("meal")
  ) {
    return <Utensils size={20} />;
  }

  if (
    text.includes("pending") ||
    text.includes("processing")
  ) {
    return <Clock3 size={20} />;
  }

  return <Bell size={20} />;
}

function getIconStyle(
  title: string,
  read: boolean
) {
  if (read) {
    return "bg-gray-100 text-gray-500";
  }

  const text =
    title.toLowerCase();

  if (
    text.includes("delivered") ||
    text.includes("completed")
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    text.includes("rider") ||
    text.includes("delivery")
  ) {
    return "bg-orange-100 text-orange-600";
  }

  return "bg-green-100 text-green-700";
}

function getTimeAgo(date: string) {
  const now = new Date();
  const created = new Date(date);

  const seconds = Math.floor(
    (now.getTime() -
      created.getTime()) /
      1000
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(
    date
  ).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}