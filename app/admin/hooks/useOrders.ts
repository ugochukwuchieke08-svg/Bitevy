"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Order } from "../types";

type UseOrdersReturn = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  updateOrderStatus: (
    orderId: string,
    status: string
  ) => Promise<boolean>;
  refetch: () => Promise<void>;
};

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select(`
          id,
          customer_name,
          phone,
          delivery_address,
          total,
          status,
          created_at,
          restaurants (
            id,
            name
          )
        `)
        .order("created_at", {
          ascending: false,
        });

      if (fetchError) {
        throw fetchError;
      }

      setOrders((data ?? []) as Order[]);
    } catch (err) {
      console.error("Failed to fetch orders:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId: string, status: string) => {
      const previousOrders = orders;

      // Optimistic update
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
              }
            : order
        )
      );

      const { error: updateError } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (updateError) {
        console.error(
          "Failed to update order status:",
          updateError
        );

        // Rollback if database update fails
        setOrders(previousOrders);

        setError(
          updateError.message ||
            "Failed to update order status."
        );

        return false;
      }

      return true;
    },
    [orders]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    refetch: fetchOrders,
  };
}