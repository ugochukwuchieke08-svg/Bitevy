import Skeleton from "@/components/skeletons/skeleton";
import BottomNav from "@/components/BottomNav";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#fff8f0] pb-20">

      {/* Header */}
      <header className="sticky top-0 bg-[#fff8f0] px-5 py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32 rounded-lg" />

          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        <Skeleton className="mt-4 h-6 w-52" />
      </header>

      {/* Search */}
      <section className="px-5 mt-4">
        <Skeleton className="h-14 w-full rounded-full" />
      </section>

      {/* Categories */}
      <section className="px-5 mt-6">
        <Skeleton className="h-7 w-32 mb-4" />

        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center flex-shrink-0">
              <Skeleton className="w-20 h-20 rounded-3xl" />
              <Skeleton className="mt-2 h-4 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Restaurants */}
<section className="px-5 mt-8">
  <div className="flex justify-between items-center mb-5">
    <Skeleton className="h-7 w-44" />
    <Skeleton className="h-5 w-16" />
  </div>

  <div className="flex gap-4 overflow-hidden">
    {Array.from({ length: 2 }).map((_, i) => (
      <div
        key={i}
        className="w-[230px] flex-shrink-0 rounded-3xl bg-white border border-orange-100/60 shadow-md overflow-hidden"
      >
        {/* Image */}
        <Skeleton className="h-48 w-full rounded-none" />

        {/* Content */}
        <div className="p-5">
          <Skeleton className="h-5 w-32" />

          <div className="mt-5 flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Second Row */}
  <div className="mt-4 flex gap-4 overflow-hidden">
    {Array.from({ length: 2 }).map((_, i) => (
      <div
        key={i}
        className="w-[230px] flex-shrink-0 rounded-3xl bg-white border border-orange-100/60 shadow-md overflow-hidden"
      >
        <Skeleton className="h-48 w-full rounded-none" />

        <div className="p-5">
          <Skeleton className="h-5 w-32" />

          <div className="mt-5 flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

      <BottomNav />
    </main>
  );
}