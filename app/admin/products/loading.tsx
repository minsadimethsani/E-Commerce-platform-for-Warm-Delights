export default function AdminProductsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Action Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#A47251]/10 pb-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-300/60 rounded" />
          <div className="h-3.5 w-64 bg-gray-200/60 rounded" />
        </div>
        <div className="h-10 w-44 bg-[#A47251]/40 rounded-full" />
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F0D8A1]/30 p-4 border border-[#A47251]/10 rounded-2xl">
        <div className="h-10 w-full sm:w-72 bg-white rounded-xl" />
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="h-10 w-36 bg-white rounded-xl" />
          <div className="h-10 w-36 bg-white rounded-xl" />
        </div>
      </div>

      {/* Products Table Skeleton */}
      <div className="overflow-hidden rounded-2xl border border-[#A47251]/10 bg-white">
        <div className="bg-[#F0D8A1] h-12 w-full border-b border-[#A47251]/10" />
        <div className="divide-y divide-[#A47251]/10 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 bg-gray-300/60 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-gray-300/60 rounded" />
                  <div className="h-3 w-28 bg-gray-200/60 rounded" />
                </div>
              </div>
              <div className="h-5 w-20 bg-gray-300/60 rounded" />
              <div className="h-6 w-16 bg-amber-100/60 rounded-full" />
              <div className="flex space-x-2">
                <div className="h-8 w-16 bg-gray-200/60 rounded-lg" />
                <div className="h-8 w-16 bg-rose-100/60 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
