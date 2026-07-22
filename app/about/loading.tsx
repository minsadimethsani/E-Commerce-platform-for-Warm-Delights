export default function AboutLoading() {
  return (
    <div className="bg-[#FDF9F0] min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* About Hero Banner Skeleton */}
        <div className="text-center max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-3 w-24 bg-[#DD9E59]/40 mx-auto rounded-full" />
          <div className="h-10 w-2/3 bg-gray-300/60 mx-auto rounded-lg" />
          <div className="h-4 w-full bg-gray-200/60 mx-auto rounded max-w-xl" />
        </div>

        {/* Story Section Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] w-full bg-[#F0D8A1]/40 border border-[#A47251]/10 rounded-2xl animate-pulse" />
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-28 bg-[#DD9E59]/40 rounded-full" />
            <div className="h-8 w-3/4 bg-gray-300/60 rounded-lg" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-gray-200/60 rounded" />
              <div className="h-3.5 w-full bg-gray-200/60 rounded" />
              <div className="h-3.5 w-4/5 bg-gray-200/60 rounded" />
            </div>
          </div>
        </div>

        {/* Values 3-Card Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#A47251]/10 p-8 rounded-2xl space-y-4 animate-pulse">
              <div className="h-12 w-12 bg-[#F0D8A1]/50 rounded-xl" />
              <div className="h-6 w-36 bg-gray-300/60 rounded" />
              <div className="h-3.5 w-full bg-gray-200/60 rounded" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
