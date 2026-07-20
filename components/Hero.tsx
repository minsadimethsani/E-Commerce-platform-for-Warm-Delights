"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Product, products as localProducts } from "@/data/products";

// Slide configurations
const SLIDE_2_CONFIG = {
  tagline: "Seasonal Collections & Fresh Batches",
  headline: "The Seasonal Collection",
  subheadline: "Indulge in our limited-edition fresh fruit pastries and signature treats. Crafted with 100% natural ingredients.",
  ctaText: "View Seasonal Specials",
  targetRoute: "/menu?category=seasonal"
};

export default function Hero({ products = [] }: { products?: Product[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSlideChange = useCallback((index: number) => {
    if (index === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 300); // match fade duration
  }, [currentSlide]);

  // Auto-play slide transition timer (5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      handleSlideChange((currentSlide + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, handleSlideChange]);






  // Safe fallback list of products
  const activeProducts = (products.length > 0 ? products : localProducts).filter((p) => p.isAvailable !== false);

  // Slide 1: Find first available product with a valid image
  const availableProduct =
    activeProducts.find((p) => p.isAvailable !== false && p.image) || activeProducts[0];

  // Slide 2: Seasonal products (only show products with the badge "seasonal")
  const slide2SeasonalProducts = activeProducts
    .filter((p) => p.isAvailable !== false && p.image && p.badge?.toLowerCase() === "seasonal")
    .slice(0, 4);

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
    <div className="relative min-h-[calc(100vh-80px)] w-full flex items-center justify-center overflow-hidden bg-[#A47251] py-8 sm:py-10">
      {/* Background Image for Slide 1 */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          currentSlide === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
        } ${currentSlide === 0 ? "animate-hero-bg" : ""}`}
        style={{
          backgroundImage: "url('/hero_slide_1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Background Vignette */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-[#A47251]/95 via-[#2A1E17]/45 to-[#A47251] transition-opacity duration-700 ${currentSlide === 0 ? "opacity-20" : "opacity-100"
          }`}
      />

      {/* Slide Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SLIDE 1: Brand & Available Product */}
        <div
          className={`transition-all duration-500 transform min-h-[560px] md:min-h-[480px] lg:min-h-[440px] flex flex-col justify-end pb-6 md:pb-8 ${currentSlide === 0
            ? "opacity-100 translate-x-0 relative flex"
            : "opacity-0 absolute pointer-events-none translate-x-4 hidden"
            } ${isTransitioning ? "opacity-0" : ""}`}
        >
          {/* Brand Signage Overlay - Top Middle */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-center pointer-events-none select-none w-full max-w-lg">
            <div className={currentSlide === 0 ? "animate-hero-content-brand" : ""}>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wide text-[#DD9E59] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                Warm Delights
              </h2>
              <p className="text-[8px] sm:text-[10px] font-sans tracking-[0.25em] uppercase text-[#F0D8A1] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] mt-1 sm:mt-1.5">
                Bespoke Cakes & Events
              </p>
            </div>
          </div>

          <div className="space-y-6 text-center mx-auto max-w-2xl mt-28 sm:mt-36 lg:mt-32">
            <h1 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight sm:whitespace-nowrap ${currentSlide === 0 ? "animate-hero-content-1" : ""}`}>
              Artisanal Pastries & Signature Cakes
            </h1>

            <p className={`text-xs sm:text-sm md:text-base leading-relaxed text-[#FDF9F0]/85 max-w-xl mx-auto ${currentSlide === 0 ? "animate-hero-content-2" : ""}`}>
              From rustic, decadent signature cakes for your special milestones to warm, flaky, golden-brown savory pastries. Baked fresh daily with love and local premium ingredients.
            </p>

            <div className={`pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 ${currentSlide === 0 ? "animate-hero-content-3" : ""}`}>
              <Link
                href="/menu"
                className="w-full sm:w-auto rounded-none bg-[#DD9E59] px-8 py-4 text-sm font-semibold tracking-wide text-[#2A1E17] shadow-lg transition-all hover:bg-[#F0D8A1] hover:text-white hover:scale-102 hover:shadow-xl text-center"
              >
                Order Online
              </Link>
              <a
                href="#catalog-section"
                className="w-full sm:w-auto rounded-none border-2 border-white/80 bg-transparent px-8 py-4 text-sm font-semibold tracking-wide text-white transition-all hover:bg-white hover:text-[#2A1E17] hover:scale-102 text-center"
              >
                Explore Menu
              </a>
            </div>
          </div>
        </div>


        {/* SLIDE 2: Seasonal Collections & Fresh Batches */}
        <div
          className={`transition-all duration-500 transform min-h-[560px] md:min-h-[480px] lg:min-h-[440px] flex flex-col justify-center ${currentSlide === 1
            ? "opacity-100 translate-x-0 relative flex"
            : "opacity-0 absolute pointer-events-none translate-x-4 hidden"
            } ${isTransitioning ? "opacity-0" : ""}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Product Grid Column */}
            <div className={`w-full lg:col-span-7 ${currentSlide === 1 ? "animate-slide2-grid" : ""}`}>
              <div className="grid grid-cols-2 gap-4 h-auto">
                {slide2SeasonalProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/menu/${p.id}`}
                    className="group relative flex flex-col justify-end text-left h-[150px] sm:h-[180px] md:h-[200px] lg:h-[190px] overflow-hidden rounded-none border border-white/10 shadow-lg cursor-pointer bg-[#A47251]"
                  >
                    {/* Product Image */}
                    <img
                      src={p.image}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Subtle Hover Overlay & Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300 opacity-80 group-hover:opacity-90" />

                    {/* Product Information Overlay */}
                    <div className="relative z-10 p-3 sm:p-5 flex flex-col gap-1 w-full translate-y-0 md:translate-y-3 md:group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-[9px] uppercase tracking-widest font-semibold text-[#F0D8A1]">
                        {p.category}
                      </span>
                      <h3 className="font-serif text-sm sm:text-base font-bold text-white leading-snug truncate">
                        {p.name}
                      </h3>
                      <div className="flex items-center justify-between mt-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-75">
                        <span className="text-xs font-semibold text-[#DD9E59]">
                          Rs. {typeof p.price === 'number' ? p.price.toFixed(2) : p.price}
                        </span>
                        <span className="text-[9px] font-semibold text-white/90 flex items-center gap-0.5">
                          Order Now
                          <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Content Column */}
            <div className="space-y-6 text-left max-w-xl lg:col-span-5">
              <span className={`inline-block rounded-none bg-[#F0D8A1]/10 px-3 py-1 text-[10px] sm:text-xs font-semibold tracking-widest text-[#F0D8A1] uppercase backdrop-blur-sm border border-white/10 ${currentSlide === 1 ? "animate-slide2-tagline" : ""}`}>
                {SLIDE_2_CONFIG.tagline}
              </span>

              <h2 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight ${currentSlide === 1 ? "animate-slide2-headline" : ""}`}>
                {SLIDE_2_CONFIG.headline}
              </h2>

              <p className={`text-xs sm:text-sm md:text-base leading-relaxed text-[#FDF9F0]/85 ${currentSlide === 1 ? "animate-slide2-desc" : ""}`}>
                {SLIDE_2_CONFIG.subheadline}
              </p>

              <div className={`pt-2 ${currentSlide === 1 ? "animate-slide2-cta" : ""}`}>
                <Link
                  href={SLIDE_2_CONFIG.targetRoute}
                  className="inline-block w-full sm:w-auto rounded-none bg-[#DD9E59] px-8 py-4 text-sm font-semibold tracking-wide text-[#2A1E17] shadow-lg transition-all hover:bg-[#F0D8A1] hover:text-white hover:scale-102 hover:shadow-xl text-center font-bold"
                >
                  {SLIDE_2_CONFIG.ctaText}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 3: Custom Cakes Showcase */}
        <div
          className={`transition-all duration-500 transform min-h-[480px] md:min-h-[420px] lg:min-h-[360px] flex flex-col justify-center ${currentSlide === 2
            ? "opacity-100 translate-x-0 relative flex"
            : "opacity-0 absolute pointer-events-none translate-x-4 hidden"
            } ${isTransitioning ? "opacity-0" : ""}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 text-left max-w-xl">
              <span className={`inline-block rounded-none bg-[#F0D8A1]/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-[#F0D8A1] uppercase backdrop-blur-sm border border-white/10 ${currentSlide === 2 ? "animate-slide3-tagline" : ""}`}>
                Our Custom creations
              </span>

              <h2 className={`font-serif text-5xl font-bold tracking-tight text-white sm:text-6xl leading-tight ${currentSlide === 2 ? "animate-slide3-headline" : ""}`}>
                Looking for the perfect custom cake ?
              </h2>

              <p className={`text-xs sm:text-sm md:text-base leading-relaxed text-[#FDF9F0]/85 ${currentSlide === 2 ? "animate-slide3-desc" : ""}`}>
                From birthdays to baby showers, anniversaries, or any special moment, we create cakes that make your day sweeter!
              </p>

              <div className={`pt-4 flex flex-col sm:flex-row items-center gap-4 ${currentSlide === 2 ? "animate-slide3-cta" : ""}`}>
                <Link
                  href="/menu?category=Custom"
                  className="w-full sm:w-auto rounded-none bg-[#DD9E59] px-8 py-4 text-sm font-semibold tracking-wide text-[#2A1E17] shadow-lg transition-all hover:bg-[#F0D8A1] hover:text-white hover:scale-102 hover:shadow-xl text-center"
                >
                  Browse Custom Options
                </Link>
                <Link
                  href="/#catalog-section"
                  className="w-full sm:w-auto rounded-none border-2 border-white/80 bg-transparent px-8 py-4 text-sm font-semibold tracking-wide text-white transition-all hover:bg-white hover:text-[#2A1E17] hover:scale-102 text-center"
                >
                  View Catalog
                </Link>
              </div>
            </div>

            {/* Right Collage Arrangement */}
            <div className="relative w-full h-[280px] sm:h-[320px] md:h-[300px] lg:h-[320px] flex items-center justify-center">
              <div className="absolute w-[80%] aspect-square bg-[#DD9E59]/5 rounded-full blur-3xl -z-10" />

              {/* Photo Collage Stack */}
              <div className={`relative w-full h-full max-w-[450px] ${currentSlide === 2 ? "animate-slide3-collage" : ""}`}>
                {/* Photo 1 (Back left, tilted) */}
                {customCakes[0] && (
                  <div className="absolute top-[10%] left-0 w-[52%] lg:w-[55%] aspect-square rounded-none overflow-hidden shadow-lg border-4 border-white/95 rotate-[-4deg] lg:rotate-[-6deg] transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-20 group cursor-pointer">
                    <img
                      src={customCakes[0].image}
                      alt={customCakes[0].name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-[10px] font-bold text-white truncate w-full">{customCakes[0].name}</span>
                    </div>
                  </div>
                )}

                {/* Photo 2 (Top right, tilted) */}
                {customCakes[1] && (
                  <div className="absolute top-0 right-4 w-[45%] lg:w-[48%] aspect-square rounded-none overflow-hidden shadow-xl border-4 border-white/95 rotate-[4deg] lg:rotate-[6deg] transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-20 group cursor-pointer">
                    <img
                      src={customCakes[1].image}
                      alt={customCakes[1].name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-[10px] font-bold text-white truncate w-full">{customCakes[1].name}</span>
                    </div>
                  </div>
                )}

                {/* Photo 3 (Bottom center-right, overlapping) */}
                {customCakes[2] && (
                  <div className="absolute bottom-[8%] left-[20%] lg:left-[25%] w-[48%] lg:w-[50%] aspect-square rounded-none overflow-hidden shadow-2xl border-4 border-white/95 rotate-[-2deg] transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-20 group cursor-pointer">
                    <img
                      src={customCakes[2].image}
                      alt={customCakes[2].name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <span className="text-[10px] font-bold text-white truncate w-full">{customCakes[2].name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Indicators */}
        <div className="flex items-center justify-center space-x-3 mt-8 sm:mt-10">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => handleSlideChange(idx)}
              className={`h-2.5 rounded-none transition-all duration-300 cursor-pointer ${currentSlide === idx
                ? "bg-[#DD9E59] w-8"
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
