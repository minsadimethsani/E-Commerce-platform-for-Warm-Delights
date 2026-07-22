export default function AdminReelsLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
      {/* Video Upload Form Skeleton */}
      <div className="lg:col-span-5 bg-white border border-[#A47251]/10 rounded-2xl p-6 space-y-6">
        <div className="h-6 w-44 bg-gray-300/60 rounded" />
        <div className="space-y-4">
          <div className="h-10 w-full bg-gray-200/60 rounded-xl" />
          <div className="h-44 w-full bg-[#F0D8A1]/30 border-2 border-dashed border-[#A47251]/20 rounded-2xl flex flex-col items-center justify-center space-y-2">
            <div className="h-10 w-10 bg-gray-300/50 rounded-full" />
            <div className="h-3 w-32 bg-gray-300/60 rounded" />
          </div>
        </div>
        <div className="h-12 w-full bg-[#A47251]/40 rounded-full" />
      </div>

      {/* Video Reels Showcase Grid Skeleton */}
      <div className="lg:col-span-7 space-y-4">
        <div className="h-6 w-40 bg-gray-300/60 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[9/16] bg-[#F0D8A1]/40 border border-[#A47251]/10 rounded-2xl p-3 flex flex-col justify-between">
              <div className="h-4 w-20 bg-gray-300/60 rounded" />
              <div className="h-8 w-full bg-white/80 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
