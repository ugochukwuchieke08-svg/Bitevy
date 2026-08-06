"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { RiderApplication } from "../types";

type ReviewDecision = "approve" | "reject";

type UseRidersReturn = {
  riders: RiderApplication[];
  loading: boolean;
  reviewingId: string | null;
  error: string | null;
  reviewApplication: (
    applicationId: string,
    decision: ReviewDecision
  ) => Promise<boolean>;
  refetch: () => Promise<void>;
};

export function useRiders(): UseRidersReturn {
  const [riders, setRiders] = useState<RiderApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRiders = useCallback(async () => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
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
        .order("created_at", {
          ascending: false,
        });

      if (fetchError) {
        throw fetchError;
      }

      setRiders((data ?? []) as RiderApplication[]);
    } catch (err) {
      console.error("Failed to fetch rider applications:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load rider applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const reviewApplication = useCallback(
    async (
      applicationId: string,
      decision: ReviewDecision
    ) => {
      setReviewingId(applicationId);
      setError(null);

      try {
        const response = await fetch(
          "/api/admin/rider-applications/review",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              applicationId,
              decision,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Failed to review rider application."
          );
        }

        setRiders((currentRiders) =>
          currentRiders.map((rider) =>
            rider.id === applicationId
              ? {
                  ...rider,
                  status: result.status,
                }
              : rider
          )
        );

        return true;
      } catch (err) {
        console.error(
          "Failed to review rider application:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to review rider application."
        );

        return false;
      } finally {
        setReviewingId(null);
      }
    },
    []
  );

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-rider-applications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rider_applications",
        },
        () => {
          fetchRiders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRiders]);

  return {
    riders,
    loading,
    reviewingId,
    error,
    reviewApplication,
    refetch: fetchRiders,
  };
}