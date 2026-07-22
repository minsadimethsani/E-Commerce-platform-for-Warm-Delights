export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#FDF9F0] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Banner Skeleton */}
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-[#F0D8A1]/40 border border-[#A47251]/10 p-8 flex flex-col justify-end space-y-4 animate-pulse">
          <div className="h-4 w-32 bg-gray-300/60 rounded-full" />
          <div className="h-10 w-2/3 max-w-xl bg-gray-300/60 rounded-lg" />
          <div className="h-4 w-1/2 max-w-md bg-gray-300/50 rounded-full" />
          <div className="flex space-x-4 pt-4">
            <div className="h-10 w-36 bg-[#A47251]/30 rounded-full" />
            <div className="h-10 w-36 bg-gray-300/50 rounded-full" />
          </div>
        </div>

        {/* Categories Bar Skeleton */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-2 animate-pulse">
              <div className="h-3 w-24 bg-gray-300/60 rounded-full" />
              <div className="h-7 w-48 bg-gray-300/60 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-white border border-[#A47251]/10 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-[#F0D8A1]/50" />
                <div className="h-3 w-16 bg-gray-300/60 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products Grid Skeleton */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-[#A47251]/10 pb-4">
            <div className="space-y-2 animate-pulse">
              <div className="h-3 w-28 bg-gray-300/60 rounded-full" />
              <div className="h-8 w-60 bg-gray-300/60 rounded-lg" />
            </div>
            <div className="h-4 w-24 bg-gray-300/60 rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-[#A47251]/10 rounded-2xl overflow-hidden space-y-4 p-4 animate-pulse">
                <div className="aspect-square w-full bg-[#F0D8A1]/40 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-gray-300/60 rounded" />
                  <div className="h-3.5 w-full bg-gray-200/60 rounded" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-6 w-20 bg-gray-300/60 rounded" />
                  <div className="h-9 w-28 bg-[#A47251]/30 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
