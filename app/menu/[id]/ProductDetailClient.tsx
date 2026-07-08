"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, ProductVariant } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { addToCart } from "@/lib/cart";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );

  const incrementQty = () => setQuantity((prev) => (prev < 20 ? prev + 1 : prev));
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : prev));

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    addToCart(product, quantity, selectedVariant);
    window.dispatchEvent(new Event("open-checkout"));
  };

  // Helper to render rating stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <svg className="w-4 h-4 text-gray-200 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        );
      } else {
        stars.push(
          <svg key={i} className="w-4 h-4 text-gray-200 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className="bg-[#FBFBF9] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#3A2E2B]/60">
            <li>
              <Link href="/" className="hover:text-[#C5A880] transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="h-3 w-3 text-[#3A2E2B]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/menu" className="hover:text-[#C5A880] transition-colors">
                Menu
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="h-3 w-3 text-[#3A2E2B]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[#2A1E17] truncate max-w-[150px] sm:max-w-none">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Product Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start mb-8">
          
          {/* Left: Product Image Box */}
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[#EFEFEA] border border-[#2A1E17]/5 shadow-sm">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              className="object-cover transition-transform duration-500 hover:scale-102"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.badge && (
              <div className="absolute top-6 left-6">
                <span className="inline-block rounded-md bg-[#C5A880] px-3.5 py-1.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                  {product.badge}
                </span>
              </div>
            )}
          </div>

          {/* Right: Info Column */}
          <div className="space-y-8">
            
            {/* Header info */}
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-[#EFEFEA] border border-[#2A1E17]/5 rounded-full text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                {product.category}
              </span>
              
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2A1E17] leading-tight">
                {product.name}
              </h1>

              {/* Rating stars & review count */}
              <div className="flex items-center space-x-2 pt-1">
                <div className="flex items-center">{renderStars(product.rating)}</div>
                <span className="text-xs font-bold text-[#2A1E17]/70">
                  {product.rating.toFixed(1)} Rating
                </span>
                <span className="text-xs text-[#3A2E2B]/40 font-semibold">•</span>
                <span className="text-xs font-semibold text-[#3A2E2B]/60">
                  {product.reviewsCount} customer reviews
                </span>
              </div>

              {/* Price display */}
              <div className="text-3xl font-serif font-bold text-[#2A1E17] pt-2">
                Rs. {selectedVariant ? selectedVariant.price.toFixed(2) : product.price.toFixed(2)}
              </div>
            </div>

            {/* Quick Description */}
            <p className="text-sm sm:text-base text-[#3A2E2B]/85 leading-relaxed font-sans">
              {product.description}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#2A1E17]/5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
                  Select Option / Weight:
                </span>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v, idx) => {
                    const isSelected = selectedVariant?.name === v.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#2A1E17] text-white border-[#2A1E17] shadow-sm"
                            : "bg-white text-[#2A1E17] border-[#2A1E17]/10 hover:border-[#C5A880]"
                        }`}
                      >
                        <span className="block font-bold">{v.name}</span>
                        <span className={`block text-[10px] mt-0.5 ${isSelected ? "text-[#C5A880]" : "text-[#3A2E2B]/60"}`}>
                          Rs. {v.price.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2 pt-6 border-t border-[#2A1E17]/5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
                Quantity:
              </span>
              <div className="flex items-center justify-between bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-full px-2 py-1 w-32">
                <button
                  onClick={decrementQty}
                  disabled={quantity === 1}
                  aria-label="Decrease quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#2A1E17] hover:bg-[#2A1E17]/5 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>
                <span className="font-semibold text-sm text-[#2A1E17] min-w-5 text-center select-none">
                  {quantity}
                </span>
                <button
                  onClick={incrementQty}
                  disabled={quantity === 20}
                  aria-label="Increase quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#2A1E17] hover:bg-[#2A1E17]/5 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch pt-4">
              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 rounded-full py-3 px-8 text-xs font-bold uppercase tracking-wider text-center transition-all duration-300 cursor-pointer shadow-xs ${
                  isAdded
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-[#2A1E17] text-white hover:bg-[#C5A880] hover:text-[#2A1E17]"
                }`}
              >
                {isAdded ? "Added to Cart ✓" : "Add to Cart"}
              </button>

              {/* Buy Now CTA */}
              <button
                onClick={handleBuyNow}
                className="flex-1 rounded-full py-3 px-8 text-xs font-bold uppercase tracking-wider text-center transition-all duration-300 cursor-pointer shadow-xs bg-[#C5A880] text-[#2A1E17] hover:bg-[#2A1E17] hover:text-white"
              >
                Buy Now
              </button>
            </div>

          </div>
        </div>

        {/* Recommendations / Related Products */}
        <section className="border-t border-[#2A1E17]/10 pt-8 mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
                Recommendations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2A1E17]">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/menu"
              className="mt-4 md:mt-0 text-xs font-bold uppercase tracking-wider text-[#2A1E17] hover:text-[#C5A880] flex items-center transition-colors cursor-pointer"
            >
              <span>View Full Menu</span>
              <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
