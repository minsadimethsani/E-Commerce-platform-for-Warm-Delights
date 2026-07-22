export default function AdminCategoriesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#A47251]/10 pb-4">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-gray-300/60 rounded" />
          <div className="h-3.5 w-72 bg-gray-200/60 rounded" />
        </div>
        <div className="h-10 w-44 bg-[#A47251]/40 rounded-full" />
      </div>

      {/* Categories Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-[#A47251]/10 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-gray-300/60 rounded" />
              <div className="h-5 w-16 bg-amber-100/60 rounded-full" />
            </div>
            <div className="h-3.5 w-full bg-gray-200/60 rounded" />
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="h-6 w-16 bg-[#F0D8A1]/40 rounded-lg" />
              <div className="h-6 w-20 bg-[#F0D8A1]/40 rounded-lg" />
              <div className="h-6 w-14 bg-[#F0D8A1]/40 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
