"use client";

import { useState, useMemo } from "react";
import { products as localProducts, Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const ITEMS_PER_PAGE = 8;
const CATEGORIES = ["All", "Cake", "Savory", "Pastry", "Cookie", "Custom"] as const;

type SortOption = "featured" | "price-asc" | "price-desc" | "rating-desc";

interface ProductCatalogProps {
  initialProducts?: Product[];
}

export default function ProductCatalog({ initialProducts }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter & Sort Products
  const processedProducts = useMemo(() => {
    let result = [...(initialProducts || localProducts)];

    // Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating-desc") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE) || 1;
  
  // Reset page when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
    setCurrentPage(1);
  };

  // Get current page items
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top of catalog section
    const element = document.getElementById("catalog-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };



  return (
    <section id="catalog-section" className="bg-[#fdfcf9] py-24 sm:py-32 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c2957c]">
              Baker's Selection
            </span>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2d1e18] sm:text-5xl">
              Explore Our Collection
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm sm:text-base text-[#55433c]/70 max-w-md">
            Our fresh, premium, handcrafted products are made daily. Browse through our menu and find your next sweet delight or savory treat!
          </p>
        </div>

        {/* Filters, Search & Sort Panel */}
        <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between border-b border-[#2d1e18]/10 pb-8 mb-10">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-thin">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-[#2d1e18] text-white shadow-sm"
                    : "bg-[#faf5f0] text-[#55433c]/80 hover:bg-[#2d1e18]/5 hover:text-[#2d1e18]"
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

          {/* Search and Sort Inputs */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search treats..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-[#faf5f0] border border-[#2d1e18]/10 rounded-full py-2 pl-10 pr-4 text-sm text-[#2d1e18] placeholder-[#55433c]/50 focus:outline-none focus:border-[#c2957c] focus:ring-1 focus:ring-[#c2957c] transition-all"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-[#55433c]/60"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="appearance-none bg-[#faf5f0] border border-[#2d1e18]/10 rounded-full py-2 pl-4 pr-10 text-sm text-[#2d1e18] focus:outline-none focus:border-[#c2957c] focus:ring-1 focus:ring-[#c2957c] cursor-pointer transition-all"
              >
                <option value="featured">Featured / Default</option>
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
                className="absolute right-3.5 top-3 w-3 h-3 text-[#55433c]/60 pointer-events-none"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Dynamic Count & Results */}
        <div className="mb-6 text-xs text-[#55433c]/60 font-semibold tracking-wider uppercase">
          Showing {processedProducts.length} {processedProducts.length === 1 ? "treat" : "treats"}
        </div>

        {/* Empty State */}
        {paginatedProducts.length === 0 ? (
          <div className="text-center py-20 bg-[#faf5f0]/50 rounded-2xl border border-dashed border-[#2d1e18]/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.2}
              stroke="currentColor"
              className="mx-auto w-12 h-12 text-[#55433c]/40 mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
              />
            </svg>
            <h3 className="text-lg font-serif font-bold text-[#2d1e18] mb-1">No treats found</h3>
            <p className="text-sm text-[#55433c]/70 max-w-xs mx-auto">
              We couldn't find anything matching your filters or search term. Try expanding your search!
            </p>
          </div>
        ) : (
          /* Products Grid */
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-16 pt-8 border-t border-[#2d1e18]/5">
                {/* Prev Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2d1e18]/10 bg-white text-[#2d1e18] transition-all hover:border-[#c2957c] hover:bg-[#faf5f0] disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#2d1e18]/10 disabled:cursor-not-allowed cursor-pointer"
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
                          ? "bg-[#2d1e18] text-white shadow-sm"
                          : "border border-[#2d1e18]/10 bg-white text-[#2d1e18] hover:border-[#c2957c] hover:bg-[#faf5f0]"
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2d1e18]/10 bg-white text-[#2d1e18] transition-all hover:border-[#c2957c] hover:bg-[#faf5f0] disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#2d1e18]/10 disabled:cursor-not-allowed cursor-pointer"
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

      </div>
    </section>
  );
}
