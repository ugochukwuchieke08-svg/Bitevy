"use client";

import OrderStatusBadge from "./OrderStatusBadge";
import { Order } from "../types";

interface Props {
  order: Order;
  onStatusChange: (id: string, status: string) => void;
}

export default function OrderRow({
  order,
  onStatusChange,
}: Props) {
  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50">
      <td className="px-5 py-5">
        <div className="font-bold">
          {order.customer_name}
        </div>

        <div className="text-sm text-slate-500">
          {order.phone}
        </div>
      </td>

      <td className="px-5 py-5">
        {order.restaurants?.[0]?.name ?? "-"}
      </td>

      <td className="px-5 py-5">
        ₦{Number(order.total || 0).toLocaleString()}
      </td>

      <td className="px-5 py-5">
        <OrderStatusBadge status={order.status} />
      </td>

      <td className="px-5 py-5">
        <select
          value={order.status}
          onChange={(e) =>
            onStatusChange(order.id, e.target.value)
          }
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="out_for_delivery">
            Out For Delivery
          </option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </td>
    </tr>
  );
}