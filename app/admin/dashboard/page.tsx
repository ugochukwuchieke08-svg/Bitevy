"use client";

import StatCard from "../components/StatCard";
import RecentOrders from "../components/RecentOrders";
import PendingRiders from "../components/PendingRiders";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardPage() {
  const {
    stats,
    recentOrders,
    pendingRiderApplications,
    loading,
    error,
  } = useDashboard();

  return (
    <div className="space-y-8">
{/* Header */}
<section className="flex mb-2 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <div className="mb-3 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-orange-500" />

      <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
        Overview
      </p>
    </div>

    <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
      Welcome to Bitevy
    </h1>

    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
      Monitor orders, sales, and rider activity from your central operations
      dashboard.
    </p>
  </div>

  
</section>
      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

     {/* Stats */}
<section className="w-full mb-4 min-w-0">
  <div className="flex w-full gap-4 overflow-x-auto pb-2 touch-pan-x snap-x snap-mandatory scrollbar-hide">
    
    <div className="w-[220px] text-black shrink-0 snap-start sm:w-[240px]">
      <StatCard
        title="Total Orders"
        value={
          loading
            ? "—"
            : stats.totalOrders.toLocaleString()
        }
        color="orange"
      />
    </div>

    <div className="w-[220px] text-black shrink-0 snap-start sm:w-[240px]">
      <StatCard
        title="Pending Orders"
        value={
          loading
            ? "—"
            : stats.pendingOrders.toLocaleString()
        }
        color="amber"
      />
    </div>

    <div className="w-[220px] text-black shrink-0 snap-start sm:w-[240px]">
      <StatCard
        title="Active Orders"
        value={
          loading
            ? "—"
            : stats.activeOrders.toLocaleString()
        }
        color="emerald"
      />
    </div>

    <div className="w-[220px] text-black shrink-0 snap-start sm:w-[240px]">
      <StatCard
        title="Today's Sales"
        value={
          loading
            ? "—"
            : `₦${stats.todaysSales.toLocaleString()}`
        }
        color="blue"
      />
    </div>

  </div>
</section>

      {/* Main Content */}
      <section className="grid text-gray-600 gap-6 xl:grid-cols-[1.7fr_1fr]">
        <RecentOrders
          orders={recentOrders}
        />

        <PendingRiders
          riders={pendingRiderApplications}
        />
      </section>
    </div>
  );
}