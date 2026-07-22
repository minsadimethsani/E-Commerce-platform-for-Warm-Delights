export default function SignatureCakesLoading() {
  return (
    <div className="bg-[#FDF9F0] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner Skeleton */}
        <div className="text-center max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-3 w-28 bg-[#DD9E59]/40 mx-auto rounded-full" />
          <div className="h-10 w-2/3 bg-gray-300/60 mx-auto rounded-lg" />
          <div className="h-3.5 w-full bg-gray-200/60 mx-auto rounded max-w-lg" />
        </div>

        {/* Product Catalog Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-[#A47251]/10 rounded-2xl p-4 space-y-4 animate-pulse">
              <div className="aspect-square w-full bg-[#F0D8A1]/40 rounded-xl" />
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-gray-300/60 rounded" />
                <div className="h-3.5 w-full bg-gray-200/60 rounded" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 w-20 bg-gray-300/60 rounded" />
                <div className="h-9 w-28 bg-[#A47251]/40 rounded-full" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
