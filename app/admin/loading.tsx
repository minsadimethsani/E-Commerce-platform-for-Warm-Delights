export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse p-6">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200/60 rounded-lg" />
        <div className="h-4 w-72 bg-gray-200/40 rounded-lg" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-[#F0D8A1]/30 border border-[#A47251]/5 rounded-2xl p-6" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="border border-[#A47251]/5 rounded-2xl bg-white p-6 space-y-4">
        <div className="h-6 w-32 bg-gray-200/60 rounded-lg" />
        <div className="space-y-3">
          <div className="h-10 w-full bg-[#F0D8A1]/20 rounded-lg" />
          <div className="h-12 w-full bg-gray-100/50 rounded-lg" />
          <div className="h-12 w-full bg-gray-100/50 rounded-lg" />
          <div className="h-12 w-full bg-gray-100/50 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
