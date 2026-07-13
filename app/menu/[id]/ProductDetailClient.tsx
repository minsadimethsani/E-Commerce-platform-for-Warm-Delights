"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, ProductVariant } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { addToCart } from "@/lib/cart";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AddOn } from "@/lib/addons";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  initialAddOns: AddOn[];
}

export default function ProductDetailClient({ product, relatedProducts, initialAddOns }: ProductDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );

  // Consolidated variant selection states
  const [selectedSize, setSelectedSize] = useState<string>(
    (product as any).defaultSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0].name : "500g")
  );
  const [selectedFlavor, setSelectedFlavor] = useState<string>(
    (product as any).defaultFlavor || (product.flavors && product.flavors.length > 0 ? (typeof product.flavors[0] === "string" ? product.flavors[0] : (product.flavors[0] as any).name) : "")
  );
  const [selectedIcing, setSelectedIcing] = useState<string>(
    (product as any).defaultIcing || (product.icings && product.icings.length > 0 ? (typeof product.icings[0] === "string" ? product.icings[0] : (product.icings[0] as any).name) : "")
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [showAllAddOns, setShowAllAddOns] = useState<boolean>(false);

  // Default Variation Values
  const defaultSizeVal = (product as any).defaultSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0].name : "500g");
  const defaultFlavorVal = (product as any).defaultFlavor || (product.flavors && product.flavors.length > 0 ? (typeof product.flavors[0] === "string" ? product.flavors[0] : (product.flavors[0] as any).name) : "");
  const defaultIcingVal = (product as any).defaultIcing || (product.icings && product.icings.length > 0 ? (typeof product.icings[0] === "string" ? product.icings[0] : (product.icings[0] as any).name) : "");
  const defaultVariantVal = product.variants && product.variants.length > 0 ? product.variants[0] : undefined;

  // Filtered Options (Excluding defaults)
  const availableSizes = product.sizes ? product.sizes.filter((s) => s.name !== defaultSizeVal) : [];
  const availableFlavors = product.flavors ? product.flavors.filter((f) => (typeof f === "string" ? f : f.name) !== defaultFlavorVal) : [];
  const availableIcings = product.icings ? product.icings.filter((ic) => (typeof ic === "string" ? ic : ic.name) !== defaultIcingVal) : [];
  const availableVariants = product.variants ? product.variants.filter((v) => v.name !== defaultVariantVal?.name) : [];

  const hasCustomizerOptions = availableSizes.length > 0 || availableFlavors.length > 0 || availableIcings.length > 0 || availableVariants.length > 0;

  // Dynamic Pricing Engine
  const basePrice = selectedVariant ? selectedVariant.price : product.price;

  // Selected Premiums
  const selectedSizeObj = product.sizes?.find((s) => s.name === selectedSize);
  const sizePremiumSelected = selectedSizeObj
    ? (selectedSizeObj.priceMultiplier 
        ? basePrice * (selectedSizeObj.priceMultiplier - 1) 
        : selectedSizeObj.price)
    : 0;

  const selectedFlavorObj = product.flavors?.find((f) => (typeof f === "string" ? f : f.name) === selectedFlavor);
  const flavorPremiumSelected = selectedFlavorObj && typeof selectedFlavorObj !== "string"
    ? selectedFlavorObj.price
    : 0;

  const selectedIcingObj = product.icings?.find((ic) => (typeof ic === "string" ? ic : ic.name) === selectedIcing);
  const icingPremiumSelected = selectedIcingObj && typeof selectedIcingObj !== "string"
    ? selectedIcingObj.price
    : 0;

  // Default Premiums
  const defaultSizeObj = product.sizes?.find((s) => s.name === defaultSizeVal);
  const sizePremiumDefault = defaultSizeObj
    ? (defaultSizeObj.priceMultiplier 
        ? basePrice * (defaultSizeObj.priceMultiplier - 1) 
        : defaultSizeObj.price)
    : 0;

  const defaultFlavorObj = product.flavors?.find((f) => (typeof f === "string" ? f : f.name) === defaultFlavorVal);
  const flavorPremiumDefault = defaultFlavorObj && typeof defaultFlavorObj !== "string"
    ? defaultFlavorObj.price
    : 0;

  const defaultIcingObj = product.icings?.find((ic) => (typeof ic === "string" ? ic : ic.name) === defaultIcingVal);
  const icingPremiumDefault = defaultIcingObj && typeof defaultIcingObj !== "string"
    ? defaultIcingObj.price
    : 0;

  const addOnsFee = selectedAddOns.reduce((sum, addOnName) => {
    const matched = initialAddOns.find((a) => a.name === addOnName);
    return sum + (matched ? matched.fee : 0);
  }, 0);

  const finalPrice = basePrice + 
                     (sizePremiumSelected - sizePremiumDefault) + 
                     (flavorPremiumSelected - flavorPremiumDefault) + 
                     (icingPremiumSelected - icingPremiumDefault) + 
                     addOnsFee;

  const incrementQty = () => setQuantity((prev) => (prev < 20 ? prev + 1 : prev));
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : prev));

  const handleAddToCart = () => {
    addToCart(
      product,
      quantity,
      selectedVariant,
      selectedSize,
      selectedFlavor,
      selectedIcing,
      selectedAddOns,
      finalPrice
    );
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
    addToCart(
      product,
      quantity,
      selectedVariant,
      selectedSize,
      selectedFlavor,
      selectedIcing,
      selectedAddOns,
      finalPrice
    );
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
          <div className="relative aspect-square w-full overflow-hidden rounded-none bg-[#EFEFEA] border border-[#2A1E17]/5 shadow-sm">
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
                <span className="inline-block rounded-none bg-[#C5A880] px-3.5 py-1.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                  {product.badge}
                </span>
              </div>
            )}
          </div>

          {/* Right: Info Column */}
          <div className="space-y-8">
            
            {/* Header info */}
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-[#EFEFEA] border border-[#2A1E17]/5 rounded-none text-xs font-bold uppercase tracking-wider text-[#C5A880]">
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
                Rs. {finalPrice.toFixed(2)}
              </div>
            </div>

            {/* Quick Description */}
            <p className="text-sm sm:text-base text-[#3A2E2B]/85 leading-relaxed font-sans">
              {product.description}
            </p>

            {/* Default Product Details (Standard Recipe / Config) */}
            {(((product.defaultSize || (product.sizes && product.sizes.length > 0)) ||
              (product.defaultFlavor || (product.flavors && product.flavors.length > 0)) ||
              (product.defaultIcing || (product.icings && product.icings.length > 0)) ||
              (product.variants && product.variants.length > 0)) && (
              <div className="bg-[#EFEFEA]/60 border border-[#2A1E17]/5 rounded-none p-5 space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#2A1E17] flex items-center">
                  <span className="inline-block border border-[#2A1E17]/10 bg-white px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-sans mr-2">Recipe</span> Standard Configuration (Included in Base Price)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Default Size */}
                  {((product.sizes && product.sizes.length > 0) || product.defaultSize) && (
                    <div className="bg-white p-3 rounded-none border border-[#2A1E17]/5">
                      <span className="block text-[8px] font-bold uppercase text-[#3A2E2B]/50">Size / Weight</span>
                      <span className="font-bold text-[#2A1E17] text-xs mt-0.5 block">
                        {product.defaultSize || (product.sizes && product.sizes[0]?.name) || "Standard"}
                      </span>
                    </div>
                  )}
                  {/* Default Flavor */}
                  {((product.flavors && product.flavors.length > 0) || product.defaultFlavor) && (
                    <div className="bg-white p-3 rounded-none border border-[#2A1E17]/5">
                      <span className="block text-[8px] font-bold uppercase text-[#3A2E2B]/50">Flavor</span>
                      <span className="font-bold text-[#2A1E17] text-xs mt-0.5 block">
                        {product.defaultFlavor || (product.flavors && (typeof product.flavors[0] === "string" ? product.flavors[0] : (product.flavors[0] as any).name)) || "Standard"}
                      </span>
                    </div>
                  )}
                  {/* Default Coating / Icing */}
                  {((product.icings && product.icings.length > 0) || product.defaultIcing) && (
                    <div className="bg-white p-3 rounded-none border border-[#2A1E17]/5">
                      <span className="block text-[8px] font-bold uppercase text-[#3A2E2B]/50">Coating / Icing</span>
                      <span className="font-bold text-[#2A1E17] text-xs mt-0.5 block">
                        {product.defaultIcing || (product.icings && (typeof product.icings[0] === "string" ? product.icings[0] : (product.icings[0] as any).name)) || "Standard"}
                      </span>
                    </div>
                  )}
                  {/* Fallback Default Variant */}
                  {(!product.sizes || product.sizes.length === 0) &&
                    (!product.flavors || product.flavors.length === 0) &&
                    (!product.icings || product.icings.length === 0) &&
                    product.variants && product.variants.length > 0 && (
                      <div className="bg-white p-3 rounded-none border border-[#2A1E17]/5 sm:col-span-3">
                        <span className="block text-[8px] font-bold uppercase text-[#3A2E2B]/50">Default Option</span>
                        <span className="font-bold text-[#2A1E17] text-xs mt-0.5 block">
                          {product.variants[0].name} (Rs. {product.variants[0].price.toFixed(2)})
                        </span>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* Multi-layered Variant Customizer */}
            {((availableSizes.length > 0) || 
              (availableFlavors.length > 0) || 
              (availableIcings.length > 0) ||
              (availableVariants.length > 0)) && (
              <div className="space-y-6 pt-6 border-t border-[#2A1E17]/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A1E17] flex items-center">
                    <span className="inline-block border border-[#2A1E17]/10 bg-white px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-sans mr-2">Options</span> Customize Options / Variations
                  </h3>
                  <span className="text-[9px] text-[#3A2E2B]/60 italic font-medium">* Selection updates pricing</span>
                </div>

                {((availableSizes.length > 0) || 
                  (availableFlavors.length > 0) || 
                  (availableIcings.length > 0)) ? (
                  <div className="space-y-6">
                    {/* 1. Sizes (Capsule Button Chips) */}
                    {availableSizes.length > 0 && (
                      <div className="space-y-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
                          Select Size / Weight *
                        </span>
                        <div className="flex flex-wrap gap-3">
                          {availableSizes.map((s) => {
                            const isSelected = selectedSize === s.name;
                            const premium = s.priceMultiplier 
                              ? basePrice * (s.priceMultiplier - 1) 
                              : s.price;
                            return (
                              <button
                                key={s.name}
                                type="button"
                                onClick={() => setSelectedSize(selectedSize === s.name ? defaultSizeVal : s.name)}
                                className={`px-4 py-2.5 rounded-none border text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#2A1E17] text-white border-[#2A1E17] shadow-sm"
                                    : "bg-white text-[#2A1E17] border-[#2A1E17]/10 hover:border-[#C5A880]"
                                }`}
                              >
                                <span>{s.name}</span>
                                {premium !== 0 && (
                                  <span className={`ml-1 text-[9px] font-semibold ${isSelected ? "text-[#C5A880]" : "text-[#3A2E2B]/60"}`}>
                                    ({premium > 0 ? "+" : "-"}Rs. {Math.abs(premium).toFixed(0)})
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. Flavors (Radio Grid/Tile Selectors) */}
                    {availableFlavors.length > 0 && (
                      <div className="space-y-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
                          Select Flavor *
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {availableFlavors.map((f, idx) => {
                            const fName = typeof f === "string" ? f : f.name;
                            const fPrice = typeof f === "string" ? 0 : f.price;
                            const isSelected = selectedFlavor === fName;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedFlavor(selectedFlavor === fName ? defaultFlavorVal : fName)}
                                className={`p-3 rounded-none border text-xs font-semibold text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#2A1E17] text-white border-[#2A1E17] shadow-sm ring-2 ring-[#C5A880]/30"
                                    : "bg-white text-[#2A1E17] border-[#2A1E17]/10 hover:border-[#C5A880]"
                                }`}
                              >
                                <span>{fName}</span>
                                {fPrice !== 0 && (
                                  <span className={`block text-[9px] font-semibold mt-0.5 ${isSelected ? "text-[#C5A880]" : "text-[#3A2E2B]/60"}`}>
                                    ({fPrice > 0 ? "+" : "-"}Rs. {Math.abs(fPrice).toFixed(0)})
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3. Icings (Radio Grid/Tile Selectors) */}
                    {availableIcings.length > 0 && (
                      <div className="space-y-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
                          Select Coating / Icing *
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {availableIcings.map((ic, idx) => {
                            const icName = typeof ic === "string" ? ic : ic.name;
                            const icPrice = typeof ic === "string" ? 0 : ic.price;
                            const isSelected = selectedIcing === icName;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedIcing(selectedIcing === icName ? defaultIcingVal : icName)}
                                className={`p-3 rounded-none border text-xs font-semibold text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#2A1E17] text-white border-[#2A1E17] shadow-sm ring-2 ring-[#C5A880]/30"
                                    : "bg-white text-[#2A1E17] border-[#2A1E17]/10 hover:border-[#C5A880]"
                                }`}
                              >
                                <span>{icName}</span>
                                {icPrice !== 0 && (
                                  <span className={`block text-[9px] font-semibold mt-0.5 ${isSelected ? "text-[#C5A880]" : "text-[#3A2E2B]/60"}`}>
                                    ({icPrice > 0 ? "+" : "-"}Rs. {Math.abs(icPrice).toFixed(0)})
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 4. Add-Ons / Modifiers */}
                    <div className="space-y-3 pt-3 border-t border-[#2A1E17]/5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
                        Optional Add-Ons
                      </span>
                      <div className="flex flex-col space-y-2">
                        {(showAllAddOns ? initialAddOns : initialAddOns.slice(0, 3)).map((addon) => {
                          const isSelected = selectedAddOns.includes(addon.name);
                          return (
                            <label
                              key={addon.id}
                              className={`flex items-center justify-between p-3 rounded-none border text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#C5A880]/10 border-[#C5A880] text-[#2A1E17]"
                                  : "bg-white text-[#2A1E17]/70 border-[#2A1E17]/5 hover:border-[#C5A880]/40"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAddOns((prev) => [...prev, addon.name]);
                                    } else {
                                      setSelectedAddOns((prev) => prev.filter((a) => a !== addon.name));
                                    }
                                  }}
                                  className="rounded border-[#2A1E17]/20 text-[#C5A880] focus:ring-[#C5A880] h-4 w-4 cursor-pointer accent-[#C5A880]"
                                />
                                <div>
                                  <span className="font-bold block text-[#2A1E17]">{addon.name}</span>
                                  <span className="text-[10px] text-[#3A2E2B]/60 font-medium">{addon.desc}</span>
                                </div>
                              </div>
                              <span className="font-bold text-[#2A1E17]">Rs. {addon.fee.toFixed(2)}</span>
                            </label>
                          );
                        })}
                      </div>

                      {initialAddOns.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setShowAllAddOns(!showAllAddOns)}
                          className="inline-flex items-center text-xs font-bold text-[#C5A880] hover:text-[#2A1E17] transition-colors mt-2 focus:outline-none cursor-pointer"
                        >
                          <span>{showAllAddOns ? "See less options" : "See more options"}</span>
                          <svg
                            className={`ml-1.5 h-3.5 w-3.5 transform transition-transform ${showAllAddOns ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="square" strokeLinejoin="miter" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Fallback Variant Selector */
                  availableVariants.length > 0 && (
                    <div className="space-y-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
                        Select Option / Weight:
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {availableVariants.map((v, idx) => {
                          const isSelected = selectedVariant?.name === v.name;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedVariant(selectedVariant?.name === v.name ? defaultVariantVal : v)}
                              className={`px-4 py-2.5 rounded-none border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
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
                  )
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2 pt-6 border-t border-[#2A1E17]/5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
                Quantity:
              </span>
              <div className="flex items-center justify-between bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-none px-2 py-1 w-32">
                <button
                  onClick={decrementQty}
                  disabled={quantity === 1}
                  aria-label="Decrease quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-none text-[#2A1E17] hover:bg-[#2A1E17]/5 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M19.5 12h-15" />
                  </svg>
                </button>
                <span className="font-semibold text-sm text-[#2A1E17] min-w-5 text-center select-none">
                  {quantity}
                </span>
                <button
                  onClick={incrementQty}
                  disabled={quantity === 20}
                  aria-label="Increase quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-none text-[#2A1E17] hover:bg-[#2A1E17]/5 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch pt-4">
              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 rounded-none py-3 px-8 text-xs font-bold uppercase tracking-wider text-center transition-all duration-300 cursor-pointer shadow-xs ${
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
                className="flex-1 rounded-none py-3 px-8 text-xs font-bold uppercase tracking-wider text-center transition-all duration-300 cursor-pointer shadow-xs bg-[#C5A880] text-[#2A1E17] hover:bg-[#2A1E17] hover:text-white"
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
                <path strokeLinecap="square" strokeLinejoin="miter" d="M9 5l7 7-7 7" />
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
