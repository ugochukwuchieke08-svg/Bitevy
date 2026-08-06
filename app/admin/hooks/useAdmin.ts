"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type AdminStatus = {
  loading: boolean;
  allowed: boolean;
  userId: string | null;
};

export function useAdmin(): AdminStatus {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const checkAdminAccess = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setAllowed(false);
        setUserId(null);
        router.replace("/");
        return;
      }

      setUserId(user.id);

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) {
        console.error(
          "Failed to check admin role:",
          profileError
        );

        setAllowed(false);
        return;
      }

      if (profile?.role !== "admin") {
        setAllowed(false);
        return;
      }

      setAllowed(true);
    } catch (error) {
      console.error(
        "Admin access check failed:",
        error
      );

      setAllowed(false);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  return {
    loading,
    allowed,
    userId,
  };
}