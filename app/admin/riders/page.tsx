"use client";

import { useMemo, useState } from "react";
import RiderApplicationCard from "../components/RiderApplicationCard";
import { useRiders } from "../hooks/useRiders";

export default function RidersPage() {
  const {
    riders,
    loading,
    reviewingId,
    error,
    reviewApplication,
  } = useRiders();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "active" | "rejected"
  >("all");

  const filteredRiders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return riders.filter((rider) => {
      const matchesSearch =
        !term ||
        rider.full_name
          ?.toLowerCase()
          .includes(term) ||
        rider.phone
          ?.toLowerCase()
          .includes(term) ||
        rider.bike_type
          ?.toLowerCase()
          .includes(term) ||
        rider.nin_number
          ?.toLowerCase()
          .includes(term);

      const matchesFilter =
        filter === "all" ||
        rider.status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [riders, search, filter]);

  const pendingCount = riders.filter(
    (rider) => rider.status === "pending"
  ).length;

  const activeCount = riders.filter(
    (rider) => rider.status === "active"
  ).length;

  const rejectedCount = riders.filter(
    (rider) => rider.status === "rejected"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
          Operations
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Rider Applications
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Review applications and manage the
              delivery partners operating on Bitevy.
            </p>
          </div>

         
        </div>
      </section>

      {/* Stats */}
<section className="grid grid-cols-3 mb-3 gap-3">
  <button
    type="button"
    onClick={() => setFilter("pending")}
    className={`rounded-2xl border p-4 text-left transition ${
      filter === "pending"
        ? "border-orange-300 bg-orange-50"
        : "border-slate-200 bg-white hover:border-orange-200"
    }`}
  >
    <p className="text-sm font-semibold text-gray-600">
      Pending
    </p>

    <p className="mt-2 text-2xl font-black text-gray-600">
      {pendingCount}
    </p>
  </button>

  <button
    type="button"
    onClick={() => setFilter("active")}
    className={`rounded-2xl border p-4 text-left transition ${
      filter === "active"
        ? "border-emerald-300 bg-emerald-50"
        : "border-slate-200 bg-white hover:border-emerald-200"
    }`}
  >
    <p className="text-sm font-semibold text-gray-600">
      Active
    </p>

    <p className="mt-2 text-2xl font-black text-gray-600">
      {activeCount}
    </p>
  </button>

  <button
    type="button"
    onClick={() => setFilter("rejected")}
    className={`rounded-2xl border p-4 text-left transition ${
      filter === "rejected"
        ? "border-red-300 bg-red-50"
        : "border-slate-200 bg-white hover:border-red-200"
    }`}
  >
    <p className="text-sm font-semibold text-gray-600">
      Rejected
    </p>

    <p className="mt-2 text-2xl font-black text-gray-600">
      {rejectedCount}
    </p>
  </button>
</section>

      {/* Search and Filter */}
      <section className="flex flex-col mb-2 gap-3 rounded-3xl border border-slate-200 text-gray-600 bg-white p-4 shadow-sm sm:flex-row">
        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search rider name, phone, bike or NIN..."
          className="min-w-0 flex-1 text-gray-600 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
        />

        <select
          value={filter}
          onChange={(e) =>
            setFilter(
              e.target.value as
                | "all"
                | "pending"
                | "active"
                | "rejected"
            )
          }
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-orange-400 focus:bg-white"
        >
          <option value="all">
            All Applications
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="active">
            Active
          </option>

          <option value="rejected">
            Rejected
          </option>
        </select>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[500px] animate-pulse rounded-3xl bg-white shadow-sm"
            />
          ))}
        </div>
      ) : filteredRiders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <span className="text-2xl">🏍️</span>
          </div>

          <h2 className="mt-4 text-gray-600 font-black text-slate-900">
            No applications found
          </h2>

          <p className="mt-2 text-gray-600 text-sm text-slate-500">
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredRiders.map((rider) => (
            <RiderApplicationCard
              key={rider.id}
              rider={rider}
              reviewing={
                reviewingId === rider.id
              }
              onReview={
                reviewApplication
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}