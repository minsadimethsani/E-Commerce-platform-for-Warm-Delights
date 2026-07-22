export default function AdminOrdersLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#A47251]/10 pb-4">
        <div className="space-y-2">
          <div className="h-7 w-44 bg-gray-300/60 rounded" />
          <div className="h-3.5 w-60 bg-gray-200/60 rounded" />
        </div>
        <div className="h-10 w-36 bg-gray-200/60 rounded-xl" />
      </div>

      {/* Order Status Tabs Skeleton */}
      <div className="flex space-x-2 border-b border-[#A47251]/10 pb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-24 bg-[#F0D8A1]/40 rounded-full" />
        ))}
      </div>

      {/* Orders Table Skeleton */}
      <div className="overflow-hidden rounded-2xl border border-[#A47251]/10 bg-white">
        <div className="bg-[#F0D8A1] h-12 w-full border-b border-[#A47251]/10" />
        <div className="divide-y divide-[#A47251]/10 p-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-300/60 rounded" />
                <div className="h-3 w-24 bg-gray-200/60 rounded" />
              </div>
              <div className="h-4 w-28 bg-gray-300/60 rounded" />
              <div className="h-5 w-20 bg-gray-300/60 rounded" />
              <div className="h-6 w-24 bg-amber-100/60 rounded-full" />
              <div className="h-8 w-24 bg-[#A47251]/30 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
