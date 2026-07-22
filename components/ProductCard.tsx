"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/data/products";
import { addToCart } from "@/lib/cart";
import { useAuth } from "@/context/AuthContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      return;
    }
    if (product.variants && product.variants.length > 0) {
      window.location.href = `/menu/${product.id}`;
    } else {
      addToCart(product, 1);
    }
  };

  // Helper to render rating stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <svg className="w-3.5 h-3.5 text-gray-200 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        );
      } else {
        stars.push(
          <svg key={i} className="w-3.5 h-3.5 text-gray-200 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return stars;
  };

  // Get secondary hover image dynamically
  let secondaryImage = null;
  const productImages = (product as any).images;
  
  if (Array.isArray(productImages) && productImages.length > 1) {
    secondaryImage = productImages[1];
  }

  return (
    <Link href={`/menu/${product.id}`} className="group flex flex-col overflow-hidden rounded-none bg-[#F0D8A1]/15 border border-[#A47251]/5 transition-all duration-300 hover:bg-[#F0D8A1]/35 hover:-translate-y-1 hover:shadow-md cursor-pointer">
      {/* Image Frame */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#A47251]/5 block">
        {/* Primary Image */}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-all duration-700 ease-in-out group-hover:scale-103"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority
        />
        
        {/* Secondary Hover Image (Cross-fade transition) */}
        {secondaryImage && (
          <Image
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            fill
            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 scale-100 group-hover:scale-103 transition-all duration-700 ease-in-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
        
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-block rounded-none bg-[#DD9E59] px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
              {product.badge}
            </span>
          </div>
        )}
      </div>

      {/* Text info */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#DD9E59]">
              {product.category}
            </span>
            
            {/* Rating block */}
            <div className="flex items-center space-x-1">
              <div className="flex items-center">{renderStars(product.rating)}</div>
              <span className="text-[10px] font-semibold text-[#2A1E17]/60">
                ({product.reviewsCount})
              </span>
            </div>
          </div>

          <div className="block">
            <h3 className="font-serif text-lg font-bold text-[#2A1E17] leading-snug group-hover:text-[#A47251] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Price and Add Button */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#A47251]/5">
          <span className="font-serif text-lg font-bold text-[#2A1E17]">
            {product.variants && product.variants.length > 0 ? (
              <>
                <span className="text-[10px] uppercase font-bold text-[#2A1E17]/50 block leading-none mb-0.5">From</span>
                Rs. {Math.min(...product.variants.map((v) => v.price)).toFixed(2)}
              </>
            ) : (
              `Rs. ${product.price.toFixed(2)}`
            )}
          </span>
          
          <button
            onClick={handleAddToCart}
            aria-label={product.variants && product.variants.length > 0 ? `View options for ${product.name}` : `Add ${product.name} to cart`}
            className="flex h-9 w-9 items-center justify-center rounded-none bg-[#A47251] text-white transition-all hover:bg-[#DD9E59] hover:text-[#2A1E17] cursor-pointer"
          >
            {product.variants && product.variants.length > 0 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="square" strokeLinejoin="miter" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4.5 h-4.5"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
