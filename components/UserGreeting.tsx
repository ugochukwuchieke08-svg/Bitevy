"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function UserGreeting() {

const [name, setName] = useState("User");

useEffect(() => {


async function loadName() {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  if (data?.full_name) {
    setName(data.full_name);
  }

}

loadName();


}, []);

return ( <p className="text-black font-semibold ml-2">
Hello {name}  </p>
);
}
