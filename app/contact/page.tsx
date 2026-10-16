"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
ArrowLeft,
ArrowUpRight,
CheckCircle2,
Clock,
Headphones,
Mail,
MessageCircle,
Send,
} from "lucide-react";

export default function ContactPage() {
const [form, setForm] = useState({
name: "",
email: "",
subject: "",
message: "",
});

const [submitted, setSubmitted] = useState(false);

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();


const subject = encodeURIComponent(
  form.subject || "Bitevy Customer Support"
);

const body = encodeURIComponent(
  `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
);

window.location.href = `mailto:support@bitevy.app?subject=${subject}&body=${body}`;

setSubmitted(true);


}

return ( <main className="min-h-screen bg-[#f8faf8] text-[#17231d]">
{/* Header */} <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur-md"> <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"> <Link href="/" className="flex items-center">
  <Image
    src="/images/Bitevy.png"
    alt="Bitevy"
    width={160}
    height={60}
    priority
    className="h-12 w-auto object-contain"
  />
</Link>



      <Link
        href="/"
        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
      >
        <ArrowLeft size={16} />
        Back home
      </Link>
    </div>
  </header>

  {/* Hero */}
  <section className="relative overflow-hidden bg-white">
    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-green-100/70 blur-3xl" />
    <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-emerald-50 blur-3xl" />

    <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-[#16803d]">
          <span className="h-2 w-2 rounded-full bg-[#16803d]" />
          CONTACT BITЕVY
        </span>

        <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          We're here to{" "}
          <span className="text-[#16803d]">help.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-8 text-gray-500 sm:text-lg">
          Have a question about your order, a delivery, or partnering with
          Bitevy? Tell us what's going on. We're happy to help.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3 text-sm font-medium text-gray-600">
        <span className="rounded-full border border-gray-200 bg-white px-4 py-2">
          Order support
        </span>
        <span className="rounded-full border border-gray-200 bg-white px-4 py-2">
          Restaurant partnerships
        </span>
        <span className="rounded-full border border-gray-200 bg-white px-4 py-2">
          Rider support
        </span>
      </div>
    </div>
  </section>

  {/* Contact content */}
  <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
    {/* Contact options */}
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#16803d]">
        Get in touch
      </p>

      <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
        Let's talk.
      </h2>

      <p className="mt-4 max-w-md leading-7 text-gray-500">
        Choose the contact method that works best for you. For order
        problems, include your order details so we can assist you faster.
      </p>

      <div className="mt-8 space-y-4">
        <a
          href="mailto:support@bitevy.app"
          className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-green-300 hover:shadow-lg hover:shadow-green-900/5"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#16803d]">
            <Mail size={22} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-bold">Email support</span>
            <span className="mt-1 block break-all text-sm text-gray-500">
              support@bitevy.app
            </span>
          </span>

          <ArrowUpRight
            size={19}
            className="text-gray-400 transition group-hover:text-[#16803d]"
          />
        </a>

        <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Headphones size={22} />
          </span>

          <span>
            <span className="block font-bold">Customer support</span>
            <span className="mt-1 block text-sm leading-6 text-gray-500">
              Need help with an order? Contact us with your order
              information.
            </span>
          </span>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Clock size={22} />
          </span>

          <span>
            <span className="block font-bold">Support enquiries</span>
            <span className="mt-1 block text-sm leading-6 text-gray-500">
              Send us a message anytime. We'll respond as soon as
              possible.
            </span>
          </span>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-[#17231d] p-6 text-white">
        <div className="flex items-center gap-3">
          <MessageCircle size={23} className="text-green-400" />
          <h3 className="text-lg font-bold">Partner with Bitevy</h3>
        </div>

        <p className="mt-3 text-sm leading-6 text-gray-300">
          Own a restaurant or want to deliver with us? Use the contact
          form and select the appropriate subject.
        </p>
      </div>
    </div>

    {/* Contact form */}
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-black/[0.03] sm:p-9">
      <div className="mb-8">
        <h2 className="text-2xl font-black">Send us a message</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Fill in the details below so we know how to help.
        </p>
      </div>

      {submitted && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 size={20} className="shrink-0" />
          <p>
            Your email app should open with your message prepared. Please
            send the email to complete your enquiry.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              maxLength={100}
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Your name"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#16803d] focus:bg-white focus:ring-4 focus:ring-green-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#16803d] focus:bg-white focus:ring-4 focus:ring-green-500/10"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="subject"
            className="mb-2 block text-sm font-semibold"
          >
            What can we help with?
          </label>
          <select
            id="subject"
            required
            value={form.subject}
            onChange={(e) =>
              setForm({ ...form, subject: e.target.value })
            }
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#16803d] focus:bg-white focus:ring-4 focus:ring-green-500/10"
          >
            <option value="" disabled>
              Select a subject
            </option>
            <option value="Order Support">Order support</option>
            <option value="Payment Issue">Payment issue</option>
            <option value="Delivery Issue">Delivery issue</option>
            <option value="Restaurant Partnership">
              Restaurant partnership
            </option>
            <option value="Rider Application">Rider application</option>
            <option value="Account Issue">Account issue</option>
            <option value="Other Enquiry">Other enquiry</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-semibold"
          >
            Your message
          </label>
          <textarea
            id="message"
            required
            rows={6}
            maxLength={3000}
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
            placeholder="Tell us how we can help..."
            className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#16803d] focus:bg-white focus:ring-4 focus:ring-green-500/10"
          />
          <p className="mt-2 text-right text-xs text-gray-400">
            {form.message.length}/3000
          </p>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16803d] px-6 py-4 font-bold text-white transition hover:bg-[#116b32] active:scale-[0.99]"
        >
          Send message
          <Send size={18} />
        </button>

        <p className="text-center text-xs leading-5 text-gray-400">
          By contacting us, you agree to use this form responsibly. Please
          do not include passwords or sensitive payment information.
        </p>
      </form>
    </div>
  </section>

  {/* Footer */}
  <footer className="border-t border-gray-200 bg-white">
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <Link href="/" className="text-lg font-black text-[#17231d]">
        bitevy<span className="text-[#16803d]">.</span>
      </Link>

      <p>Good food. Delivered with care.</p>

      <p>© {new Date().getFullYear()} Bitevy.</p>
    </div>
  </footer>
</main>


);
}
