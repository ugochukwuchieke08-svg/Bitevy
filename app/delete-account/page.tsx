"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faTrash,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-[#fff8f0] px-5 py-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="text-3xl text-red-500"
            />
          </div>

          <h1 className="mt-5 text-3xl font-black text-gray-900">
            Delete Your Bitevy Account
          </h1>

          <p className="mt-3 text-gray-600">
            We're sorry to see you go. Before requesting account deletion,
            please read the information below.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[30px] bg-white p-8 shadow-lg">

          <h2 className="text-xl font-bold text-gray-900">
            Account Deletion Request
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            If you would like to permanently delete your Bitevy account and
            associated personal data, please submit a request by emailing{" "}
            <a
              href="mailto:support@bitevy.app"
              className="font-semibold text-orange-600 hover:underline"
            >
              support@bitevy.app
            </a>{" "}
            using the email address associated with your Bitevy account.
          </p>

          <p className="mt-5 leading-8 text-gray-600">
            Once we verify your request, we will permanently delete your
            account and personal data within <strong>30 days</strong>, except
            where we are legally required to retain certain information, such
            as order history, payment records, or other information required
            for regulatory compliance.
          </p>

          {/* Information Box */}
          <div className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-5">

            <h3 className="font-bold text-orange-700">
              What happens when your account is deleted?
            </h3>

            <ul className="mt-4 space-y-3 text-gray-700">
              <li>• Your Bitevy account will be permanently removed.</li>
              <li>• Your profile information will be deleted.</li>
              <li>• Your saved favorite restaurants will be removed.</li>
              <li>• Your saved delivery addresses will be deleted.</li>
              <li>• This action cannot be undone.</li>
            </ul>

          </div>

          {/* Contact Button */}
          <a
            href="mailto:support@bitevy.app?subject=Account%20Deletion%20Request"
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-red-500 py-4 font-bold text-white transition hover:bg-red-600"
          >
            <FontAwesomeIcon icon={faEnvelope} />
            Request Account Deletion
          </a>

          {/* Back */}
          <Link
            href="/account"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-4 font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faTrash} />
            Back to Account
          </Link>

        </div>
      </div>
    </main>
  );
}