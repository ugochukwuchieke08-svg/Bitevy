"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import MobileSidebar from "./components/MobileSidebar";
import Topbar from "./components/Topbar";
import { useAdmin } from "./hooks/useAdmin";

function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="rounded-3xl border border-slate-200 bg-white px-8 py-7 text-center text-gray-600 shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

        <p className="mt-4 text-gray-600 font-bold text-slate-900">
          Checking admin access...
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Please wait a moment.
        </p>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
          🔒
        </div>

        <h1 className="mt-5 text-2xl font-black text-slate-900">
          Access Denied
        </h1>

        <p className="mt-2 text-slate-500">
          You do not have permission to access the Bitevy admin dashboard.
        </p>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { loading, allowed } = useAdmin();

  if (loading) {
    return <AdminLoading />;
  }

  if (!allowed) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <MobileSidebar
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="min-h-screen lg:ml-72">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}