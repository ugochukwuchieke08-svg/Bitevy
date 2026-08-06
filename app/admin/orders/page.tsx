"use client";

import { useState } from "react";
import OrdersTable from "../components/OrdersTable";
import { useOrders } from "../hooks/useOrders";

export default function OrdersPage() {
  const {
    orders,
    loading,
    error,
    updateOrderStatus,
  } = useOrders();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  return (
    <div className="space-y-8 text-gray-400 ">
      {/* Page Header */}
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
          Operations
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
          Orders
        </h1>

        <p className="mt-2 max-w-2xl text-slate-500">
          Monitor customer orders and manage the delivery
          lifecycle from one place.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Orders */}
      <OrdersTable
        orders={orders}
        loading={loading}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        onStatusChange={updateOrderStatus}
        
      />
    </div>
  );
}