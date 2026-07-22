export default function CustomCreationsLoading() {
  return (
    <div className="bg-[#FDF9F0] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner Header Skeleton */}
        <div className="text-center max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-3 w-32 bg-[#DD9E59]/40 mx-auto rounded-full" />
          <div className="h-10 w-3/4 bg-gray-300/60 mx-auto rounded-lg" />
          <div className="h-3.5 w-full bg-gray-200/60 mx-auto rounded max-w-xl" />
        </div>

        {/* 2-Column Order Builder & Gallery Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Form Builder Column Skeleton */}
          <div className="lg:col-span-7 bg-white border border-[#A47251]/10 rounded-2xl p-6 sm:p-8 space-y-6 animate-pulse">
            <div className="h-6 w-48 bg-gray-300/60 rounded" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200/60 rounded" />
                <div className="h-10 w-full bg-gray-200/60 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200/60 rounded" />
                <div className="h-10 w-full bg-gray-200/60 rounded-xl" />
              </div>
            </div>

            {/* Dropzone Box Skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-36 bg-gray-200/60 rounded" />
              <div className="h-40 w-full bg-[#F0D8A1]/30 border-2 border-dashed border-[#A47251]/20 rounded-2xl flex flex-col items-center justify-center space-y-2">
                <div className="h-10 w-10 bg-gray-300/50 rounded-full" />
                <div className="h-3 w-32 bg-gray-300/60 rounded" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="h-10 bg-gray-200/60 rounded-xl" />
              <div className="h-10 bg-gray-200/60 rounded-xl" />
              <div className="h-10 bg-gray-200/60 rounded-xl" />
            </div>

            <div className="h-12 w-full bg-[#A47251]/40 rounded-full" />
          </div>

          {/* Gallery Showcase Column Skeleton */}
          <div className="lg:col-span-5 space-y-6 animate-pulse">
            <div className="h-6 w-44 bg-gray-300/60 rounded" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-white border border-[#A47251]/10 rounded-2xl overflow-hidden p-3 space-y-2">
                  <div className="aspect-square w-full bg-[#F0D8A1]/40 rounded-xl" />
                  <div className="h-3.5 w-3/4 bg-gray-300/60 rounded" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
