export default function AdminRoleDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Breadcrumb & Header Skeleton */}
      <div className="flex items-center space-x-2 border-b border-[#A47251]/10 pb-4">
        <div className="h-4 w-20 bg-gray-300/60 rounded" />
        <div className="h-3 w-3 bg-gray-300/40 rounded" />
        <div className="h-4 w-32 bg-gray-300/60 rounded" />
      </div>

      {/* Role Summary Banner Skeleton */}
      <div className="bg-white border border-[#A47251]/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="h-7 w-48 bg-gray-300/60 rounded" />
            <div className="h-5 w-24 bg-amber-100/60 rounded-full" />
          </div>
          <div className="h-3.5 w-72 bg-gray-200/60 rounded" />
        </div>
        <div className="h-10 w-32 bg-[#A47251]/40 rounded-full" />
      </div>

      {/* Permission Categories Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white border border-[#A47251]/10 rounded-2xl p-5 space-y-4">
            <div className="h-5 w-32 bg-[#F0D8A1]/60 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200/60 rounded" />
              <div className="h-4 w-3/4 bg-gray-200/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
