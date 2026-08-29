"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Package,
  ShoppingBag,
  Trash2,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
  menu_item_id?: string | null;
};

type Order = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    async function getOrders() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        setUser(user);

        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (*)
          `)
          .eq("user_id", user.id)
          .is("deleted_at", null)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          console.error("ORDERS ERROR:", error);
          return;
        }

        const fetchedOrders = (data || []) as Order[];

        /*
         * Get menu item images separately.
         * This prevents us from depending on order_items.image.
         */
        const menuItemIds = [
          ...new Set(
            fetchedOrders
              .flatMap((order) => order.order_items || [])
              .map((item) => item.menu_item_id)
              .filter(Boolean)
          ),
        ];

        let imageMap: Record<string, string> = {};

        if (menuItemIds.length > 0) {
          const { data: menuItems, error: imageError } =
            await supabase
              .from("menu_items")
              .select("id, image")
              .in("id", menuItemIds);

          if (imageError) {
            console.error(
              "MENU ITEM IMAGE ERROR:",
              imageError
            );
          }

          if (menuItems) {
            imageMap = Object.fromEntries(
              menuItems
                .filter((item) => item.image)
                .map((item) => [item.id, item.image])
            );
          }
        }

        const ordersWithImages = fetchedOrders.map(
          (order) => ({
            ...order,
            order_items: order.order_items.map(
              (item) => ({
                ...item,
                image:
                  item.image ||
                  (item.menu_item_id
                    ? imageMap[item.menu_item_id]
                    : null),
              })
            ),
          })
        );

        setOrders(ordersWithImages);
      } catch (error) {
        console.error("GET ORDERS ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    getOrders();
  }, []);

  /*
   * Hide ONE order from the customer's history.
   * The order remains in Supabase.
   */
  async function hideOrder(orderId: string) {
    if (deletingId || clearingAll) return false;

    const confirmed = window.confirm(
      "Remove this order from your order history?"
    );

    // IMPORTANT:
    // If they press Cancel, nothing happens to the UI.
    if (!confirmed) {
      return false;
    }

    setDeletingId(orderId);

    try {
      const response = await fetch(
        "/api/orders/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to remove order"
        );
      }

      // Remove from local UI immediately
      setOrders((current) =>
        current.filter(
          (order) => order.id !== orderId
        )
      );

      return true;
    } catch (error) {
      console.error("HIDE ORDER ERROR:", error);
      alert(
        "Could not remove this order. Please try again."
      );

      return false;
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * Hide ALL orders from the customer's history.
   * Nothing is physically deleted from Supabase.
   */
  async function clearAllOrders() {
    if (orders.length === 0 || clearingAll) return;

    const confirmed = window.confirm(
      "Remove all orders from your order history?"
    );

    if (!confirmed) return;

    setClearingAll(true);

    try {
      const response = await fetch(
        "/api/orders/delete",
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
          result.error || "Failed to clear orders"
        );
      }

      setOrders([]);
    } catch (error) {
      console.error("CLEAR ORDERS ERROR:", error);
      alert(
        "Could not clear your orders. Please try again."
      );
    } finally {
      setClearingAll(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fff8f0] p-5">
        <h1 className="text-2xl font-bold text-black">
          Loading orders...
        </h1>

        <BottomNav />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#fff8f0] p-5">
        <h1 className="text-3xl font-bold text-black">
          Please login to view orders
        </h1>

        <Link
          href="/login?redirect=/orders"
          className="inline-block mt-5 bg-green-700 text-white px-5 py-3 rounded-full"
        >
          Login
        </Link>

        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] p-5 pb-28">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-black">
              My Orders
            </h1>

            {orders.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {orders.length}{" "}
                {orders.length === 1
                  ? "order"
                  : "orders"}
              </p>
            )}
          </div>

          {orders.length > 0 && (
            <button
              onClick={clearAllOrders}
              disabled={clearingAll || !!deletingId}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 font-bold text-sm hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={16} />
              {clearingAll
                ? "Clearing..."
                : "Clear all"}
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
              <ShoppingBag
                size={28}
                className="text-orange-500"
              />
            </div>

            <h2 className="mt-5 text-xl font-black text-gray-900">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-500">
              Your orders will appear here.
            </p>

            <Link
              href="/"
              className="inline-block mt-6 bg-green-700 text-white px-6 py-3 rounded-2xl font-bold"
            >
              Start ordering
            </Link>
          </div>
        ) : (
          <>
            {/* Swipe hint */}
            <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
              <Trash2 size={14} />
              Swipe an order left or right to remove it
            </div>

            <div className="space-y-5">
              {orders.map((order) => (
                <SwipeableOrder
                  key={order.id}
                  order={order}
                  deleting={
                    deletingId === order.id
                  }
                  disabled={
                    !!deletingId || clearingAll
                  }
                  onDelete={() =>
                    hideOrder(order.id)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

/* =========================================================
   SWIPEABLE ORDER
========================================================= */

function SwipeableOrder({
  order,
  deleting,
  disabled,
  onDelete,
}: {
  order: Order;
  deleting: boolean;
  disabled: boolean;
  onDelete: () => Promise<boolean> | boolean;
}) {
  const [touchStart, setTouchStart] =
    useState<number | null>(null);

  const [swipeOffset, setSwipeOffset] =
    useState(0);

  function handleTouchStart(
    e: React.TouchEvent
  ) {
    if (disabled) return;

    setTouchStart(
      e.touches[0].clientX
    );
  }

  function handleTouchMove(
    e: React.TouchEvent
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

    if (Math.abs(diff) <= 120) {
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

    if (Math.abs(offset) < 80) {
      setSwipeOffset(0);
      return;
    }

    /*
     * IMPORTANT:
     *
     * Ask for confirmation BEFORE moving
     * the card off-screen.
     */
    const confirmed = window.confirm(
      "Remove this order from your order history?"
    );

    if (!confirmed) {
      // This guarantees the card comes back.
      setSwipeOffset(0);
      return;
    }

    // Now animate it away.
    setSwipeOffset(
      offset > 0 ? 500 : -500
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 150)
    );

    await onDelete();
  }

  const status =
    order.status?.toLowerCase();

  function getStatusIcon() {
    if (
      status === "completed" ||
      status === "delivered"
    ) {
      return <CheckCircle2 size={15} />;
    }

    if (
      status === "cancelled" ||
      status === "canceled"
    ) {
      return <XCircle size={15} />;
    }

    if (
      status === "pending" ||
      status === "processing"
    ) {
      return <Clock3 size={15} />;
    }

    return <Package size={15} />;
  }

  function getStatusStyle() {
    if (
      status === "completed" ||
      status === "delivered"
    ) {
      return "bg-green-50 text-green-700";
    }

    if (
      status === "cancelled" ||
      status === "canceled"
    ) {
      return "bg-red-50 text-red-600";
    }

    return "bg-orange-50 text-orange-600";
  }

  return (
    <div className="relative overflow-hidden rounded-3xl">

      {/* Red swipe background */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-between px-6">
        <Trash2
          size={22}
          className="text-white"
        />

        <Trash2
          size={22}
          className="text-white"
        />
      </div>

      {/* Order Card */}
      <div
        className="relative bg-white rounded-3xl p-5 transition-transform duration-150"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          opacity: deleting ? 0 : 1,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div>
            <p className="text-xs text-gray-400 font-medium">
              ORDER
            </p>

            <h2 className="font-bold text-black mt-1">
              #{order.id
                .slice(0, 8)
                .toUpperCase()}
            </h2>
          </div>

          <span
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize ${getStatusStyle()}`}
          >
            {getStatusIcon()}
            {order.status}
          </span>
        </div>

        {/* Food Items */}
        <div className="mt-4 space-y-3">
          {order.order_items?.map(
            (item) => (
              <div
                key={item.id}
                className="flex items-center gap-3"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag
                        size={22}
                        className="text-gray-300"
                      />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-black truncate">
                    {item.name}
                  </h3>

                  <p className="text-gray-600">
                    {item.quantity} × ₦
                    {Number(
                      item.price
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="border-t mt-5 pt-4 flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-400">
              TOTAL
            </p>

            <p className="text-xl font-bold text-green-700">
              ₦
              {Number(
                order.total
              ).toLocaleString()}
            </p>
          </div>

          <p className="text-xs text-gray-400">
            {new Date(
              order.created_at
            ).toLocaleDateString(
              "en-NG",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )}
          </p>
        </div>
      </div>
    </div>
  );
}