export default function ProfileLoading() {
  return (
    <div className="bg-[#FDF9F0] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* User Profile Banner Skeleton */}
        <div className="bg-white border border-[#A47251]/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-[#F0D8A1]/50 rounded-full shrink-0" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-gray-300/60 rounded" />
              <div className="h-3.5 w-48 bg-gray-200/60 rounded" />
            </div>
          </div>
          <div className="h-10 w-28 bg-rose-100/60 rounded-full" />
        </div>

        {/* Tab Switcher Skeleton */}
        <div className="flex space-x-3 border-b border-[#A47251]/10 pb-4 animate-pulse">
          <div className="h-10 w-36 bg-[#DD9E59]/40 rounded-full" />
          <div className="h-10 w-36 bg-gray-200/60 rounded-full" />
          <div className="h-10 w-36 bg-gray-200/60 rounded-full" />
        </div>

        {/* Content Section Skeleton */}
        <div className="bg-white border border-[#A47251]/10 rounded-2xl p-6 sm:p-8 space-y-6 animate-pulse">
          <div className="h-6 w-44 bg-gray-300/60 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-gray-200/60 rounded" />
              <div className="h-11 w-full bg-gray-200/60 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-gray-200/60 rounded" />
              <div className="h-11 w-full bg-gray-200/60 rounded-xl" />
            </div>
          </div>
          <div className="h-12 w-40 bg-[#A47251]/40 rounded-full" />
        </div>

      </div>
    </div>
  );
}
