export default function AdminAddonsLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
      {/* Form Column Skeleton */}
      <div className="bg-white border border-[#A47251]/10 rounded-2xl p-6 space-y-6">
        <div className="h-6 w-40 bg-gray-300/60 rounded" />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-3.5 w-24 bg-gray-200/60 rounded" />
            <div className="h-10 w-full bg-gray-200/60 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-20 bg-gray-200/60 rounded" />
            <div className="h-10 w-full bg-gray-200/60 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-24 bg-gray-200/60 rounded" />
            <div className="h-20 w-full bg-gray-200/60 rounded-xl" />
          </div>
        </div>
        <div className="h-11 w-full bg-[#A47251]/40 rounded-full" />
      </div>

      {/* List Column Skeleton */}
      <div className="lg:col-span-2 space-y-4">
        <div className="h-6 w-44 bg-gray-300/60 rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#A47251]/10 rounded-2xl p-5 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-36 bg-gray-300/60 rounded" />
                <div className="h-3.5 w-60 bg-gray-200/60 rounded" />
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-6 w-20 bg-amber-100/60 rounded-full" />
                <div className="h-8 w-16 bg-gray-200/60 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
