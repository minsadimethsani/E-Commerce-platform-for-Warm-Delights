import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function MenuLoading() {
  return (
    <div className="bg-[#fdfcf9] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb skeleton */}
        <div className="flex items-center space-x-2 mb-8 animate-pulse">
          <div className="h-3.5 w-10 bg-gray-200/60 rounded" />
          <div className="h-3 w-3 bg-gray-200/40 rounded-full" />
          <div className="h-3.5 w-12 bg-gray-200/60 rounded" />
        </div>

        {/* Page Banner Header skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="h-3 w-28 bg-gray-200/60 mx-auto rounded animate-pulse" />
          <div className="h-10 w-2/3 sm:w-1/2 bg-gray-200/60 mx-auto rounded animate-pulse" />
          <div className="h-1 w-16 bg-[#c2957c]/40 mx-auto rounded-full" />
          <div className="space-y-2 max-w-xl mx-auto">
            <div className="h-3.5 w-full bg-gray-200/60 rounded animate-pulse" />
            <div className="h-3.5 w-5/6 bg-gray-200/60 mx-auto rounded animate-pulse" />
          </div>
        </div>

        {/* Top Control Bar skeleton */}
        <div className="flex items-center justify-between border-b border-[#2d1e18]/10 pb-5 mb-8">
          <div className="h-4 w-28 bg-gray-200/60 rounded animate-pulse" />
          <div className="h-8 w-36 bg-gray-200/60 rounded-full animate-pulse" />
        </div>

        {/* Sidebar & Grid Main Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Desktop Filters Sidebar skeleton */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
            <div className="bg-[#faf5f0]/50 border border-[#2d1e18]/5 rounded-2xl p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#2d1e18]/5 pb-4">
                <div className="h-5 w-16 bg-gray-200/60 rounded animate-pulse" />
                <div className="h-3 w-12 bg-gray-200/60 rounded animate-pulse" />
              </div>

              {/* Search input skeleton */}
              <div className="space-y-2">
                <div className="h-3 w-10 bg-gray-200/60 rounded animate-pulse" />
                <div className="h-9 w-full bg-gray-200/60 rounded-lg animate-pulse" />
              </div>

              {/* Categories list skeleton */}
              <div className="space-y-2">
                <div className="h-3 w-16 bg-gray-200/60 rounded animate-pulse" />
                <div className="space-y-3 pt-1">
                  <div className="h-3.5 w-24 bg-gray-200/60 rounded animate-pulse" />
                  <div className="h-3.5 w-16 bg-gray-200/60 rounded animate-pulse" />
                  <div className="h-3.5 w-20 bg-gray-200/60 rounded animate-pulse" />
                  <div className="h-3.5 w-14 bg-gray-200/60 rounded animate-pulse" />
                </div>
              </div>

              {/* Price range skeleton */}
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200/60 rounded animate-pulse" />
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-1/2 bg-gray-200/60 rounded-lg animate-pulse" />
                  <span className="text-gray-200">-</span>
                  <div className="h-8 w-1/2 bg-gray-200/60 rounded-lg animate-pulse" />
                </div>
              </div>

            </div>
          </aside>

          {/* Products Grid skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
