"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteReview } from "@/lib/reviews";
import { Product } from "@/data/products";

interface ReviewsClientProps {
  initialReviews: any[];
  products: Product[];
}

export default function ReviewsClient({ initialReviews, products }: ReviewsClientProps) {
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper to map product ID to product Name
  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : `Unknown Product (${productId})`;
  };

  // Star icons renderer helper
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= rating ? "#DD9E59" : "none"}
            stroke={star <= rating ? "#DD9E59" : "currentColor"}
            strokeWidth={1.5}
            className="w-3.5 h-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499c-.198-.39-1.31-.39-1.508 0L7.54 6.792 3.82 7.333c-.43.06-.6.586-.288.892l2.69 2.622-.636 3.705c-.074.43.382.762.766.56l3.313-1.741 3.313 1.742c.384.203.84-.128.766-.56l-.636-3.705 2.69-2.622c.313-.306.142-.832-.288-.892l-3.72-.541-1.637-3.294Z"
            />
          </svg>
        ))}
      </div>
    );
  };

  const handleDelete = async (id: string) => {
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

  // Filter and search logic
  const filteredReviews = reviews.filter((r) => {
    const productName = getProductName(r.productId).toLowerCase();
    const reviewerName = (r.userName || "").toLowerCase();
    const commentText = (r.comment || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      productName.includes(query) || reviewerName.includes(query) || commentText.includes(query);

    const matchesRating = selectedRating === "all" || r.rating.toString() === selectedRating;

    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6">
      
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-[#F0D8A1]/30 border border-[#A47251]/10 p-4 rounded-none">
        {/* Search Query */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search reviews by product, customer, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FDF9F0] border border-[#A47251]/20 rounded-none py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#2A1E17] placeholder-[#2A1E17]/40 focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59] transition-all"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="absolute left-3.5 top-3 w-4 h-4 text-[#2A1E17]/50"
          >
            <path strokeLinecap="square" strokeLinejoin="miter" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>

        {/* Star Rating Filter */}
        <div className="flex items-center space-x-2 shrink-0">
          <label className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]/70">
            Rating:
          </label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="bg-[#FDF9F0] border border-[#A47251]/20 rounded-none py-2 px-4 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer"
          >
            <option value="all">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-[#FDF9F0] border border-[#A47251]/10 rounded-none">
          <p className="text-sm text-[#2A1E17]/60 font-medium">No reviews found matching the selected filters.</p>
        </div>
      ) : (
        <div className="bg-[#FDF9F0] border border-[#A47251]/10 rounded-none overflow-x-auto shadow-xs">
          <table className="min-w-full divide-y divide-[#A47251]/10 text-left">
            <thead className="bg-[#F0D8A1]/35">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#2A1E17]">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#2A1E17]">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#2A1E17]">
                  Product
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#2A1E17]">
                  Rating
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#2A1E17]">
                  Comment
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#2A1E17] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#A47251]/10 bg-white">
              {filteredReviews.map((r) => (
                <tr key={r.id} className="hover:bg-[#F0D8A1]/10 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-xs sm:text-sm text-[#2A1E17]/70">
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs sm:text-sm font-bold text-[#2A1E17]">
                    {r.userName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs sm:text-sm">
                    <Link
                      href={`/menu/${r.productId}`}
                      target="_blank"
                      className="text-[#A47251] font-semibold hover:underline"
                    >
                      {getProductName(r.productId)}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs sm:text-sm">
                    {renderStars(r.rating)}
                  </td>
                  <td className="px-6 py-4 text-xs sm:text-sm text-[#2A1E17]/85 max-w-xs sm:max-w-md truncate">
                    {r.comment}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-xs sm:text-sm font-medium">
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="inline-flex items-center space-x-1 text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {deletingId === r.id ? (
                        <span className="h-3.5 w-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="square" strokeLinejoin="miter" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
