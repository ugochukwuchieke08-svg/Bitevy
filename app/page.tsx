import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Store,
  Smartphone,
  Utensils,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fff8f0] text-gray-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-orange-100/60 bg-[#fff8f0]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/">
            <Image
              src="/images/Bitevy.png"
              alt="Bitevy"
              width={135}
              height={42}
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-gray-600 transition hover:text-orange-600"
            >
              How it works
            </a>

            <a
              href="#restaurants"
              className="text-sm font-semibold text-gray-600 transition hover:text-orange-600"
            >
              Restaurants
            </a>

            <a
              href="#business"
              className="text-sm font-semibold text-gray-600 transition hover:text-orange-600"
            >
              For Businesses
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-white md:block"
            >
              Log in
            </Link>

            <Link
              href="/restaurants"
              className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600"
            >
              Order Food
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-orange-100 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-2 md:px-8 md:pb-28 md:pt-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Food delivery made simple
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">
              Great food.
              <br />
              <span className="text-orange-500">Delivered.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 md:text-lg">
              Discover restaurants around you, order your favorite meals, and
              get them delivered straight to your door with Bitevy.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/restaurants"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-7 py-4 font-bold text-white shadow-xl shadow-orange-200 transition hover:-translate-y-1 hover:bg-orange-600"
              >
                Start Ordering
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-7 py-4 font-bold text-gray-800 shadow-sm transition hover:bg-gray-50"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                Easy ordering
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                Secure payments
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                Local restaurants
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 p-5 shadow-2xl shadow-orange-200 md:p-7">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
              <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-yellow-300/10" />

              <div className="relative rounded-[30px] bg-white p-5 shadow-2xl md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400">
                      Delivering to
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-bold">
                        Your location
                      </span>
                    </div>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                    <Search className="h-5 w-5 text-orange-500" />
                  </div>
                </div>

                <div className="mt-6 rounded-3xl bg-[#fff8f0] p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500">
                      <Utensils className="h-8 w-8 text-white" />
                    </div>

                    <div className="flex-1">
                      <p className="font-black">Your next meal</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Find something delicious nearby.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <Clock3 className="h-5 w-5 text-orange-500" />
                    <p className="mt-3 text-sm font-bold">Fast delivery</p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-4">
                    <ShieldCheck className="h-5 w-5 text-orange-500" />
                    <p className="mt-3 text-sm font-bold">Secure payment</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <Bike className="h-5 w-5 text-orange-600" />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Delivery</p>
                  <p className="text-sm font-black">On the way</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK BENEFITS */}
      <section className="border-y border-orange-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-px md:grid-cols-3">
          <div className="flex items-center gap-4 px-6 py-8 md:px-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
              <Search className="h-6 w-6 text-orange-600" />
            </div>

            <div>
              <h3 className="font-black">Discover</h3>
              <p className="mt-1 text-sm text-gray-500">
                Find restaurants and meals around you.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6 py-8 md:px-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
              <Utensils className="h-6 w-6 text-orange-600" />
            </div>

            <div>
              <h3 className="font-black">Order</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose your food and place your order.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6 py-8 md:px-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
              <Bike className="h-6 w-6 text-orange-600" />
            </div>

            <div>
              <h3 className="font-black">Enjoy</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get your meal delivered to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-bold uppercase tracking-[0.2em] text-orange-500">
            How Bitevy works
          </p>

          <h2 className="mt-3 text-3xl font-black md:text-5xl">
            From craving to doorstep.
          </h2>

          <p className="mt-4 text-gray-600">
            Getting your favorite food shouldn't be complicated.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Choose a restaurant",
              text: "Explore restaurants and discover meals that match your craving.",
            },
            {
              number: "02",
              title: "Place your order",
              text: "Add your favorites to your cart and complete your order securely.",
            },
            {
              number: "03",
              title: "Get it delivered",
              text: "Sit back while your order makes its way to your location.",
            },
          ].map((item) => (
            <div
              key={item.number}
              className="rounded-[32px] border border-gray-100 bg-white p-7 shadow-sm"
            >
              <span className="text-5xl font-black text-orange-100">
                {item.number}
              </span>

              <h3 className="mt-6 text-xl font-black">{item.title}</h3>

              <p className="mt-3 leading-6 text-gray-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RESTAURANTS */}
      <section id="restaurants" className="bg-gray-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
          <div>
            <p className="font-bold uppercase tracking-[0.2em] text-orange-400">
              Your food, your way
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Whatever you're craving,
              <span className="text-orange-400"> find it on Bitevy.</span>
            </h2>

            <p className="mt-6 max-w-xl leading-7 text-gray-400">
              Browse available restaurants, explore their menus, and order
              exactly what you want without the hassle.
            </p>

            <Link
              href="/restaurants"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-4 font-bold text-white transition hover:bg-orange-400"
            >
              Explore Restaurants
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[30px] bg-white/5 p-6 ring-1 ring-white/10">
              <MapPin className="h-7 w-7 text-orange-400" />
              <h3 className="mt-6 text-xl font-black">Near you</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Discover food options available around your location.
              </p>
            </div>

            <div className="rounded-[30px] bg-white/5 p-6 ring-1 ring-white/10">
              <Clock3 className="h-7 w-7 text-orange-400" />
              <h3 className="mt-6 text-xl font-black">Convenient</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Order whenever you want without leaving home.
              </p>
            </div>

            <div className="rounded-[30px] bg-white/5 p-6 ring-1 ring-white/10">
              <ShieldCheck className="h-7 w-7 text-orange-400" />
              <h3 className="mt-6 text-xl font-black">Secure</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Pay securely through Bitevy's supported payment options.
              </p>
            </div>

            <div className="rounded-[30px] bg-orange-500 p-6">
              <Smartphone className="h-7 w-7 text-white" />
              <h3 className="mt-6 text-xl font-black">On the go</h3>
              <p className="mt-2 text-sm leading-6 text-orange-100">
                Your food ordering experience wherever you are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BUSINESS */}
      <section id="business" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="overflow-hidden rounded-[40px] bg-orange-500">
          <div className="grid items-center md:grid-cols-2">
            <div className="p-8 md:p-14">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <Store className="h-7 w-7 text-white" />
              </div>

              <h2 className="mt-7 text-4xl font-black text-white md:text-5xl">
                Own a restaurant?
              </h2>

              <p className="mt-5 max-w-lg leading-7 text-orange-50">
                Put your restaurant in front of hungry customers and manage
                your orders through Bitevy.
              </p>

              <Link
                href="/login"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-orange-600 shadow-lg transition hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="hidden h-full min-h-[360px] items-center justify-center bg-black/10 md:flex">
              <div className="text-center">
                <Store className="mx-auto h-24 w-24 text-white/80" />
                <p className="mt-6 text-xl font-black text-white">
                  Grow with Bitevy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APP CTA */}
      <section className="border-t border-orange-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-5 py-20 text-center md:px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100">
            <Smartphone className="h-8 w-8 text-orange-600" />
          </div>

          <h2 className="mt-6 text-3xl font-black md:text-5xl">
            Bitevy is always within reach.
          </h2>

          <p className="mt-4 max-w-xl text-gray-500">
            Order your favorite meals wherever you are.
          </p>

          <Link
            href="/restaurants"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gray-950 px-7 py-4 font-bold text-white transition hover:bg-gray-800"
          >
            Start Ordering
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <Image
                src="/images/Bitevy.png"
                alt="Bitevy"
                width={125}
                height={40}
                className="brightness-0 invert"
              />

              <p className="mt-5 max-w-sm text-sm leading-6 text-gray-500">
                Food delivery made simple. Discover restaurants, order your
                favorite meals, and get them delivered.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white">Bitevy</h3>

              <div className="mt-4 space-y-3 text-sm">
                <Link href="/restaurants" className="block hover:text-white">
                  Restaurants
                </Link>

                <Link href="/login" className="block hover:text-white">
                  Login
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white">Legal</h3>

              <div className="mt-4 space-y-3 text-sm">
                <Link href="/privacy" className="block hover:text-white">
                  Privacy Policy
                </Link>

                <Link href="/terms" className="block hover:text-white">
                  Terms & Conditions
                </Link>

                <Link
                  href="/delete-account"
                  className="block hover:text-white"
                >
                  Delete Account
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 text-sm text-gray-600">
            © {new Date().getFullYear()} Bitevy. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}