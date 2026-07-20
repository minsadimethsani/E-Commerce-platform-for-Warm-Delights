"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function GiftsAndHampersClient() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/products?limit=100", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load products. Please check your connection.");
        }
        const data = await response.json();
        const allProducts: Product[] = data.products || [];
        // Filter by category "Gifts & Hampers" and availability
        const gifts = allProducts.filter(
          (p) => p.category === "Gifts & Hampers" && p.isAvailable !== false
        );
        setProductsList(gifts);
      } catch (err: any) {
        console.error("Error fetching gifts & hampers:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGifts();
  }, []);

  return (
    <div className="bg-[#FDF9F0] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#2A1E17]/60">
            <li>
              <Link href="/" className="hover:text-[#DD9E59] transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="h-3 w-3 text-[#2A1E17]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[#2A1E17]">Gifts & Hampers</span>
            </li>
          </ol>
        </nav>

        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#DD9E59]">
            Exquisite Gifting
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2A1E17]">
            Gifts & Hampers
          </h1>
          <div className="h-1 w-16 bg-[#DD9E59] mx-auto rounded-none" />
          <p className="text-sm sm:text-base text-[#2A1E17]/80 leading-relaxed max-w-2xl mx-auto">
            Beautifully curated gift hampers, premium cookie assortments, and artisanal sweet boxes designed to express love, gratitude, and celebration.
            Handcrafted and thoughtfully packed for your special moments.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12 max-w-md mx-auto">
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#A47251] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!error && (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-pulse">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : productsList.length === 0 ? (
              <div className="text-center py-20 bg-[#F0D8A1]/20 border border-[#A47251]/5">
                <p className="text-base text-[#2A1E17]/70">No gifts & hampers are currently available. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {productsList.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Gifting Info Section */}
        <section className="mt-24 bg-[#F0D8A1]/40 border border-[#A47251]/5 p-8 sm:p-12 text-[#2A1E17]">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#DD9E59]">Bakery Guide</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold">Gifting & Corporate Ordering Guide</h2>
              <div className="h-0.5 w-12 bg-[#DD9E59] mx-auto mt-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              <div className="space-y-3 bg-white p-6 border border-[#A47251]/5">
                <div className="w-10 h-10 border border-[#DD9E59]/20 flex items-center justify-center text-[#DD9E59] font-bold text-lg">1</div>
                <h3 className="font-bold text-sm uppercase tracking-wide">Complimentary Note</h3>
                <p className="text-xs leading-relaxed text-[#2A1E17]/80">
                  Every hamper comes with a complimentary handwritten card and personalized ribbon. Specify your gift message in the order notes during checkout!
                </p>
              </div>

              <div className="space-y-3 bg-white p-6 border border-[#A47251]/5">
                <div className="w-10 h-10 border border-[#DD9E59]/20 flex items-center justify-center text-[#DD9E59] font-bold text-lg">2</div>
                <h3 className="font-bold text-sm uppercase tracking-wide">Corporate Orders</h3>
                <p className="text-xs leading-relaxed text-[#2A1E17]/80">
                  Planning corporate giveaways or bulk orders? Get in touch with our concierge team through the contact page for customized packaging options.
                </p>
              </div>

              <div className="space-y-3 bg-white p-6 border border-[#A47251]/5">
                <div className="w-10 h-10 border border-[#DD9E59]/20 flex items-center justify-center text-[#DD9E59] font-bold text-lg">3</div>
                <h3 className="font-bold text-sm uppercase tracking-wide">Secure Delivery</h3>
                <p className="text-xs leading-relaxed text-[#2A1E17]/80">
                  We pack our hampers securely in specialized boxes and wooden crates to ensure they arrive in pristine, perfect condition at your recipient's door.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
