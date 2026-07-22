export default function AdminRolesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header & Tabs Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#A47251]/10 pb-4">
        <div className="flex space-x-2">
          <div className="h-10 w-40 bg-[#DD9E59]/40 rounded-full" />
          <div className="h-10 w-40 bg-gray-200/60 rounded-full" />
        </div>
        <div className="h-10 w-44 bg-[#A47251]/40 rounded-full" />
      </div>

      {/* Roles Table Rows Skeleton */}
      <div className="overflow-hidden rounded-2xl border border-[#A47251]/10 bg-white">
        <div className="bg-[#F0D8A1] h-12 w-full border-b border-[#A47251]/10" />
        <div className="divide-y divide-[#A47251]/10 p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-300/60 rounded" />
                <div className="h-3.5 w-64 bg-gray-200/60 rounded" />
              </div>
              <div className="h-6 w-24 bg-amber-100/60 rounded-full" />
              <div className="h-5 w-20 bg-gray-300/60 rounded" />
              <div className="h-8 w-28 bg-[#DD9E59]/30 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
