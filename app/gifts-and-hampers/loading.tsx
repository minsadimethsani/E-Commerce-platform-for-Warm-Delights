import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function GiftsLoading() {
  return (
    <div className="bg-[#FDF9F0] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center space-x-2 mb-8 animate-pulse">
          <div className="h-3.5 w-10 bg-gray-200/60 rounded-none" />
          <div className="h-3 w-3 bg-gray-200/40 rounded-none" />
          <div className="h-3.5 w-20 bg-gray-200/60 rounded-none" />
        </div>

        {/* Page Banner Header skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="h-3 w-28 bg-gray-200/60 mx-auto rounded-none animate-pulse" />
          <div className="h-10 w-2/3 sm:w-1/2 bg-gray-200/60 mx-auto rounded-none animate-pulse" />
          <div className="h-1 w-16 bg-[#DD9E59]/40 mx-auto rounded-none" />
          <div className="space-y-2 max-w-xl mx-auto animate-pulse">
            <div className="h-3.5 w-full bg-gray-200/60 rounded-none" />
            <div className="h-3.5 w-5/6 bg-gray-200/60 mx-auto rounded-none" />
          </div>
        </div>

        {/* Products Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
