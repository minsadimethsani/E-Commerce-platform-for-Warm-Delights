"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

type TabType = "details" | "ingredients" | "storage";

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const incrementQty = () => setQuantity((prev) => (prev < 20 ? prev + 1 : prev));
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : prev));

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
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

  // Get content based on category
  const getTabContent = () => {
    switch (activeTab) {
      case "details":
        return (
          <div className="space-y-4 text-sm text-[#55433c]/85 leading-relaxed font-sans">
            <p>{product.description}</p>
            <p>
              Every batch is crafted by hand in our bakery workspace using traditional slow-fermentation or whipping techniques. We ensure each item meets our strict standards of flavor profile and texture.
            </p>
          </div>
        );
      case "ingredients":
        let ingredients = "";
        let allergy = "Gluten, Dairy, Eggs";
        if (product.category === "Cake") {
          ingredients = "Organic unbleached cake flour, pasture-raised egg yolks, organic cane sugar, pure grass-fed butter, fresh whipping cream, natural vanilla paste, sea salt, premium baking powder.";
        } else if (product.category === "Savory") {
          ingredients = "Premium stone-ground wheat flour, whole milk, Greek feta / cheddar cheeses, fresh organic spinach / vegetables, pasture-raised eggs, unsalted butter, nutmeg, sea salt, white pepper.";
        } else if (product.category === "Pastry") {
          ingredients = "French style unbleached pastry flour, premium grass-fed butter (82% fat) for lamination, fresh whole milk, yeast, organic sugar, water, organic sea salt.";
        } else if (product.category === "Cookie") {
          ingredients = "Organic pastry flour, dark / semi-sweet chocolate chunks, organic light brown sugar, grass-fed butter, pasture-raised eggs, Madagascar vanilla extract, baking soda, sea salt flakes.";
          allergy = "Gluten, Dairy, Eggs, may contain traces of nuts.";
        } else {
          ingredients = "Handpicked premium organic ingredients including local stone-ground flour, pasture-raised eggs, pure butter, cane sugar, and natural extracts.";
        }
        return (
          <div className="space-y-4 text-sm text-[#55433c]/85 leading-relaxed font-sans">
            <div>
              <strong className="text-[#2d1e18] block mb-1">Key Ingredients:</strong>
              <p>{ingredients}</p>
            </div>
            <div>
              <strong className="text-[#2d1e18] block mb-1">Allergy Warnings:</strong>
              <p>Contains: <span className="font-semibold text-rose-600">{allergy}</span>. Handled in a facility that also processes wheat, tree nuts, and peanuts.</p>
            </div>
          </div>
        );
      case "storage":
        let storage = "";
        if (product.category === "Cake") {
          storage = "Keep refrigerated in an airtight cake container. Serve slightly chilled or let rest at room temperature for 15 minutes before serving for optimal cream texture. Best consumed within 3-4 days.";
        } else if (product.category === "Savory") {
          storage = "Store refrigerated. To serve, reheat in a preheated oven at 180°C (350°F) for 5-8 minutes to restore the crispy, flaky crust. Avoid microwave reheating to prevent sogginess.";
        } else if (product.category === "Pastry") {
          storage = "Best enjoyed fresh on the day of baking. If saving for later, store in a paper bag or airtight container at room temperature. Toast in the oven at 170°C for 2-3 minutes for maximum crispness.";
        } else if (product.category === "Cookie") {
          storage = "Store at room temperature in an airtight jar or container. Stays fresh for up to 7 days. For that warm out-of-the-oven feel, pop in a toaster oven for 60 seconds!";
        } else {
          storage = "Keep stored in a cool, dry place or in the refrigerator based on frosting needs. Bring to room temperature 1 hour before serving. Consume within 3 days.";
        }
        return (
          <div className="space-y-4 text-sm text-[#55433c]/85 leading-relaxed font-sans">
            <div>
              <strong className="text-[#2d1e18] block mb-1">Storage Guide:</strong>
              <p>{storage}</p>
            </div>
            <div>
              <strong className="text-[#2d1e18] block mb-1">Shipping Note:</strong>
              <p>We pack all treats in protective, insulated biodegradable boxes. Same-day local delivery is recommended to preserve optimal freshness.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#fdfcf9] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#55433c]/60">
            <li>
              <Link href="/" className="hover:text-[#c2957c] transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="h-3 w-3 text-[#55433c]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/menu" className="hover:text-[#c2957c] transition-colors">
                Menu
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="h-3 w-3 text-[#55433c]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[#2d1e18] truncate max-w-[150px] sm:max-w-none">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Product Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start mb-24">
          
          {/* Left: Product Image Box */}
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[#faf5f0] border border-[#2d1e18]/5 shadow-sm">
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
                <span className="inline-block rounded-md bg-[#e5a193] px-3.5 py-1.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                  {product.badge}
                </span>
              </div>
            )}
          </div>

          {/* Right: Info Column */}
          <div className="space-y-8">
            
            {/* Header info */}
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-[#faf5f0] border border-[#2d1e18]/5 rounded-full text-xs font-bold uppercase tracking-wider text-[#c2957c]">
                {product.category}
              </span>
              
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2d1e18] leading-tight">
                {product.name}
              </h1>

              {/* Rating stars & review count */}
              <div className="flex items-center space-x-2 pt-1">
                <div className="flex items-center">{renderStars(product.rating)}</div>
                <span className="text-xs font-bold text-[#2d1e18]/70">
                  {product.rating.toFixed(1)} Rating
                </span>
                <span className="text-xs text-[#55433c]/40 font-semibold">•</span>
                <span className="text-xs font-semibold text-[#55433c]/60">
                  {product.reviewsCount} customer reviews
                </span>
              </div>

              {/* Price display */}
              <div className="text-3xl font-serif font-bold text-[#2d1e18] pt-2">
                ${product.price.toFixed(2)}
              </div>
            </div>

            {/* Quick Description */}
            <p className="text-sm sm:text-base text-[#55433c]/85 leading-relaxed font-sans">
              {product.description}
            </p>

            {/* Add To Cart Controls Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center pt-6 border-t border-[#2d1e18]/5">
              
              {/* Qty Selector */}
              <div className="flex items-center justify-between bg-[#faf5f0] border border-[#2d1e18]/10 rounded-full px-2 py-1 sm:w-32">
                <button
                  onClick={decrementQty}
                  disabled={quantity === 1}
                  aria-label="Decrease quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#2d1e18] hover:bg-[#2d1e18]/5 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>
                <span className="font-semibold text-sm text-[#2d1e18] min-w-5 text-center select-none">
                  {quantity}
                </span>
                <button
                  onClick={incrementQty}
                  disabled={quantity === 20}
                  aria-label="Increase quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#2d1e18] hover:bg-[#2d1e18]/5 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>

              {/* Add CTA */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 rounded-full py-3 px-8 text-xs font-bold uppercase tracking-wider text-center transition-all duration-300 cursor-pointer shadow-xs ${
                  isAdded
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-[#2d1e18] text-white hover:bg-[#c2957c] hover:text-[#2d1e18]"
                }`}
              >
                {isAdded ? "Added to Cart ✓" : "Add to Cart"}
              </button>
            </div>

            {/* Checklist of Quality Specs */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#2d1e18]/5 text-xs text-[#55433c]/80 font-bold uppercase tracking-wide">
              <div className="flex items-center space-x-2">
                <span className="text-base text-[#c2957c]">🌾</span>
                <span>Baked Fresh Daily</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base text-[#c2957c]">🌱</span>
                <span>Organic Ingredients</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base text-[#c2957c]">🥚</span>
                <span>Pasture-Raised Eggs</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base text-[#c2957c]">🧈</span>
                <span>Real Grass-Fed Butter</span>
              </div>
            </div>

            {/* Tabbed Info Block */}
            <div className="pt-8 border-t border-[#2d1e18]/5">
              
              {/* Tab Header Buttons */}
              <div className="flex border-b border-[#2d1e18]/10 pb-2 space-x-6">
                {(["details", "ingredients", "storage"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
                      activeTab === tab
                        ? "border-[#c2957c] text-[#2d1e18]"
                        : "border-transparent text-[#55433c]/60 hover:text-[#2d1e18]"
                    }`}
                  >
                    {tab === "details" ? "Description" : tab === "ingredients" ? "Ingredients" : "Care & Storage"}
                  </button>
                ))}
              </div>

              {/* Tab Panel Body */}
              <div className="pt-4 min-h-36">
                {getTabContent()}
              </div>

            </div>

          </div>
        </div>

        {/* Recommendations / Related Products */}
        <section className="border-t border-[#2d1e18]/10 pt-16 mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#c2957c]">
                Recommendations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2d1e18]">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/menu"
              className="mt-4 md:mt-0 text-xs font-bold uppercase tracking-wider text-[#2d1e18] hover:text-[#c2957c] flex items-center transition-colors cursor-pointer"
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
