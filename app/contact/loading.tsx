export default function ContactLoading() {
  return (
    <div className="bg-[#FDF9F0] min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner Header Skeleton */}
        <div className="text-center max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-3 w-28 bg-[#DD9E59]/40 mx-auto rounded-full" />
          <div className="h-10 w-2/3 bg-gray-300/60 mx-auto rounded-lg" />
          <div className="h-3.5 w-full bg-gray-200/60 mx-auto rounded max-w-lg" />
        </div>

        {/* 2-Column Contact Info & Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6 animate-pulse">
            <div className="bg-white border border-[#A47251]/10 p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="h-6 w-36 bg-gray-300/60 rounded" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-[#F0D8A1]/50 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-28 bg-gray-300/60 rounded" />
                    <div className="h-3.5 w-4/5 bg-gray-200/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 bg-white border border-[#A47251]/10 p-6 sm:p-8 rounded-2xl space-y-6 animate-pulse">
            <div className="h-6 w-48 bg-gray-300/60 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200/60 rounded-xl" />
              <div className="h-10 bg-gray-200/60 rounded-xl" />
            </div>
            <div className="h-10 bg-gray-200/60 rounded-xl" />
            <div className="h-28 bg-gray-200/60 rounded-xl" />
            <div className="h-12 w-full bg-[#A47251]/40 rounded-full" />
          </div>

        </div>

      </div>
    </div>
  );
}
