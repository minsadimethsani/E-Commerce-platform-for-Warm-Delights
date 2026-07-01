import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ProductCatalogSkeleton() {
  return (
    <section className="bg-[#fdfcf9] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title & Header shimmers */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16">
          <div className="space-y-4 max-w-xl">
            {/* Baker's Selection tag shimmer */}
            <div className="h-3.5 w-24 bg-gray-200/60 rounded animate-pulse" />
            {/* Main title shimmer */}
            <div className="h-10 w-3/4 sm:w-2/3 bg-gray-200/60 rounded animate-pulse" />
          </div>
          {/* Header description line shimmers */}
          <div className="mt-4 md:mt-0 space-y-2 max-w-md w-full">
            <div className="h-3.5 w-full bg-gray-200/60 rounded animate-pulse" />
            <div className="h-3.5 w-5/6 bg-gray-200/60 rounded animate-pulse" />
          </div>
        </div>

        {/* Filters, Search & Sort Panel shimmers */}
        <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between border-b border-[#2d1e18]/10 pb-8 mb-10">
          {/* Category Tabs list shimmers */}
          <div className="flex flex-wrap gap-2 pb-2 lg:pb-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-200/60 rounded-full animate-pulse" />
            ))}
          </div>

          {/* Search and Sort Inputs shimmers */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full lg:w-auto">
            {/* Search Input skeleton */}
            <div className="h-9 w-full sm:w-64 bg-gray-200/60 rounded-full animate-pulse" />
            {/* Sort Selector skeleton */}
            <div className="h-9 w-full sm:w-40 bg-gray-200/60 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Dynamic Count shimmer */}
        <div className="mb-6 h-4 w-28 bg-gray-200/60 rounded animate-pulse" />

        {/* Products Grid shimmers (8 Cards) */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>

        {/* Pagination Controls shimmers */}
        <div className="flex items-center justify-center space-x-2 mt-16 pt-8 border-t border-[#2d1e18]/5">
          {/* Prev Button */}
          <div className="h-10 w-10 bg-gray-200/60 rounded-full animate-pulse" />
          {/* Page numbers */}
          <div className="h-10 w-10 bg-gray-200/60 rounded-full animate-pulse" />
          <div className="h-10 w-10 bg-gray-200/60 rounded-full animate-pulse" />
          {/* Next Button */}
          <div className="h-10 w-10 bg-gray-200/60 rounded-full animate-pulse" />
        </div>

      </div>
    </section>
  );
}
