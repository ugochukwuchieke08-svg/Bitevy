"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";


export default function AuthGuard({
  children,
}:{
  children: React.ReactNode;
}) {

  const router = useRouter();


  useEffect(()=>{

    async function checkUser(){

      const {
        data:{
          user
        }
      } = await supabase.auth.getUser();


      if(!user){
        router.push("/login");
      }

    }


    checkUser();

  },[]);



  return children;

}