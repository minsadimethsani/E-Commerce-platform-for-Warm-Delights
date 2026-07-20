export default function CustomCreationsLoading() {
  return (
    <div className="bg-[#FDF9F0] min-h-screen py-10 animate-pulse">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="h-3.5 w-10 bg-gray-200/60 rounded-none" />
          <div className="h-3 w-3 bg-gray-200/40 rounded-none" />
          <div className="h-3.5 w-24 bg-gray-200/60 rounded-none" />
        </div>

        {/* Page Banner Header skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="h-3 w-28 bg-gray-200/60 mx-auto rounded-none" />
          <div className="h-10 w-2/3 sm:w-1/2 bg-gray-200/60 mx-auto rounded-none" />
          <div className="h-1 w-16 bg-[#DD9E59]/40 mx-auto rounded-none" />
          <div className="space-y-2 max-w-xl mx-auto">
            <div className="h-3.5 w-full bg-gray-200/60 rounded-none" />
            <div className="h-3.5 w-5/6 bg-gray-200/60 mx-auto rounded-none" />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Process & Gallery */}
          <div className="lg:col-span-6 space-y-12">
            <div className="space-y-4">
              <div className="h-6 w-1/3 bg-gray-200/60 rounded-none" />
              <div className="space-y-3">
                <div className="h-3.5 w-full bg-gray-200/60 rounded-none" />
                <div className="h-3.5 w-full bg-gray-200/60 rounded-none" />
                <div className="h-3.5 w-3/4 bg-gray-200/60 rounded-none" />
              </div>
            </div>

            {/* Gallery Skeletons */}
            <div className="space-y-4">
              <div className="h-6 w-1/4 bg-gray-200/60 rounded-none" />
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-gray-200/50 rounded-none" />
                <div className="aspect-square bg-gray-200/50 rounded-none" />
              </div>
            </div>
          </div>

          {/* Right Column: Form Skeleton */}
          <div className="lg:col-span-6">
            <div className="bg-[#F0D8A1]/35 border border-[#A47251]/10 p-6 sm:p-8 space-y-6">
              <div className="h-6 w-1/2 bg-gray-200/60 rounded-none" />
              <div className="space-y-4">
                <div className="h-8 w-full bg-gray-200/60 rounded-none" />
                <div className="h-8 w-full bg-gray-200/60 rounded-none" />
                <div className="h-20 w-full bg-gray-200/60 rounded-none" />
                <div className="h-10 w-full bg-gray-200/60 rounded-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
