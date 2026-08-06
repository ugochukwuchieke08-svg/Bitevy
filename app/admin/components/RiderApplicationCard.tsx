"use client";

import { Bike, CalendarDays, Phone, ShieldCheck } from "lucide-react";
import { RiderApplication } from "../types";
import RiderStatusBadge from "./RiderStatusBadge";

type Props = {
  rider: RiderApplication;
  reviewing: boolean;
  onReview: (
    applicationId: string,
    decision: "approve" | "reject"
  ) => void;
};

export default function RiderApplicationCard({
  rider,
  reviewing,
  onReview,
}: Props) {
  const handleReview = (
    decision: "approve" | "reject"
  ) => {
    const action =
      decision === "approve"
        ? "approve"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${rider.full_name}'s application?`
    );

    if (!confirmed) {
      return;
    }

    onReview(rider.id, decision);
  };

  return (
    <article className="overflow-hidden  rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="flex items-start gap-4 border-b text-gray-600 border-slate-100 p-5 sm:p-6">
        <img
          src={
            rider.profile_image ||
            "/avatar.png"
          }
          alt={rider.full_name}
          className="h-16 w-16 text-gray-600 shrink-0 rounded-2xl object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-black text-slate-900">
                {rider.full_name}
              </h3>

              <div className="mt-2 flex items-center gap-2  text-gray-600 text-sm text-slate-500">
                <Phone size={15} />
                <span>{rider.phone}</span>
              </div>
            </div>

            <RiderStatusBadge  status={rider.status} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-600 text-slate-400">
            <Bike size={14} />
            Bike Type
          </div>

          <p className="mt-2 text-black font-bold text-slate-900">
            {rider.bike_type || "Not provided"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-600 tracking-wide text-slate-400">
            <ShieldCheck size={14} />
            NIN Number
          </div>

          <p className="mt-2 break-all text-black font-bold text-slate-900">
            {rider.nin_number || "Not provided"}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-600 tracking-wide text-slate-400">
            <CalendarDays size={14} />
            Applied
          </div>

          <p className="mt-2 text-black font-semibold text-slate-700">
            {new Date(
              rider.created_at
            ).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Documents */}
      <div className="grid gap-4 border-t border-slate-100 text-gray-600 p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <p className="mb-2 text-gray-600 text-sm font-bold text-slate-700">
            Profile Photo
          </p>

          <img
            src={
              rider.profile_image ||
              "/avatar.png"
            }
            alt={`${rider.full_name} profile`}
            className="h-56 w-full text-gray-600 rounded-2xl object-cover"
          />
        </div>

        <div>
          <p className="mb-2 text-gray-600 text-sm font-bold text-slate-700">
            NIN Document
          </p>

          {rider.nin_image ? (
            <a
              href={rider.nin_image}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <img
                src={rider.nin_image}
                alt="NIN document"
                className="h-56 w-full rounded-2xl object-cover transition hover:opacity-90"
              />
            </a>
          ) : (
            <div className="flex h-56 items-center justify-center rounded-2xl bg-slate-100 text-sm text-gray-600 font-semibold text-slate-500">
              No NIN document uploaded
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {rider.status === "pending" && (
        <div className="grid gap-3 border-t border-slate-100 p-5 sm:grid-cols-2 sm:p-6">
          <button
            type="button"
            onClick={() =>
              handleReview("approve")
            }
            disabled={reviewing}
            className="rounded-2xl  bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reviewing
              ? "Processing..."
              : "Approve Rider"}
          </button>

          <button
            type="button"
            onClick={() =>
              handleReview("reject")
            }
            disabled={reviewing}
            className="rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reviewing
              ? "Processing..."
              : "Reject Rider"}
          </button>
        </div>
      )}
    </article>
  );
}