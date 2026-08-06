import Link from "next/link";
import { ArrowRight, Bike } from "lucide-react";
import { RiderApplication } from "../types";

type Props = {
  riders: RiderApplication[];
};

export default function PendingRiders({
  riders,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Rider Applications
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            New riders waiting for approval.
          </p>
        </div>

        <Link
          href="/admin/riders"
          className="rounded-xl p-2 text-orange-600 transition hover:bg-orange-50"
          aria-label="View rider applications"
        >
          <ArrowRight size={20} />
        </Link>
      </div>

      {riders.length === 0 ? (
        <div className="flex flex-col items-center p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Bike
              size={26}
              className="text-slate-400"
            />
          </div>

          <p className="mt-4 font-bold text-slate-900">
            No pending applications
          </p>

          <p className="mt-1 text-sm text-slate-500">
            You're all caught up.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {riders.map((rider) => (
            <div
              key={rider.id}
              className="flex items-center gap-4 p-5 transition hover:bg-slate-50"
            >
              <img
                src={
                  rider.profile_image ||
                  "/avatar.png"
                }
                alt={rider.full_name}
                className="h-12 w-12 rounded-2xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900">
                  {rider.full_name}
                </p>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {rider.bike_type}
                </p>
              </div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold capitalize text-amber-700">
                Pending
              </span>
            </div>
          ))}
        </div>
      )}

      {riders.length > 0 && (
        <div className="border-t border-slate-100 p-4">
          <Link
            href="/admin/riders"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            Review Applications
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}