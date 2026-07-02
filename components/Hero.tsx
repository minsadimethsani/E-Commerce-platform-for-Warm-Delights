"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Product, products as localProducts } from "@/data/products";

interface HeroProps {
  products?: Product[];
}

export default function Hero({ products = [] }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-play slide transition timer (5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      handleSlideChange((currentSlide + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleSlideChange = (index: number) => {
    if (index === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 300); // match fade duration
  };

  // Safe fallback list of products
  const activeProducts = products.length > 0 ? products : localProducts;

  // Slide 1: Find first available product with a valid image
  const availableProduct =
    activeProducts.find((p) => p.isAvailable !== false && p.image) || activeProducts[0];

  // Slide 2: Four-column product image section (using product images from firestore/database)
  let imageProducts = activeProducts.filter((p) => p.isAvailable !== false && p.image);
  if (imageProducts.length < 4) {
    const merged = [...imageProducts];
    for (const item of activeProducts) {
      if (merged.length >= 4) break;
      if (!merged.some((m) => m.id === item.id)) {
        merged.push(item);
      }
    }
    imageProducts = merged;
  }
  const slide2Products = imageProducts.slice(0, 4);

  // Slide 3: Find custom cakes (fallback to Custom category or products 4, 18, 20)
  let customCakes = activeProducts.filter(
    (p) => p.category === "Custom" && p.image
  );
  if (customCakes.length < 3) {
    const fallbackIds = ["prod-4", "prod-18", "prod-20"];
    const fallbackList = activeProducts.filter((p) => fallbackIds.includes(p.id));
    customCakes = [...customCakes, ...fallbackList.filter(f => !customCakes.some(c => c.id === f.id))].slice(0, 3);
  }

  return (
    <div className="relative min-h-[90vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#2d1e18] py-16 sm:py-24">
      {/* Background Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2d1e18]/90 via-[#2d1e18]/45 to-[#2d1e18]" />
      
      {/* Slide Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SLIDE 1: Brand & Available Product */}
        <div
          className={`transition-all duration-500 transform ${
            currentSlide === 0
              ? "opacity-100 translate-x-0 relative block"
              : "opacity-0 absolute pointer-events-none translate-x-4 hidden"
          } ${isTransitioning ? "opacity-0" : ""}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 text-left max-w-xl animate-fade-in-up">
              <span className="inline-block rounded-full bg-[#faf5f0]/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-[#e5a193] uppercase backdrop-blur-sm border border-white/10">
                Handcrafted Daily in Small Batches
              </span>
              
              <h1 className="font-serif text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
                Warm Delights
                <span className="block text-3xl sm:text-4xl lg:text-5xl font-sans font-light tracking-wide text-[#c2957c] mt-2">
                  Artisanal Pastries & Cakes
                </span>
              </h1>
              
              <p className="text-base sm:text-lg leading-relaxed text-[#fdfcf9]/85">
                From rustic, decadent signature cakes for your special milestones to warm, flaky, golden-brown savory pastries. Baked fresh daily with love and local premium ingredients.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/menu"
                  className="w-full sm:w-auto rounded-full bg-[#c2957c] px-8 py-4 text-sm font-semibold tracking-wide text-[#2d1e18] shadow-lg transition-all hover:bg-[#e5a193] hover:text-white hover:scale-102 hover:shadow-xl text-center"
                >
                  Order Online
                </Link>
                <a
                  href="#catalog-section"
                  className="w-full sm:w-auto rounded-full border-2 border-white/80 bg-transparent px-8 py-4 text-sm font-semibold tracking-wide text-white transition-all hover:bg-white hover:text-[#2d1e18] hover:scale-102 text-center"
                >
                  Explore Menu
                </a>
              </div>
            </div>

            {/* Right Product Image */}
            <div className="relative flex justify-center items-center">
              <div className="absolute w-[80%] aspect-square bg-[#c2957c]/10 rounded-full blur-3xl -z-10" />
              <div className="relative w-full max-w-[450px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white/15 group">
                <img
                  src={availableProduct?.image}
                  alt={availableProduct?.name || "Featured Product"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                />
                
                {/* Available Badge Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2d1e18] via-[#2d1e18]/40 to-transparent p-6 text-left">
                  <span className="inline-block bg-[#c2957c] text-[#2d1e18] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                    Available Today
                  </span>
                  <h4 className="font-serif text-xl font-bold text-white">{availableProduct?.name}</h4>
                  <p className="text-xs text-white/80 line-clamp-2 mt-1">{availableProduct?.description}</p>
                  <Link
                    href={`/menu/${availableProduct?.id}`}
                    className="inline-flex items-center text-xs font-bold text-[#e5a193] hover:text-white mt-3 transition-colors"
                  >
                    <span>View Product Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="ml-1 w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 2: Four-Column Product Showcase */}
        <div
          className={`transition-all duration-500 transform ${
            currentSlide === 1
              ? "opacity-100 translate-x-0 relative block"
              : "opacity-0 absolute pointer-events-none translate-x-4 hidden"
          } ${isTransitioning ? "opacity-0" : ""}`}
        >
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-block rounded-full bg-[#faf5f0]/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-[#e5a193] uppercase backdrop-blur-sm border border-white/10 mb-4">
              Our Signature Delights
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Featured Delicacies
            </h2>
            <p className="mt-3 text-sm text-[#fdfcf9]/75 max-w-lg mx-auto">
              Explore our most loved handcrafted delicacies, made fresh daily with premium ingredients and baked to perfection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {slide2Products.map((p) => (
              <div
                key={p.id}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#2d1e18]/85 border border-white/10 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-[#c2957c]/30 cursor-pointer"
              >
                {/* Product Image */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2d1e18] via-[#2d1e18]/45 to-transparent group-hover:via-[#2d1e18]/55 transition-colors duration-300" />
                
                {/* Badge (if any) */}
                {p.badge && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="inline-block bg-[#c2957c]/90 backdrop-blur-sm text-[#2d1e18] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/10">
                      {p.badge}
                    </span>
                  </div>
                )}

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 z-10 text-left">
                  <span className="text-[10px] font-bold tracking-wider text-[#e5a193] uppercase">
                    {p.category}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-white mt-1 leading-tight group-hover:text-[#e5a193] transition-colors duration-300">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-[#fdfcf9]/95">
                      Rs. {p.price.toFixed(2)}
                    </span>
                    {p.rating && (
                      <span className="flex items-center text-xs text-[#e5a193] font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-0.5">
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                        </svg>
                        {p.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/70 line-clamp-2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    {p.description}
                  </p>
                  
                  <Link
                    href={`/menu/${p.id}`}
                    className="inline-flex items-center text-xs font-bold text-[#c2957c] hover:text-[#e5a193] transition-colors mt-3 w-fit"
                  >
                    <span>View Product</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="ml-1 w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SLIDE 3: Custom Cakes Showcase */}
        <div
          className={`transition-all duration-500 transform ${
            currentSlide === 2
              ? "opacity-100 translate-x-0 relative block"
              : "opacity-0 absolute pointer-events-none translate-x-4 hidden"
          } ${isTransitioning ? "opacity-0" : ""}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 text-left max-w-xl">
              <span className="inline-block rounded-full bg-[#faf5f0]/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-[#e5a193] uppercase backdrop-blur-sm border border-white/10">
                Tailored for Milestones
              </span>
              
              <h2 className="font-serif text-5xl font-bold tracking-tight text-white sm:text-6xl leading-tight">
                Custom Made
                <span className="block text-3xl sm:text-4xl font-sans font-light tracking-wide text-[#c2957c] mt-2">
                  Artisanal Cakes
                </span>
              </h2>
              
              <p className="text-base sm:text-lg leading-relaxed text-[#fdfcf9]/85">
                Your special moments deserve a custom masterpiece. We craft bespoke multi-tiered designs and custom flavor layers for weddings, birthdays, and corporate celebrations. Each flower is hand-pressed, and each layer is decorated to your specifications.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/menu?category=Custom"
                  className="w-full sm:w-auto rounded-full bg-[#c2957c] px-8 py-4 text-sm font-semibold tracking-wide text-[#2d1e18] shadow-lg transition-all hover:bg-[#e5a193] hover:text-white hover:scale-102 hover:shadow-xl text-center"
                >
                  Browse Custom Options
                </Link>
                <Link
                  href="/#catalog-section"
                  className="w-full sm:w-auto rounded-full border-2 border-white/80 bg-transparent px-8 py-4 text-sm font-semibold tracking-wide text-white transition-all hover:bg-white hover:text-[#2d1e18] hover:scale-102 text-center"
                >
                  View Catalog
                </Link>
              </div>
            </div>

            {/* Right Collage Arrangement */}
            <div className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] flex items-center justify-center">
              <div className="absolute w-[80%] aspect-square bg-[#c2957c]/5 rounded-full blur-3xl -z-10" />
              
              {/* Photo Collage Stack */}
              <div className="relative w-full h-full max-w-[450px]">
                {/* Photo 1 (Back left, tilted) */}
                {customCakes[0] && (
                  <div className="absolute top-[10%] left-0 w-[55%] aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-white/95 rotate-[-6deg] transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-20 group cursor-pointer">
                    <img
                      src={customCakes[0].image}
                      alt={customCakes[0].name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-[10px] font-bold text-white truncate w-full">{customCakes[0].name}</span>
                    </div>
                  </div>
                )}

                {/* Photo 2 (Top right, tilted) */}
                {customCakes[1] && (
                  <div className="absolute top-0 right-4 w-[48%] aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white/95 rotate-[6deg] transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-20 group cursor-pointer">
                    <img
                      src={customCakes[1].image}
                      alt={customCakes[1].name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-[10px] font-bold text-white truncate w-full">{customCakes[1].name}</span>
                    </div>
                  </div>
                )}

                {/* Photo 3 (Bottom center-right, overlapping) */}
                {customCakes[2] && (
                  <div className="absolute bottom-[8%] left-[25%] w-[50%] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white/95 rotate-[-2deg] transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-20 group cursor-pointer">
                    <img
                      src={customCakes[2].image}
                      alt={customCakes[2].name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-[10px] font-bold text-white truncate w-full">{customCakes[2].name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Indicators */}
        <div className="flex items-center justify-center space-x-3 mt-12 sm:mt-16">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => handleSlideChange(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx
                  ? "bg-[#c2957c] w-8"
                  : "bg-white/20 hover:bg-white/40 w-2.5"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
