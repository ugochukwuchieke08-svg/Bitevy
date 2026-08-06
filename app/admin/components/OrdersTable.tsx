"use client";

import { Order } from "../types";
import OrderRow from "./OrderRow";
import OrderStatusBadge from "./OrderStatusBadge";
import EmptyState from "./EmptyState";

interface Props {
  orders: Order[];
  loading: boolean;
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export default function OrdersTable({
  orders,
  loading,
  search,
  setSearch,
  filter,
  setFilter,
  onStatusChange,
}: Props) {
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      order.phone?.includes(search) ||
     order.restaurants?.[0]?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" || order.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">

      {/* Search */}

      <div className="flex flex-col gap-4 md:flex-row">

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer, phone or restaurant..."
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="out_for_delivery">
            Out for Delivery
          </option>
          <option value="delivered">
            Delivered
          </option>
          <option value="cancelled">
            Cancelled
          </option>
        </select>

      </div>

      {/* Desktop */}

      <div className="hidden text-gray-700 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow lg:block">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr className="text-left">

              <th className="px-5 py-4">
                Customer
              </th>

              <th className="px-5 py-4">
                Restaurant
              </th>

              <th className="px-5 py-4">
                Total
              </th>

              <th className="px-5 py-4">
                Status
              </th>

              <th className="px-5 py-4">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan={5}
                  className="py-12 text-center"
                >
                  Loading...
                </td>

              </tr>

            ) : filteredOrders.length === 0 ? (

              <tr>

                <td colSpan={5}>
                  <EmptyState
                    title="No Orders"
                    description="Orders will appear here."
                  />
                </td>

              </tr>

            ) : (

              filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusChange={onStatusChange}
                />
              ))

            )}

          </tbody>

        </table>

      </div>

      {/* Mobile */}

{/* Mobile */}

<div className="space-y-4 lg:hidden">
  {loading ? (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

      <p className="mt-4 text-sm font-semibold text-slate-500">
        Loading orders...
      </p>
    </div>
  ) : filteredOrders.length === 0 ? (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="font-bold text-slate-900">
        No orders found
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Try adjusting your search or status filter.
      </p>
    </div>
  ) : (
    filteredOrders.map((order) => (
      <div
        key={order.id}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Order
            </p>

            <h3 className="mt-1 font-black text-slate-900">
              #{order.id.slice(0, 8)}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {order.customer_name}
            </p>

            <p className="text-sm text-slate-500">
              {order.phone}
            </p>
          </div>

          <OrderStatusBadge
            status={order.status}
          />
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Restaurant
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {order.restaurants?.[0]?.name ?? "Unknown restaurant"}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Delivery Address
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {order.delivery_address}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-semibold text-slate-500">
              Order Total
            </span>

            <span className="text-lg font-black text-slate-900">
              ₦{Number(order.total || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor={`status-${order.id}`}
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400"
          >
            Update Status
          </label>

          <select
            id={`status-${order.id}`}
            value={order.status}
            onChange={(e) =>
              onStatusChange(
                order.id,
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            <option value="pending">
              Pending
            </option>

            <option value="preparing">
              Preparing
            </option>

            <option value="ready">
              Ready
            </option>

            <option value="out_for_delivery">
              Out for Delivery
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>
      </div>
    ))
  )}
</div>

    </div>
  );
}