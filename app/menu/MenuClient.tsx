"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

const ITEMS_PER_PAGE = 8;
const CATEGORIES = ["All", "Cake", "Savory", "Pastry", "Cookie", "Custom"] as const;

type SortOption = "featured" | "price-asc" | "price-desc" | "rating-desc";

export default function MenuClient() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams ? searchParams.get("category") : null;

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [prevCategoryParam, setPrevCategoryParam] = useState<string | null>(null);

  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    if (categoryParam) {
      const matched = CATEGORIES.find(
        (c) => c.toLowerCase() === categoryParam.toLowerCase()
      );
      if (matched) {
        setSelectedCategory(matched);
      }
    } else {
      setSelectedCategory("All");
    }
  }
  const searchParam = searchParams ? searchParams.get("search") : null;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [prevSearchParam, setPrevSearchParam] = useState<string | null>(null);

  if (searchParam !== prevSearchParam) {
    setPrevSearchParam(searchParam);
    setSearchQuery(searchParam || "");
  }
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [onlyBestsellers, setOnlyBestsellers] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // API State
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search Input Debouncing State (Standard Best Practice)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");



  // Handle Search input debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setCurrentPage(1); // Reset page to 1 when query updates
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products from the backend API Route
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("category", selectedCategory);
        queryParams.set("search", debouncedSearchQuery);
        
        if (minPrice) queryParams.set("minPrice", minPrice);
        if (maxPrice) queryParams.set("maxPrice", maxPrice);
        if (minRating !== null) queryParams.set("minRating", minRating.toString());
        if (onlyBestsellers) queryParams.set("onlyBestsellers", "true");
        
        queryParams.set("sortBy", sortBy);
        queryParams.set("page", currentPage.toString());
        queryParams.set("limit", ITEMS_PER_PAGE.toString());

        const response = await fetch(`/api/products?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error("HTTP error " + response.status + ": Failed to retrieve menu items.");
        }
        
        const data = await response.json();
        setProductsList(data.products);
        setTotalProducts(data.total);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred while loading the menu.";
        console.error("Fetch API error:", err);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch products
    fetchProducts();
  }, [selectedCategory, debouncedSearchQuery, minPrice, maxPrice, minRating, onlyBestsellers, sortBy, currentPage]);

  // Reset all filters back to default
  const resetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating(null);
    setOnlyBestsellers(false);
    setSortBy("featured");
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              <span className="text-[#2A1E17]">Menu</span>
            </li>
          </ol>
        </nav>

        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
            Handcrafted Delights
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2A1E17]">
            Our Artisanal Menu
          </h1>
          <div className="h-1 w-16 bg-[#C5A880] mx-auto rounded-full" />
          <p className="text-sm sm:text-base md:text-lg text-[#3A2E2B]/80 leading-relaxed max-w-2xl mx-auto">
            From layered chocolate fudge cakes and buttery croissants to gourmet mushroom savory galettes—every delight is baked fresh with organic, premium ingredients.
          </p>
        </div>

        {/* Top Control Bar for Sorting & Mobile Filter Toggle */}
        <div className="flex items-center justify-between border-b border-[#2A1E17]/10 pb-5 mb-8">
          <div className="text-xs sm:text-sm font-semibold text-[#3A2E2B]/70">
            {isLoading ? (
              <span className="animate-pulse">Loading menu...</span>
            ) : (
              <>
                Showing <span className="text-[#2A1E17] font-bold">{totalProducts}</span> {totalProducts === 1 ? "treat" : "treats"}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">
                Sort By:
              </label>
              <div className="relative">
                <select
                  id="sort"
                  value={sortBy}
                  onChange={handleSortChange}
                  className="appearance-none bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-full py-1.5 pl-4 pr-9 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] cursor-pointer transition-all"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highly Rated</option>
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#3A2E2B]/60 pointer-events-none"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            {/* Mobile Filters Toggle Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center space-x-2 bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2A1E17] hover:bg-[#2A1E17]/5 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Sidebar & Grid Main Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
            <div className="bg-[#EFEFEA]/50 border border-[#2A1E17]/5 rounded-2xl p-6 space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#2A1E17]/5 pb-4">
                <h3 className="font-serif text-lg font-bold text-[#2A1E17]">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] hover:text-[#2A1E17] transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]">Search</h4>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search treats..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-lg py-2 pl-9 pr-3 text-xs text-[#2A1E17] placeholder-[#3A2E2B]/50 focus:outline-none focus:border-[#C5A880] transition-all"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="absolute left-3 top-2.5 w-4 h-4 text-[#3A2E2B]/60"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]">Category</h4>
                <div className="flex flex-col space-y-1.5">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`text-left text-xs py-1 transition-all ${
                        selectedCategory === category
                          ? "font-bold text-[#C5A880]"
                          : "text-[#3A2E2B]/85 hover:text-[#2A1E17] hover:translate-x-0.5"
                      }`}
                    >
                      {category === "All" 
                        ? "All Offerings" 
                        : category === "Custom" 
                        ? "Custom Creations" 
                        : category === "Savory" 
                        ? "Savories" 
                        : category === "Pastry" 
                        ? "Pastries" 
                        : category + "s"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]">Price Range</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                    className="w-1/2 bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-lg p-1.5 text-xs text-center text-[#2A1E17]"
                  />
                  <span className="text-[#3A2E2B]/40 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                    className="w-1/2 bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-lg p-1.5 text-xs text-center text-[#2A1E17]"
                  />
                </div>
              </div>

              {/* Ratings */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]">Minimum Rating</h4>
                <div className="flex flex-col space-y-1.5">
                  {[4.9, 4.8, 4.7, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => { setMinRating(minRating === rating ? null : rating); setCurrentPage(1); }}
                      className={`flex items-center text-xs py-1 text-left ${
                        minRating === rating ? "font-bold text-[#C5A880]" : "text-[#3A2E2B]/85 hover:text-[#2A1E17]"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 text-amber-400 fill-current mr-1" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{rating.toFixed(1)} & Up</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Badges/Bestseller check */}
              <div className="flex items-center space-x-2 pt-2 border-t border-[#2A1E17]/5">
                <input
                  type="checkbox"
                  id="only-bestsellers"
                  checked={onlyBestsellers}
                  onChange={(e) => { setOnlyBestsellers(e.target.checked); setCurrentPage(1); }}
                  className="rounded border-[#2A1E17]/10 text-[#C5A880] focus:ring-[#C5A880] h-4 w-4 bg-[#EFEFEA] cursor-pointer"
                />
                <label htmlFor="only-bestsellers" className="text-xs font-bold text-[#3A2E2B]/85 cursor-pointer">
                  Bestsellers Only
                </label>
              </div>

            </div>
          </aside>

          {/* Products Grid & Pagination Container */}
          <div className="flex-1">
            
            {/* Error State */}
            {error && (
              <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200 text-red-800 p-6 mb-8">
                <svg className="mx-auto w-10 h-10 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="font-serif font-bold text-lg mb-1">Failed to retrieve menu items</h3>
                <p className="text-sm opacity-90 max-w-xs mx-auto mb-4">{error}</p>
                <button
                  onClick={resetFilters}
                  className="rounded-full bg-red-800 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-red-900 transition-all cursor-pointer"
                >
                  Reset Parameters & Retry
                </button>
              </div>
            )}

            {!error && (
              <>
                {isLoading ? (
                  /* Shimmer Skeleton Grid during Fetch */
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <ProductCardSkeleton key={index} />
                    ))}
                  </div>
                ) : productsList.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-20 bg-[#EFEFEA]/30 rounded-2xl border border-dashed border-[#2A1E17]/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.2}
                      stroke="currentColor"
                      className="mx-auto w-12 h-12 text-[#3A2E2B]/40 mb-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                      />
                    </svg>
                    <h3 className="text-lg font-serif font-bold text-[#2A1E17] mb-1">No items found</h3>
                    <p className="text-sm text-[#3A2E2B]/70 max-w-xs mx-auto">
                      We couldn&apos;t find any treats matching your set criteria. Try adjusting or clearing filters!
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-6 inline-block rounded-full bg-[#2A1E17] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2A1E17] transition-all cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Real Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                      {productsList.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2 mt-16 pt-8 border-t border-[#2A1E17]/5">
                        {/* Prev Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          aria-label="Previous Page"
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2A1E17]/10 bg-white text-[#2A1E17] transition-all hover:border-[#C5A880] hover:bg-[#EFEFEA] disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#2A1E17]/10 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                          </svg>
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, index) => {
                          const pageNum = index + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer ${
                                currentPage === pageNum
                                  ? "bg-[#2A1E17] text-white shadow-sm"
                                  : "border border-[#2A1E17]/10 bg-white text-[#2A1E17] hover:border-[#C5A880] hover:bg-[#EFEFEA]"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        {/* Next Button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          aria-label="Next Page"
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2A1E17]/10 bg-white text-[#2A1E17] transition-all hover:border-[#C5A880] hover:bg-[#EFEFEA] disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#2A1E17]/10 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Drawer Slide-over */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-[#2A1E17]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-[#FBFBF9] py-6 px-6 shadow-xl transition-all">
            <div className="flex items-center justify-between border-b border-[#2A1E17]/5 pb-4 mb-6">
              <h2 className="font-serif text-lg font-bold text-[#2A1E17]">Filter Treats</h2>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="rounded-md p-1.5 text-[#3A2E2B] hover:bg-[#2A1E17]/5 transition-colors cursor-pointer"
              >
                <span className="sr-only">Close menu</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Filters Panel */}
            <div className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]">Search</h4>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search treats..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-lg py-2 pl-9 pr-3 text-xs text-[#2A1E17] placeholder-[#3A2E2B]/50 focus:outline-none focus:border-[#C5A880] transition-all"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="absolute left-3 top-2.5 w-4 h-4 text-[#3A2E2B]/60"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]">Category</h4>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`text-center text-xs py-2 px-3 rounded-lg border transition-all ${
                        selectedCategory === category
                          ? "bg-[#2A1E17] text-white border-[#2A1E17]"
                          : "bg-[#EFEFEA] border-[#2A1E17]/5 text-[#3A2E2B]/85 hover:bg-[#2A1E17]/5"
                      }`}
                    >
                      {category === "All" 
                        ? "All" 
                        : category === "Custom" 
                        ? "Custom Creations" 
                        : category === "Savory" 
                        ? "Savories" 
                        : category === "Pastry" 
                        ? "Pastries" 
                        : category + "s"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]">Price Range</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                    className="w-1/2 bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-lg p-2 text-xs text-center text-[#2A1E17]"
                  />
                  <span className="text-[#3A2E2B]/40 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                    className="w-1/2 bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-lg p-2 text-xs text-center text-[#2A1E17]"
                  />
                </div>
              </div>

              {/* Ratings */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]">Minimum Rating</h4>
                <div className="flex flex-col space-y-1">
                  {[4.9, 4.8, 4.7, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => { setMinRating(minRating === rating ? null : rating); setCurrentPage(1); }}
                      className={`flex items-center text-xs py-2 px-3 rounded-lg border text-left ${
                        minRating === rating
                          ? "bg-[#2A1E17] text-white border-[#2A1E17]"
                          : "bg-[#EFEFEA] border-[#2A1E17]/5 text-[#3A2E2B]/85"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 text-amber-400 fill-current mr-1" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{rating.toFixed(1)} & Up</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Badges/Bestseller check */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="only-bestsellers-mobile"
                  checked={onlyBestsellers}
                  onChange={(e) => { setOnlyBestsellers(e.target.checked); setCurrentPage(1); }}
                  className="rounded border-[#2A1E17]/10 text-[#C5A880] focus:ring-[#C5A880] h-4 w-4 bg-[#EFEFEA]"
                />
                <label htmlFor="only-bestsellers-mobile" className="text-xs font-bold text-[#3A2E2B]/85">
                  Bestsellers Only
                </label>
              </div>

              <div className="flex space-x-2 pt-6 border-t border-[#2A1E17]/5">
                <button
                  onClick={resetFilters}
                  className="w-1/2 border border-[#2A1E17]/25 text-[#2A1E17] rounded-full py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#EFEFEA] cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-1/2 bg-[#2A1E17] text-white rounded-full py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
