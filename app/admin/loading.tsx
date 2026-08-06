export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white px-8 py-8 shadow-sm">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

        <p className="mt-4 font-bold text-slate-900">
          Loading Bitevy Admin...
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Please wait while the dashboard loads.
        </p>
      </div>
    </div>
  );
}