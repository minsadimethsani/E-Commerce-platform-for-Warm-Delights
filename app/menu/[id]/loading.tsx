import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function ProductDetailLoading() {
  return (
    <div className="bg-[#FDF9F0] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs skeleton */}
        <div className="flex items-center space-x-2 mb-8 animate-pulse">
          <div className="h-3.5 w-10 bg-gray-200/60 rounded-none" />
          <div className="h-3 w-3 bg-gray-200/40 rounded-none" />
          <div className="h-3.5 w-12 bg-gray-200/60 rounded-none" />
          <div className="h-3 w-3 bg-gray-200/40 rounded-none" />
          <div className="h-3.5 w-24 bg-gray-200/60 rounded-none" />
        </div>

        {/* Product Panel skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start mb-24">
          
          {/* Left: Product Image Box skeleton */}
          <div className="relative aspect-square w-full overflow-hidden rounded-none bg-gray-200/40 border border-[#A47251]/5 animate-pulse" />

          {/* Right: Info Column skeleton */}
          <div className="space-y-8">
            
            {/* Header info skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-20 bg-gray-200/50 rounded-none animate-pulse" />
              <div className="h-10 w-3/4 bg-gray-200/50 rounded-none animate-pulse" />
              
              {/* Rating skeleton */}
              <div className="flex items-center space-x-2 pt-1">
                <div className="h-4 w-24 bg-gray-200/50 rounded-none animate-pulse" />
                <div className="h-4 w-12 bg-gray-200/50 rounded-none animate-pulse" />
              </div>

              {/* Price skeleton */}
              <div className="h-8 w-28 bg-gray-200/50 rounded-none animate-pulse" />
            </div>

            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-gray-200/50 rounded-none animate-pulse" />
              <div className="h-3.5 w-full bg-gray-200/50 rounded-none animate-pulse" />
              <div className="h-3.5 w-4/5 bg-gray-200/50 rounded-none animate-pulse" />
            </div>

            {/* Cart Controls skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center pt-6 border-t border-[#A47251]/5">
              <div className="h-11 w-full sm:w-32 bg-gray-200/50 rounded-none animate-pulse" />
              <div className="h-11 flex-1 bg-gray-200/50 rounded-none animate-pulse" />
            </div>

            {/* Quality Specs skeleton */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#A47251]/5">
              <div className="h-4 w-32 bg-gray-200/50 rounded-none animate-pulse" />
              <div className="h-4 w-36 bg-gray-200/50 rounded-none animate-pulse" />
              <div className="h-4 w-32 bg-gray-200/50 rounded-none animate-pulse" />
              <div className="h-4 w-36 bg-gray-200/50 rounded-none animate-pulse" />
            </div>

          </div>
        </div>

        {/* Recommendations skeleton */}
        <section className="border-t border-[#A47251]/10 pt-16 mb-16">
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-gray-200/50 rounded-none animate-pulse" />
              <div className="h-6 w-48 bg-gray-200/50 rounded-none animate-pulse" />
            </div>
            <div className="h-4 w-20 bg-gray-200/50 rounded-none animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
