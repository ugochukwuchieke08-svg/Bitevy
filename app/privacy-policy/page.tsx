
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#fff8f0]">
     {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Link
            href="/"
            className="text-sm text-orange-600 hover:underline"
          >
            ← Back to Home
          </Link>

          <h1 className="mt-4 text-4xl font-bold text-gray-900">
            Privacy Policy
          </h1>

          <p className="mt-2 text-gray-500">
            Last updated: July 20, 2026
          </p>
        </div>
      </header>

      {/* Content */}
       <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="prose prose-gray max-w-none">

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              1. Introduction
            </h2>

            <p className="text-gray-700 leading-8">
              Welcome to Bitevy. Bitevy is a food delivery platform that connects
              customers with restaurants and delivery riders to make ordering
              meals simple, fast, and reliable.
            </p>

            <p className="text-gray-700 leading-8 mt-4">
              This Privacy Policy explains how we collect, use, protect, and
              share your information when you use our website, mobile
              application, and related services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              2. Information We Collect
            </h2>

            <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-8">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Delivery addresses</li>
              <li>Order history</li>
              <li>Restaurant and rider account information</li>
              <li>Device and browser information</li>
              <li>Usage statistics and analytics</li>
              <li>Information you voluntarily provide while using Bitevy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              3. How We Use Your Information
            </h2>

            <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-8">
              <li>Create and manage your account.</li>
              <li>Process food orders.</li>
              <li>Coordinate restaurants and delivery riders.</li>
              <li>Provide customer support.</li>
              <li>Improve Bitevy's services.</li>
              <li>Detect fraud and maintain platform security.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              4. Payments
            </h2>

            <p className="text-gray-700 leading-8">
              Payments made through Bitevy are securely processed by trusted
              payment providers such as OPay. Bitevy does not store your debit
              card, credit card, or banking credentials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              5. Sharing Information
            </h2>

            <p className="text-gray-700 leading-8">
              We only share information required to operate the platform.
            </p>

            <ul className="list-disc pl-6 mt-4 space-y-3 text-gray-700 leading-8">
              <li>Restaurants receive the information needed to prepare your order.</li>
              <li>Delivery riders receive delivery details necessary to complete deliveries.</li>
              <li>Trusted service providers help us operate Bitevy.</li>
              <li>We may disclose information when required by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              6. Data Security
            </h2>

            <p className="text-gray-700 leading-8">
              We use industry-standard security measures designed to protect your
              personal information. While no online platform can guarantee
              absolute security, we continuously work to keep your information
              safe.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              7. Cookies
            </h2>

            <p className="text-gray-700 leading-8">
              Bitevy may use cookies and similar technologies to improve
              functionality, remember your preferences, and analyze how our
              services are used.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              8. Children's Privacy
            </h2>

            <p className="text-gray-700 leading-8">
              Bitevy is not intended for children under the age of 13. We do not
              knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              9. Your Rights
            </h2>

            <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-8">
              <li>Access your personal information.</li>
              <li>Correct inaccurate information.</li>
              <li>Request deletion of your account.</li>
              <li>Withdraw consent where applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              10. Changes to This Policy
            </h2>

            <p className="text-gray-700 leading-8">
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page together with the updated revision
              date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              11. Contact Us
            </h2>

            <div className="rounded-2xl bg-orange-50 border border-orange-100 p-6">
             <p>
              <strong className="text-gray-700">Email:</strong>{" "}
              <a
                href="mailto:support@bitevy.app"
                className="text-orange-600 hover:underline"
              >
                support@bitevy.app
              </a>
            </p>

              <p>
              <strong className="text-gray-700">Website:</strong>{" "}
              <a
                href="https://bitevy.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                bitevy.app
              </a>
            </p>
            </div>
          </section>

        </div>
      </section>
    </main>
  );
}

