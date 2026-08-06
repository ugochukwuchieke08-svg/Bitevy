"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Order, RiderApplication } from "../types";

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  activeOrders: number;
  todaysSales: number;
  pendingRiders: number;
};

type UseDashboardReturn = {
  stats: DashboardStats;
  recentOrders: Order[];
  pendingRiderApplications: RiderApplication[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const ACTIVE_ORDER_STATUSES = [
  "preparing",
  "ready",
  "out_for_delivery",
];

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    activeOrders: 0,
    todaysSales: 0,
    pendingRiders: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [pendingRiderApplications, setPendingRiderApplications] =
    useState<RiderApplication[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);

      const [
        ordersResponse,
        ridersResponse,
      ] = await Promise.all([
        supabase
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
          }),

        supabase
          .from("rider_applications")
          .select(`
            id,
            user_id,
            full_name,
            phone,
            bike_type,
            nin_number,
            nin_image,
            profile_image,
            status,
            created_at
          `)
          .eq("status", "pending")
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (ordersResponse.error) {
        throw ordersResponse.error;
      }

      if (ridersResponse.error) {
        throw ridersResponse.error;
      }

      const orders = (ordersResponse.data ?? []) as Order[];

      const riders = (ridersResponse.data ?? []) as RiderApplication[];

      const today = new Date();

      const todaysSales = orders
        .filter((order) => {
          const orderDate = new Date(order.created_at);

          return (
            orderDate.getFullYear() === today.getFullYear() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getDate() === today.getDate()
          );
        })
        .reduce(
          (total, order) =>
            total + Number(order.total || 0),
          0
        );

      const pendingOrders = orders.filter(
        (order) => order.status === "pending"
      ).length;

      const activeOrders = orders.filter((order) =>
        ACTIVE_ORDER_STATUSES.includes(order.status)
      ).length;

      setStats({
        totalOrders: orders.length,
        pendingOrders,
        activeOrders,
        todaysSales,
        pendingRiders: riders.length,
      });

      setRecentOrders(orders.slice(0, 5));

      setPendingRiderApplications(riders.slice(0, 5));
    } catch (err) {
      console.error(
        "Failed to load admin dashboard:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const ordersChannel = supabase
      .channel("admin-dashboard-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchDashboard();
        }
      )
      .subscribe();

    const ridersChannel = supabase
      .channel("admin-dashboard-riders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rider_applications",
        },
        () => {
          fetchDashboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(ridersChannel);
    };
  }, [fetchDashboard]);

  return {
    stats,
    recentOrders,
    pendingRiderApplications,
    loading,
    error,
    refetch: fetchDashboard,
  };
}