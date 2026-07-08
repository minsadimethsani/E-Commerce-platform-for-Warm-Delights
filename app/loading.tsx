export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FBFBF9]">
      <div className="relative flex items-center justify-center">
        {/* Outer spinning gold ring */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#C5A880]/20 border-t-[#C5A880]"></div>
        
        {/* Inner pulsing apricot ring */}
        <div className="absolute h-10 w-10 animate-ping rounded-full bg-[#EFEFEA]/20"></div>
        
        {/* Centered decorative gold core */}
        <div className="absolute h-4 w-4 rounded-full bg-[#2A1E17]"></div>
      </div>
      
      {/* Brand Name Text fading animation */}
      <h2 className="mt-6 font-serif text-xl font-bold tracking-wide text-[#2A1E17] animate-pulse">
        Warm Delights
      </h2>
      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-[#C5A880]/80 font-sans">
        Baking Freshness
      </p>
    </div>
  );
}
