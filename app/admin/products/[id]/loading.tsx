export default function AdminProductDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-[#A47251]/10 pb-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-300/60 rounded" />
          <div className="h-8 w-64 bg-gray-300/60 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-[#A47251]/40 rounded-full" />
      </div>

      {/* Main Detail Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 aspect-square bg-[#F0D8A1]/40 border border-[#A47251]/10 rounded-2xl" />
        <div className="lg:col-span-7 bg-white border border-[#A47251]/10 p-8 rounded-2xl space-y-6">
          <div className="h-6 w-48 bg-gray-300/60 rounded" />
          <div className="h-4 w-full bg-gray-200/60 rounded" />
          <div className="h-4 w-3/4 bg-gray-200/60 rounded" />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="h-16 bg-[#F0D8A1]/30 rounded-xl" />
            <div className="h-16 bg-[#F0D8A1]/30 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
