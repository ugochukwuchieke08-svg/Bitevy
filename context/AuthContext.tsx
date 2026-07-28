"use client";
import { getFcmToken } from "@/lib/getFcmToken";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // First effect
  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log("SESSION:", session);
      console.log("SESSION ERROR:", error);

      setUser(session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("AUTH EVENT:", _event);
      console.log("SESSION:", session);

      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Second effect
  useEffect(() => {
  async function registerToken() {
    if (!user) return;

    const token = getFcmToken();

    console.log("Token from helper:", token);
    // @ts-ignore
    console.log("window.JSBridge:", window.JSBridge);

    if (!token) {
      console.log("No FCM token available");
      return;
    }

    const res = await fetch("/api/fcm/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        token,
      }),
    });

    console.log(await res.json());
  }

  registerToken();
}, [user]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}