"use client";

import { useState } from "react";
import { Product } from "@/data/products";
import { Review } from "@/types/database";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface AdminProductDetailClientProps {
  product: Product & {
    isAvailable?: boolean;
    ingredients?: string[];
    careInstructions?: string;
    images?: string[];
    videoUrl?: string;
  };
  initialReviews: Review[];
}

export default function AdminProductDetailClient({
  product,
  initialReviews,
}: AdminProductDetailClientProps) {
  const { setIsMutating } = useAuth();
  const [isAvailable, setIsAvailable] = useState<boolean>(product.isAvailable !== false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>(product.image);

  // Toggle availability status in Firestore
  const handleToggleAvailability = async () => {
    setIsUpdating(true);
    setIsMutating(true);
    try {
      const docRef = doc(db, "products", product.id);
      const newStatus = !isAvailable;
      await updateDoc(docRef, {
        isAvailable: newStatus,
        updatedAt: Timestamp.now(),
      });
      setIsAvailable(newStatus);
    } catch (error) {
      console.error("Error updating availability status in Firestore:", error);
      alert("Error: Database permission denied or network error.");
    } finally {
      setIsUpdating(false);
      setIsMutating(false);
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

  return (
    <div className="flex flex-col xl:flex-row gap-10 items-start">
      
      {/* Left Column: Product Info Card */}
      <div className="flex-1 w-full space-y-6">
        
        {/* Profile Card */}
        <div className="rounded-none border border-[#2A1E17]/5 bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row gap-8 items-start">
          {/* Image */}
          <div className="flex flex-col space-y-3 flex-shrink-0 w-full md:w-48">
            <div className="relative aspect-square w-full overflow-hidden rounded-none bg-[#2A1E17]/5 shadow-xs">
              <img src={selectedImage} alt={product.name} className="h-full w-full object-cover" />
              {product.badge && (
                <span className="absolute top-3 left-3 inline-block rounded-none bg-[#EFEFEA] px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
                  {product.badge}
                </span>
              )}
            </div>
            {/* Thumbnails row */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                {product.images.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-none border transition-all ${
                      selectedImage === imgUrl ? "border-[#C5A880] ring-2 ring-[#C5A880]/20" : "border-[#2A1E17]/5 hover:border-[#C5A880]/40"
                    }`}
                  >
                    <img src={imgUrl} alt={`${product.name} thumbnail ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details list */}
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-[#EFEFEA] border border-[#2A1E17]/5 rounded-none text-[10px] font-bold uppercase tracking-wider text-[#C5A880]">
                {product.category}
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#2A1E17]">{product.name}</h2>
              <div className="flex items-center space-x-1.5 pt-0.5">
                <div className="flex items-center">{renderStars(product.rating)}</div>
                <span className="text-xs font-bold text-[#2A1E17]/70">
                  {product.rating.toFixed(1)} rating ({product.reviewsCount} reviews)
                </span>
              </div>
            </div>

            <div className="text-2xl font-serif font-bold text-[#2A1E17]">
              Rs. {product.price.toFixed(2)}
            </div>

            {/* Availability Status Toggle */}
            <div className="flex items-center space-x-3 pt-3 border-t border-[#2A1E17]/5">
              <span className="text-xs font-bold text-[#3A2E2B]/80 uppercase tracking-wide">
                Available in Store:
              </span>
              <button
                onClick={handleToggleAvailability}
                disabled={isUpdating}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? "bg-[#C5A880]" : "bg-gray-200"
                } disabled:opacity-50`}
              >
                <span className="sr-only">Toggle availability</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span
                className={`text-xs font-bold ${
                  isAvailable ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {isAvailable ? "Active" : "Hidden"}
              </span>
            </div>
          </div>
        </div>

        {/* Ingredients & Care Details */}
        <div className="rounded-none border border-[#2A1E17]/5 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">Description</h4>
            <p className="text-sm text-[#3A2E2B] leading-relaxed">{product.description}</p>
          </div>

          {/* Video Reel Preview */}
          {product.videoUrl && (
            <div className="space-y-2 pt-4 border-t border-[#2A1E17]/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">Product Reel Video</h4>
              <div className="relative aspect-[9/16] w-36 overflow-hidden rounded-none bg-black border border-[#2A1E17]/10 shadow-sm">
                <video
                  src={product.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Ingredients list */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#2A1E17]/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">Key Ingredients</h4>
              <ul className="grid grid-cols-2 gap-2 text-xs text-[#3A2E2B] font-semibold">
                {product.ingredients.map((ing, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-[#C5A880]">✓</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Care details */}
          {product.careInstructions && (
            <div className="space-y-2 pt-4 border-t border-[#2A1E17]/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">Storage & Reheating Guide</h4>
              <p className="text-xs text-[#3A2E2B] leading-relaxed bg-[#EFEFEA] border border-[#2A1E17]/5 rounded-none p-3.5">
                {product.careInstructions}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Customer Reviews panel */}
      <div className="w-full xl:w-96 space-y-6 flex-shrink-0">
        <h2 className="font-serif text-xl font-bold text-[#2A1E17]">Customer Reviews</h2>
        
        {initialReviews.length === 0 ? (
          <div className="rounded-none border border-dashed border-[#2A1E17]/10 p-12 text-center text-[#3A2E2B]/60 bg-[#EFEFEA]/30 text-sm">
            No reviews yet. When customers leave feedback on the storefront, it will appear here.
          </div>
        ) : (
          <div className="space-y-4">
            {initialReviews.map((r) => {
              const reviewDate = r.createdAt
                ? new Date(r.createdAt as any).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : new Date().toLocaleDateString();

              return (
                <div key={r.id} className="rounded-none border border-[#2A1E17]/5 bg-white p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#2A1E17]">{r.userName}</span>
                    <span className="text-[10px] text-[#3A2E2B]/50 font-semibold">{reviewDate}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(r.rating)}
                  </div>
                  <p className="text-xs text-[#3A2E2B]/95 leading-relaxed italic">
                    "{r.comment}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
