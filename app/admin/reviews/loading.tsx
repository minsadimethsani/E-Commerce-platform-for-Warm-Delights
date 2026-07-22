export default function AdminReviewsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header & Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F0D8A1]/30 p-4 border border-[#A47251]/10 rounded-2xl">
        <div className="h-10 w-full sm:w-72 bg-white rounded-xl" />
        <div className="h-10 w-44 bg-white rounded-xl" />
      </div>

      {/* Reviews Moderation List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white border border-[#A47251]/10 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-32 bg-gray-300/60 rounded" />
                <div className="h-4 w-20 bg-amber-200/60 rounded" />
              </div>
              <div className="h-4 w-24 bg-gray-200/60 rounded" />
            </div>
            <div className="h-3.5 w-full bg-gray-200/60 rounded" />
            <div className="h-3.5 w-3/4 bg-gray-200/60 rounded" />
            <div className="flex justify-end pt-2">
              <div className="h-8 w-20 bg-rose-100/60 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
