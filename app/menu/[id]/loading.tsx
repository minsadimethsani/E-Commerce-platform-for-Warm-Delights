export default function ProductDetailLoading() {
  return (
    <div className="bg-[#FDF9F0] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center space-x-2 mb-8 animate-pulse">
          <div className="h-3.5 w-10 bg-gray-300/60 rounded" />
          <div className="h-3 w-3 bg-gray-300/40 rounded" />
          <div className="h-3.5 w-12 bg-gray-300/60 rounded" />
          <div className="h-3 w-3 bg-gray-300/40 rounded" />
          <div className="h-3.5 w-24 bg-gray-300/60 rounded" />
        </div>

        {/* Main Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start mb-16">
          
          {/* Left Column: Enlarged Media Box & Thumbnails */}
          <div className="space-y-4 animate-pulse">
            <div className="aspect-square w-full bg-[#F0D8A1]/40 border border-[#A47251]/10 rounded-2xl" />
            <div className="flex space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 w-20 bg-gray-300/60 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Right Column: Specifications & Selectors */}
          <div className="space-y-6 animate-pulse">
            <div className="space-y-3 border-b border-[#A47251]/10 pb-6">
              <div className="h-3 w-20 bg-[#DD9E59]/40 rounded-full" />
              <div className="h-9 w-3/4 bg-gray-300/60 rounded-lg" />
              <div className="flex items-center space-x-2">
                <div className="h-4 w-24 bg-amber-200/60 rounded" />
                <div className="h-3.5 w-28 bg-gray-300/60 rounded" />
              </div>
              <div className="h-8 w-32 bg-gray-300/60 rounded-lg pt-2" />
            </div>

            {/* Sizes & Flavors Skeletons */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-300/60 rounded" />
                <div className="flex space-x-3">
                  <div className="h-10 w-24 bg-gray-300/60 rounded-xl" />
                  <div className="h-10 w-24 bg-gray-300/60 rounded-xl" />
                  <div className="h-10 w-24 bg-gray-300/60 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-300/60 rounded" />
                <div className="flex space-x-3">
                  <div className="h-10 w-28 bg-gray-300/60 rounded-xl" />
                  <div className="h-10 w-28 bg-gray-300/60 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Quantity & Action Buttons Skeleton */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="h-12 w-32 bg-gray-300/60 rounded-full" />
              <div className="h-12 flex-1 bg-[#A47251]/40 rounded-full" />
              <div className="h-12 flex-1 bg-[#DD9E59]/40 rounded-full" />
            </div>
          </div>

        </div>

        {/* Reviews Section Skeleton */}
        <div className="border-t border-[#A47251]/10 pt-12 space-y-8">
          <div className="h-7 w-48 bg-gray-300/60 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-[#A47251]/10 p-6 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-gray-300/60 rounded" />
                    <div className="h-3 w-20 bg-gray-200/60 rounded" />
                  </div>
                  <div className="h-3.5 w-full bg-gray-200/60 rounded" />
                  <div className="h-3.5 w-2/3 bg-gray-200/60 rounded" />
                </div>
              ))}
            </div>
            <div className="bg-[#F0D8A1]/30 border border-[#A47251]/10 p-6 rounded-2xl space-y-4 animate-pulse">
              <div className="h-5 w-36 bg-gray-300/60 rounded" />
              <div className="h-20 w-full bg-white rounded-xl" />
              <div className="h-10 w-full bg-[#A47251]/40 rounded-full" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
