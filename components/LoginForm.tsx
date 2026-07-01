"use client";



import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTruck,
  faUtensils,
  faStar,
  faEyeSlash,
   faEye
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";


export default function LoginPage() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const redirect = searchParams.get("redirect") || "/";

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);



  async function handleLogin(){

    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });


    if(error){

      alert(error.message);
      setLoading(false);
      return;

    }


    router.push(redirect);

  }



  return (

    <main
      className="min-h-screen flex items-center justify-center p-5 bg-cover bg-center relative"
      style={{
        backgroundImage:"url('/images/login.png')"
      }}
    >


      {/* Dark overlay */}

      <div className="absolute inset-0 bg-black/60"></div>



      <div className="relative z-10 w-full max-w-md">



        {/* Logo + welcome */}

        <div className="text-center mb-8">


          <div className="flex justify-center">

            <Image
              src="/images/Bitevy.png"
              alt="Bitevy"
              width={170}
              height={60}
            />

          </div>


          <h1 className="text-white text-4xl font-black mt-5">
            Welcome Back 👋
          </h1>


          <p className="text-white/80 mt-2">
            Delicious meals, delivered fast to your door
          </p>


        </div>





        {/* Login Card */}

        <div className="bg-white/95 backdrop-blur rounded-[35px] shadow-2xl p-7">


          <h2 className="text-center text-2xl font-black text-gray-900 mb-6">
            Login to Bitevy
          </h2>




          <div className="space-y-4">


            <input

              placeholder="Email address"

              value={email}

              onChange={(e)=>setEmail(e.target.value)}

              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-black outline-none focus:border-green-700"

            />



            <div className="relative">

              <input
                placeholder="Create password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 pr-12 text-black outline-none focus:border-green-700"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                />
              </button>

            </div>




            <button

              onClick={handleLogin}

              className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-2xl font-bold text-lg"

            >

              {loading ? "Logging in..." : "Login"}

            </button>



          </div>




          <p className="text-center text-gray-600 mt-6">

            Don't have an account?


            <Link
              href="/signup/customer"
              className="text-green-700 font-bold ml-2"
            >
              Sign up
            </Link>


          </p>


        </div>





        {/* Bottom features */}

       <div className="grid grid-cols-3 text-center text-white mt-8 text-sm">


  <Link href="signup/rider" className="flex flex-col items-center">

    <FontAwesomeIcon
      icon={faTruck}
      className="text-2xl mb-2"
    />

    <p>
      Become a Rider
    </p>

  </Link>




  <Link href="signup/restaurants" className="flex flex-col items-center">

    <FontAwesomeIcon
      icon={faUtensils}
      className="text-2xl mb-2"
    />

    <p>
      Become a Restaurant
    </p>

  </Link>




  <div className="flex flex-col items-center">

    <FontAwesomeIcon
      icon={faStar}
      className="text-2xl mb-2"
    />

    <p>
      Best Taste
    </p>

  </div>


</div>

</div>


    </main>

  );

}