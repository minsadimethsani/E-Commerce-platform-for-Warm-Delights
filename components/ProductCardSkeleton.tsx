export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-none bg-[#EFEFEA]/30 border border-[#2A1E17]/5">
      {/* Image Block shimmer */}
      <div className="relative aspect-square w-full bg-gray-200/50 animate-pulse" />
      
      {/* Text Info shimmers */}
      <div className="flex flex-1 flex-col justify-between p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {/* Category tag shimmer */}
            <div className="h-3 w-12 bg-gray-200/50 animate-pulse rounded-none" />
            {/* Rating stars block shimmer */}
            <div className="h-3 w-16 bg-gray-200/50 animate-pulse rounded-none" />
          </div>
          {/* Title shimmer */}
          <div className="h-5 w-2/3 bg-gray-200/50 animate-pulse rounded-none" />
          {/* Description line shimmers */}
          <div className="space-y-1">
            <div className="h-3 w-full bg-gray-200/50 animate-pulse rounded-none" />
            <div className="h-3 w-4/5 bg-gray-200/50 animate-pulse rounded-none" />
          </div>
        </div>
        
        {/* Footer actions shimmers */}
        <div className="pt-4 border-t border-[#2A1E17]/5 flex items-center justify-between">
          {/* Price label shimmer */}
          <div className="h-5 w-14 bg-gray-200/50 animate-pulse rounded-none" />
          {/* Add-to-cart circle button shimmer */}
          <div className="h-8 w-8 bg-gray-200/50 animate-pulse rounded-none" />
        </div>
      </div>
    </div>
  );
}
