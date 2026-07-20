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
import { addReview, deleteReview } from "@/lib/reviews";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  initialAddOns: AddOn[];
  initialReviews: any[];
}

export default function ProductDetailClient({ product, relatedProducts, initialAddOns, initialReviews }: ProductDetailClientProps) {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Media Gallery List (Images & Video/Reel)
  const mediaList = [
    ...((product as any).images || [product.image]).map((img: string) => ({ type: "image" as const, url: img })),
    ...(product.videoUrl && product.videoUrl.trim() !== "" ? [{ type: "video" as const, url: product.videoUrl }] : []),
  ];
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }
    setDeletingId(id);
    try {
      const success = await deleteReview(id);
      if (success) {
        setReviews(reviews.filter((r) => r.id !== id));
      } else {
        alert("Failed to delete the review. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("An unexpected error occurred.");
    } finally {
      setDeletingId(null);
    }
  };


  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!comment.trim()) {
      setSubmitError("Please write a comment.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const newReview = await addReview({
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || user.email || "Anonymous",
        rating,
        comment,
      });
      setReviews([newReview, ...reviews]);
      setComment("");
      setRating(5);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to submit review:", err);
      setSubmitError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/menu" className="hover:text-[#DD9E59] transition-colors">
                Menu
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="h-3 w-3 text-[#2A1E17]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[#2A1E17] truncate max-w-[150px] sm:max-w-none">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Product Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start mb-8">
          
          {/* Left: Product Image & Video Gallery Box */}
          <div className="space-y-4">
            {/* Enlarged Media Container */}
            <div className="relative aspect-square w-full overflow-hidden rounded-none bg-[#F0D8A1] border border-[#A47251]/5 shadow-sm flex items-center justify-center">
              {mediaList[activeMediaIndex]?.type === "video" ? (
                <video
                  src={mediaList[activeMediaIndex].url}
                  controls
                  autoPlay
                  muted
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <Image
                  src={mediaList[activeMediaIndex]?.url || product.image}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 hover:scale-102"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              {product.badge && (
                <div className="absolute top-6 left-6">
                  <span className="inline-block rounded-none bg-[#DD9E59] px-3.5 py-1.5 text-xs font-bold tracking-wider text-white uppercase shadow-sm">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Row below the enlarged image */}
            {mediaList.length > 1 && (
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {mediaList.map((media, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden border-2 rounded-none transition-all cursor-pointer bg-[#F0D8A1]/30 ${
                      activeMediaIndex === idx
                        ? "border-[#DD9E59] shadow-sm scale-98"
                        : "border-[#A47251]/10 hover:border-[#DD9E59]/50"
                    }`}
                  >
                    {media.type === "video" ? (
                      <div className="relative w-full h-full bg-black flex items-center justify-center">
                        <video
                          src={media.url}
                          className="w-full h-full object-cover opacity-60"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                          <svg
                            className="w-5 h-5 text-white drop-shadow-sm"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l8.43-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={media.url}
                        alt={`${product.name} gallery image ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="10vw"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info Column */}
          <div className="space-y-8">
            
            {/* Header info */}
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-[#F0D8A1] border border-[#A47251]/5 rounded-none text-xs font-bold uppercase tracking-wider text-[#DD9E59]">
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
                <span className="text-xs text-[#2A1E17]/40 font-semibold">•</span>
                <span className="text-xs font-semibold text-[#2A1E17]/60">
                  {product.reviewsCount} customer reviews
                </span>
              </div>

              {/* Price display */}
              <div className="text-3xl font-serif font-bold text-[#2A1E17] pt-2">
                Rs. {finalPrice.toFixed(2)}
              </div>
            </div>

            {/* Quick Description */}
            <p className="text-sm sm:text-base text-[#2A1E17]/85 leading-relaxed font-sans">
              {product.description}
            </p>

            {/* Default Product Details (Standard Recipe / Config) */}
            {(((product.defaultSize || (product.sizes && product.sizes.length > 0)) ||
              (product.defaultFlavor || (product.flavors && product.flavors.length > 0)) ||
              (product.defaultIcing || (product.icings && product.icings.length > 0)) ||
              (product.variants && product.variants.length > 0)) && (
              <div className="bg-[#F0D8A1]/60 border border-[#A47251]/5 rounded-none p-5 space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#2A1E17] flex items-center">
                  <span className="inline-block border border-[#A47251]/10 bg-white px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-sans mr-2">Recipe</span> Standard Configuration (Included in Base Price)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Default Size */}
                  {((product.sizes && product.sizes.length > 0) || product.defaultSize) && (
                    <div className="bg-white p-3 rounded-none border border-[#A47251]/5">
                      <span className="block text-[8px] font-bold uppercase text-[#2A1E17]/50">Size / Weight</span>
                      <span className="font-bold text-[#2A1E17] text-xs mt-0.5 block">
                        {product.defaultSize || (product.sizes && product.sizes[0]?.name) || "Standard"}
                      </span>
                    </div>
                  )}
                  {/* Default Flavor */}
                  {((product.flavors && product.flavors.length > 0) || product.defaultFlavor) && (
                    <div className="bg-white p-3 rounded-none border border-[#A47251]/5">
                      <span className="block text-[8px] font-bold uppercase text-[#2A1E17]/50">Flavor</span>
                      <span className="font-bold text-[#2A1E17] text-xs mt-0.5 block">
                        {product.defaultFlavor || (product.flavors && (typeof product.flavors[0] === "string" ? product.flavors[0] : (product.flavors[0] as any).name)) || "Standard"}
                      </span>
                    </div>
                  )}
                  {/* Default Coating / Icing */}
                  {((product.icings && product.icings.length > 0) || product.defaultIcing) && (
                    <div className="bg-white p-3 rounded-none border border-[#A47251]/5">
                      <span className="block text-[8px] font-bold uppercase text-[#2A1E17]/50">Coating / Icing</span>
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
                      <div className="bg-white p-3 rounded-none border border-[#A47251]/5 sm:col-span-3">
                        <span className="block text-[8px] font-bold uppercase text-[#2A1E17]/50">Default Option</span>
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
              <div className="space-y-6 pt-6 border-t border-[#A47251]/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A1E17] flex items-center">
                    <span className="inline-block border border-[#A47251]/10 bg-white px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-sans mr-2">Options</span> Customize Options / Variations
                  </h3>
                  <span className="text-[9px] text-[#2A1E17]/60 italic font-medium">* Selection updates pricing</span>
                </div>

                {((availableSizes.length > 0) || 
                  (availableFlavors.length > 0) || 
                  (availableIcings.length > 0)) ? (
                  <div className="space-y-6">
                    {/* 1. Sizes (Capsule Button Chips) */}
                    {availableSizes.length > 0 && (
                      <div className="space-y-3">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
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
                                    ? "bg-[#A47251] text-white border-[#A47251] shadow-sm"
                                    : "bg-white text-[#2A1E17] border-[#A47251]/10 hover:border-[#DD9E59]"
                                }`}
                              >
                                <span>{s.name}</span>
                                {premium !== 0 && (
                                  <span className={`ml-1 text-[9px] font-semibold ${isSelected ? "text-[#DD9E59]" : "text-[#2A1E17]/60"}`}>
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
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
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
                                    ? "bg-[#A47251] text-white border-[#A47251] shadow-sm ring-2 ring-[#DD9E59]/30"
                                    : "bg-white text-[#2A1E17] border-[#A47251]/10 hover:border-[#DD9E59]"
                                }`}
                              >
                                <span>{fName}</span>
                                {fPrice !== 0 && (
                                  <span className={`block text-[9px] font-semibold mt-0.5 ${isSelected ? "text-[#DD9E59]" : "text-[#2A1E17]/60"}`}>
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
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
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
                                    ? "bg-[#A47251] text-white border-[#A47251] shadow-sm ring-2 ring-[#DD9E59]/30"
                                    : "bg-white text-[#2A1E17] border-[#A47251]/10 hover:border-[#DD9E59]"
                                }`}
                              >
                                <span>{icName}</span>
                                {icPrice !== 0 && (
                                  <span className={`block text-[9px] font-semibold mt-0.5 ${isSelected ? "text-[#DD9E59]" : "text-[#2A1E17]/60"}`}>
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
                    <div className="space-y-3 pt-3 border-t border-[#A47251]/5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
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
                                  ? "bg-[#DD9E59]/10 border-[#DD9E59] text-[#2A1E17]"
                                  : "bg-white text-[#2A1E17]/70 border-[#A47251]/5 hover:border-[#DD9E59]/40"
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
                                  className="rounded border-[#A47251]/20 text-[#DD9E59] focus:ring-[#DD9E59] h-4 w-4 cursor-pointer accent-[#DD9E59]"
                                />
                                <div>
                                  <span className="font-bold block text-[#2A1E17]">{addon.name}</span>
                                  <span className="text-[10px] text-[#2A1E17]/60 font-medium">{addon.desc}</span>
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
                          className="inline-flex items-center text-xs font-bold text-[#DD9E59] hover:text-[#2A1E17] transition-colors mt-2 focus:outline-none cursor-pointer"
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
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
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
                                  ? "bg-[#A47251] text-white border-[#A47251] shadow-sm"
                                  : "bg-white text-[#2A1E17] border-[#A47251]/10 hover:border-[#DD9E59]"
                              }`}
                            >
                              <span className="block font-bold">{v.name}</span>
                              <span className={`block text-[10px] mt-0.5 ${isSelected ? "text-[#DD9E59]" : "text-[#2A1E17]/60"}`}>
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
            <div className="space-y-2 pt-6 border-t border-[#A47251]/5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                Quantity:
              </span>
              <div className="flex items-center justify-between bg-[#F0D8A1] border border-[#A47251]/10 rounded-none px-2 py-1 w-32">
                <button
                  onClick={decrementQty}
                  disabled={quantity === 1}
                  aria-label="Decrease quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-none text-[#2A1E17] hover:bg-[#A47251]/5 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
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
                  className="flex h-9 w-9 items-center justify-center rounded-none text-[#2A1E17] hover:bg-[#A47251]/5 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
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
                    ? "bg-[#DCF0C3] text-[#2A1E17] shadow-md"
                    : "bg-[#A47251] text-white hover:bg-[#DD9E59] hover:text-[#2A1E17]"
                }`}
              >
                {isAdded ? "Added to Cart ✓" : "Add to Cart"}
              </button>

              {/* Buy Now CTA */}
              <button
                onClick={handleBuyNow}
                className="flex-1 rounded-none py-3 px-8 text-xs font-bold uppercase tracking-wider text-center transition-all duration-300 cursor-pointer shadow-xs bg-[#DD9E59] text-[#2A1E17] hover:bg-[#A47251] hover:text-white"
              >
                Buy Now
              </button>
            </div>

          </div>
        </div>

        {/* Reviews and Comments Section */}
        <section className="border-t border-[#A47251]/10 pt-12 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Reviews Summary & List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-[#A47251]/10 pb-4">
                <h3 className="font-serif text-2xl font-bold text-[#2A1E17]">
                  Customer Reviews ({reviews.length})
                </h3>
                {reviews.length > 0 && (
                  <div className="flex items-center space-x-2 bg-[#F0D8A1]/35 px-3 py-1.5 text-xs font-bold rounded-none text-[#2A1E17]">
                    <span>Avg. Rating:</span>
                    <span className="font-bold text-[#DD9E59]">
                      {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                    </span>
                    <span>/ 5</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-10 bg-[#F0D8A1]/10 rounded-none border border-dashed border-[#A47251]/10">
                  <p className="text-sm text-[#2A1E17]/60">No reviews yet for this treat. Be the first to write one!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-[#F0D8A1]/20 border border-[#A47251]/5 p-5 space-y-2.5 rounded-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-8.5 w-8.5 rounded-full bg-[#DD9E59]/20 text-[#2A1E17] font-bold text-xs flex items-center justify-center">
                            {r.userName?.[0]?.toUpperCase() || "A"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#2A1E17]">{r.userName}</p>
                            <div className="mt-0.5">{renderStars(r.rating)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] text-[#2A1E17]/50 font-medium">
                            {new Date(r.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {userProfile?.role === "admin" && (
                            <button
                              onClick={() => handleDeleteReview(r.id)}
                              disabled={deletingId === r.id}
                              className="text-red-650 hover:text-red-900 disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                            >
                              {deletingId === r.id ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-[#2A1E17]/85 leading-relaxed pl-10">
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Submission Form */}
            <div className="bg-[#F0D8A1]/35 border border-[#A47251]/10 p-6 sm:p-8 rounded-none h-fit">
              <h4 className="font-serif text-xl font-bold text-[#2A1E17] mb-4 pb-2 border-b border-[#A47251]/10">
                Write a Review
              </h4>
              
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Interactive Star Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70 mb-2">
                      Your Rating
                    </label>
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-[#DD9E59] hover:scale-110 transition-transform cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={star <= rating ? "#DD9E59" : "none"}
                            stroke="#DD9E59"
                            strokeWidth={1.5}
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.48 3.499c-.198-.39-1.31-.39-1.508 0L7.54 6.792 3.82 7.333c-.43.06-.6.586-.288.892l2.69 2.622-.636 3.705c-.074.43.382.762.766.56l3.313-1.741 3.313 1.742c.384.203.84-.128.766-.56l-.636-3.705 2.69-2.622c.313-.306.142-.832-.288-.892l-3.72-.541-1.637-3.294Z"
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div>
                    <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70 mb-2">
                      Review Comment
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this treat..."
                      className="w-full bg-[#FDF9F0] border border-[#A47251]/20 rounded-none p-3 text-xs sm:text-sm text-[#2A1E17] placeholder-[#2A1E17]/40 focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59] transition-all resize-none"
                    />
                  </div>

                  {submitError && (
                    <p className="text-xs font-semibold text-red-600 bg-red-50 p-2 border border-red-200">
                      {submitError}
                    </p>
                  )}

                  {submitSuccess && (
                    <p className="text-xs font-semibold text-[#2A1E17] bg-[#DCF0C3] p-2 border border-[#DCF0C3]">
                      Review submitted successfully! Thank you.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-none bg-[#A47251] text-white py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <p className="text-xs sm:text-sm text-[#2A1E17]/70">
                    You must be logged in to leave a review for this product.
                  </p>
                  <Link
                    href={`/login?redirect=%2Fmenu%2F${product.id}`}
                    className="inline-block rounded-none bg-[#A47251] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer"
                  >
                    Log In to Review
                  </Link>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Recommendations / Related Products */}
        <section className="border-t border-[#A47251]/10 pt-8 mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#DD9E59]">
                Recommendations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2A1E17]">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/menu"
              className="mt-4 md:mt-0 text-xs font-bold uppercase tracking-wider text-[#2A1E17] hover:text-[#DD9E59] flex items-center transition-colors cursor-pointer"
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
