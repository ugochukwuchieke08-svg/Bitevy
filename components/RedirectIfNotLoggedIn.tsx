"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RedirectIfNotLoggedIn({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function checkUser() {

      const {
        data: { user },
      } = await supabase.auth.getUser();


      if (!user) {
        router.push("/login");
        return;
      }


      setLoading(false);

    }


    checkUser();

  }, [router]);


  if (loading) {
    return null;
  }


  return children;
}