"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

const ITEMS_PER_PAGE = 8;
const CATEGORIES = ["All", "Cake", "Savory", "Pastry", "Cookie", "Custom", "Gifts & Hampers"] as const;

type SortOption = "featured" | "price-asc" | "price-desc" | "rating-desc";

export default function MenuClient() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams ? searchParams.get("category") : null;
  const subcategoryParam = searchParams ? searchParams.get("subcategory") : null;
  const router = useRouter();

  const { user } = useAuth();
  
  // Dynamic categories from Firestore
  const [dbCategories, setDbCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { collection, getDocs } = await import("firebase/firestore");
        const categoriesRef = collection(db, "categories");
        const snapshot = await getDocs(categoriesRef);
        const list: string[] = ["All"];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.name) {
            list.push(data.name);
          }
        });
        
        // Ensure "Custom" is available for custom order form triggering
        if (!list.includes("Custom")) {
          list.push("Custom");
        }
        
        setDbCategories(list);
      } catch (error) {
        console.error("Error fetching categories in Menu:", error);
      }
    };
    fetchCategories();
  }, []);

  // Custom Order States
  const [isCustomOrderOpen, setIsCustomOrderOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [pickupBranch, setPickupBranch] = useState("Main Bakery - Colombo 07");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [requiredTime, setRequiredTime] = useState("");
  const [cakeSize, setCakeSize] = useState("1kg");
  const [cakeFlavor, setCakeFlavor] = useState("Signature Chocolate");
  const [cakeIcing, setCakeIcing] = useState("Buttercream");
  const [instructions, setInstructions] = useState("");
  const [customSampleImage, setCustomSampleImage] = useState<string | null>(null);
  const [isCustomSubmitting, setIsCustomSubmitting] = useState(false);
  const [customSuccessId, setCustomSuccessId] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    if (user && isCustomOrderOpen) {
      setFullName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user, isCustomOrderOpen]);

  const [availableSizes, setAvailableSizes] = useState<string[]>(["500g", "1kg", "1.5kg", "2kg", "3kg"]);
  const [availableFlavors, setAvailableFlavors] = useState<string[]>(["Signature Chocolate", "Vanilla Sponge", "Red Velvet", "Carrot & Nut"]);
  const [availableIcings, setAvailableIcings] = useState<string[]>(["Buttercream", "Fondant", "Fresh Cream"]);

  useEffect(() => {
    const loadAllProductVariations = async () => {
      try {
        const response = await fetch("/api/products?limit=100", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const allProducts: Product[] = data.products || [];
          
          const sizesSet = new Set<string>();
          const flavorsSet = new Set<string>();
          const icingsSet = new Set<string>();

          allProducts.forEach((p) => {
            if (p.sizes && Array.isArray(p.sizes)) {
              p.sizes.forEach((s: any) => {
                if (s && s.name) sizesSet.add(s.name);
              });
            }
            if ((p as any).defaultSize) sizesSet.add((p as any).defaultSize);

            if (p.flavors && Array.isArray(p.flavors)) {
              p.flavors.forEach((f: any) => {
                const name = typeof f === "string" ? f : f.name;
                if (name) flavorsSet.add(name);
              });
            }
            if ((p as any).defaultFlavor) flavorsSet.add((p as any).defaultFlavor);

            if (p.icings && Array.isArray(p.icings)) {
              p.icings.forEach((ic: any) => {
                const name = typeof ic === "string" ? ic : ic.name;
                if (name) icingsSet.add(name);
              });
            }
            if ((p as any).defaultIcing) icingsSet.add((p as any).defaultIcing);
          });

          const finalSizes = Array.from(sizesSet);
          const finalFlavors = Array.from(flavorsSet);
          const finalIcings = Array.from(icingsSet);

          if (finalSizes.length > 0) {
            setAvailableSizes(finalSizes);
            setCakeSize(finalSizes[0]);
          }
          if (finalFlavors.length > 0) {
            setAvailableFlavors(finalFlavors);
            setCakeFlavor(finalFlavors[0]);
          }
          if (finalIcings.length > 0) {
            setAvailableIcings(finalIcings);
            setCakeIcing(finalIcings[0]);
          }
        }
      } catch (error) {
        console.error("Error loading product variations:", error);
      }
    };

    loadAllProductVariations();
  }, []);

  const handleOpenCustomOrder = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setIsCustomOrderOpen(true);
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomSampleImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceCustomOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!customSampleImage) {
      setCustomError("Please upload a sample reference image.");
      return;
    }

    setIsCustomSubmitting(true);
    setCustomError(null);

    try {
      const { collection, getDocs, doc, setDoc } = await import("firebase/firestore");
      const ordersRef = collection(db, "orders");
      const ordersSnapshot = await getDocs(ordersRef);
      let maxNum = 0;
      ordersSnapshot.forEach((docSnap) => {
        const docId = docSnap.id;
        const numPart = docId.replace("order-", "");
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      });
      const nextNum = maxNum + 1;
      const generatedOrderId = `order-${nextNum}`;

      const orderData = {
        id: generatedOrderId,
        userId: user.uid,
        isCustomOrder: true,
        customSampleImage: customSampleImage,
        items: [
          {
            productId: "custom-creation",
            name: `Custom Creation Cake`,
            price: 0.00,
            quantity: 1,
            image: "/category_custom.png"
          }
        ],
        subtotal: 0.00,
        tax: 0.00,
        shippingFee: deliveryType === "delivery" ? 350 : 0,
        total: 0.00,
        status: "pending",
        shippingAddress: {
          id: `addr-${Date.now()}`,
          street: deliveryType === "pickup" ? `PICKUP: ${pickupBranch}` : deliveryAddress,
          city: deliveryType === "pickup" ? "Store Pickup" : deliveryCity,
          state: deliveryType === "pickup" ? "N/A" : "Delivery Province",
          postalCode: "N/A",
          country: "Sri Lanka",
          isDefault: false
        },
        paymentDetails: {
          method: "cod",
          status: "unpaid"
        },
        billingDetails: {
          firstName: fullName.split(" ")[0] || "Customer",
          lastName: fullName.split(" ").slice(1).join(" ") || "",
          country: "Sri Lanka",
          zipCode: "",
          phone: phone,
          email: email
        },
        fulfillment: {
          type: deliveryType,
          pickupDetails: deliveryType === "pickup" ? {
            branch: pickupBranch,
            date: requiredDate,
            time: requiredTime
          } : null,
          deliveryDetails: deliveryType === "delivery" ? {
            firstName: fullName.split(" ")[0] || "Customer",
            lastName: fullName.split(" ").slice(1).join(" ") || "",
            address: deliveryAddress,
            city: deliveryCity,
            phone: phone,
            recipientPhone: phone
          } : null
        },
        orderNote: `[CUSTOM DESIGN DETAILS]\nSize: ${cakeSize}\nFlavor: ${cakeFlavor}\nIcing: ${cakeIcing}\nInstructions: ${instructions}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const orderDocRef = doc(db, "orders", generatedOrderId);
      await setDoc(orderDocRef, orderData);

      setCustomSuccessId(generatedOrderId);
      
      // Reset form
      setPhone("");
      setDeliveryAddress("");
      setDeliveryCity("");
      setRequiredDate("");
      setRequiredTime("");
      setInstructions("");
      setCustomSampleImage(null);
    } catch (err) {
      console.error("Error creating custom order:", err);
      setCustomError("Failed to submit custom order. Please try again.");
    } finally {
      setIsCustomSubmitting(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    if (categoryParam) {
      const matched = dbCategories.find(
        (c) => c.toLowerCase() === categoryParam.toLowerCase()
      );
      if (matched) {
        setSelectedCategory(matched);
      }
    } else {
      setSelectedCategory("All");
    }
  }, [categoryParam, dbCategories]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

  useEffect(() => {
    setSelectedSubcategory(subcategoryParam || "");
  }, [subcategoryParam]);

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
        if (selectedSubcategory) queryParams.set("subcategory", selectedSubcategory);
        queryParams.set("search", debouncedSearchQuery);
        
        if (minPrice) queryParams.set("minPrice", minPrice);
        if (maxPrice) queryParams.set("maxPrice", maxPrice);
        if (minRating !== null) queryParams.set("minRating", minRating.toString());
        if (onlyBestsellers) queryParams.set("onlyBestsellers", "true");
        
        queryParams.set("sortBy", sortBy);
        queryParams.set("page", currentPage.toString());
        queryParams.set("limit", ITEMS_PER_PAGE.toString());
        queryParams.set("_t", Date.now().toString());

        const response = await fetch(`/api/products?${queryParams.toString()}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("HTTP error " + response.status + ": Failed to retrieve menu items.");
        }
        
        const data = await response.json();
        setProductsList(data.products as Product[]);
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
  }, [selectedCategory, selectedSubcategory, debouncedSearchQuery, minPrice, maxPrice, minRating, onlyBestsellers, sortBy, currentPage]);

  // Reset all filters back to default
  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedSubcategory("");
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
    setSelectedSubcategory("");
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
              <span className="text-[#2A1E17]">Menu</span>
            </li>
          </ol>
        </nav>

        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#DD9E59]">
            Handcrafted Delights
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2A1E17]">
            Our Artisanal Menu
          </h1>
          <div className="h-1 w-16 bg-[#DD9E59] mx-auto rounded-none" />
          <p className="text-sm sm:text-base md:text-lg text-[#2A1E17]/80 leading-relaxed max-w-2xl mx-auto">
            From layered chocolate fudge cakes and buttery croissants to gourmet mushroom savory galettes—every delight is baked fresh with organic, premium ingredients.
          </p>
        </div>

        {/* Top Control Bar for Sorting & Mobile Filter Toggle */}
        <div className="flex items-center justify-between border-b border-[#A47251]/10 pb-5 mb-8">
          <div className="text-xs sm:text-sm font-semibold text-[#2A1E17]/70">
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
              <label htmlFor="sort" className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">
                Sort By:
              </label>
              <div className="relative">
                <select
                  id="sort"
                  value={sortBy}
                  onChange={handleSortChange}
                  className="appearance-none bg-[#F0D8A1] border border-[#A47251]/10 rounded-none py-1.5 pl-4 pr-9 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59] cursor-pointer transition-all"
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
                  className="absolute right-3 top-2.5 w-3.5 h-3.5 text-[#2A1E17]/60 pointer-events-none"
                >
                  <path strokeLinecap="square" strokeLinejoin="miter" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            {/* Mobile Filters Toggle Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center space-x-2 bg-[#F0D8A1] border border-[#A47251]/10 rounded-none px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2A1E17] hover:bg-[#A47251]/5 transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Sidebar & Grid Main Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
            <div className="bg-[#F0D8A1]/50 border border-[#A47251]/5 rounded-none p-6 space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#A47251]/5 pb-4">
                <h3 className="font-serif text-lg font-bold text-[#2A1E17]">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-bold uppercase tracking-wider text-[#DD9E59] hover:text-[#2A1E17] transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">Search</h4>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search treats..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full bg-[#F0D8A1] border border-[#A47251]/10 rounded-none py-2 pl-9 pr-3 text-xs text-[#2A1E17] placeholder-[#2A1E17]/50 focus:outline-none focus:border-[#DD9E59] transition-all"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="absolute left-3 top-2.5 w-4 h-4 text-[#2A1E17]/60"
                  >
                    <path strokeLinecap="square" strokeLinejoin="miter" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">Category</h4>
                <div className="flex flex-col space-y-1.5">
                  {dbCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`text-left text-xs py-1 transition-all ${
                        selectedCategory === category
                          ? "font-bold text-[#DD9E59]"
                          : "text-[#2A1E17]/85 hover:text-[#2A1E17] hover:translate-x-0.5"
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
                        : category.endsWith("s")
                        ? category
                        : category + "s"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">Price Range</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                    className="w-1/2 bg-[#F0D8A1] border border-[#A47251]/10 rounded-none p-1.5 text-xs text-center text-[#2A1E17]"
                  />
                  <span className="text-[#2A1E17]/40 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                    className="w-1/2 bg-[#F0D8A1] border border-[#A47251]/10 rounded-none p-1.5 text-xs text-center text-[#2A1E17]"
                  />
                </div>
              </div>

              {/* Ratings */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">Minimum Rating</h4>
                <div className="flex flex-col space-y-1.5">
                  {[4.9, 4.8, 4.7, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => { setMinRating(minRating === rating ? null : rating); setCurrentPage(1); }}
                      className={`flex items-center text-xs py-1 text-left ${
                        minRating === rating ? "font-bold text-[#DD9E59]" : "text-[#2A1E17]/85 hover:text-[#2A1E17]"
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
              <div className="flex items-center space-x-2 pt-2 border-t border-[#A47251]/5">
                <input
                  type="checkbox"
                  id="only-bestsellers"
                  checked={onlyBestsellers}
                  onChange={(e) => { setOnlyBestsellers(e.target.checked); setCurrentPage(1); }}
                  className="rounded border-[#A47251]/10 text-[#DD9E59] focus:ring-[#DD9E59] h-4 w-4 bg-[#F0D8A1] cursor-pointer"
                />
                <label htmlFor="only-bestsellers" className="text-xs font-bold text-[#2A1E17]/85 cursor-pointer">
                  Bestsellers Only
                </label>
              </div>

            </div>
          </aside>

          {/* Products Grid & Pagination Container */}
          <div className="flex-1">
            
            {/* Error State */}
            {error && (
              <div className="text-center py-12 bg-red-50 rounded-none border border-red-200 text-red-800 p-6 mb-8">
                <svg className="mx-auto w-10 h-10 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="font-serif font-bold text-lg mb-1">Failed to retrieve menu items</h3>
                <p className="text-sm opacity-90 max-w-xs mx-auto mb-4">{error}</p>
                <button
                  onClick={resetFilters}
                  className="rounded-none bg-red-800 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-red-900 transition-all cursor-pointer"
                >
                  Reset Parameters & Retry
                </button>
              </div>
            )}

            {!error && (
              <>
                {selectedCategory === "Custom" && (
                  <div className="mb-10 bg-[#F0D8A1]/35 border-2 border-[#A47251]/20 p-8 text-center space-y-4 animate-fade-in">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#DD9E59]">Custom Creations</span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1E17]">Design Your Own Custom Masterpiece</h3>
                    <p className="text-sm text-[#2A1E17]/85 max-w-xl mx-auto leading-relaxed">
                      Have a specific vision for a wedding, birthday, or milestone celebration? Upload a reference image, choose your details, and place a custom order directly. Our master bakers will get in touch with you!
                    </p>
                    <button
                      onClick={handleOpenCustomOrder}
                      className="mt-2 inline-block rounded-none bg-[#A47251] text-white px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer shadow-sm hover:scale-101"
                    >
                      Request a Custom Order
                    </button>
                  </div>
                )}
                {isLoading ? (
                  /* Shimmer Skeleton Grid during Fetch */
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <ProductCardSkeleton key={index} />
                    ))}
                  </div>
                ) : productsList.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-20 bg-[#F0D8A1]/30 rounded-none border border-dashed border-[#A47251]/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.2}
                      stroke="currentColor"
                      className="mx-auto w-12 h-12 text-[#2A1E17]/40 mb-4"
                    >
                      <path
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                      />
                    </svg>
                    <h3 className="text-lg font-serif font-bold text-[#2A1E17] mb-1">No items found</h3>
                    <p className="text-sm text-[#2A1E17]/70 max-w-xs mx-auto">
                      We couldn&apos;t find any treats matching your set criteria. Try adjusting or clearing filters!
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-6 inline-block rounded-none bg-[#A47251] text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer"
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
                      <div className="flex items-center justify-center space-x-2 mt-16 pt-8 border-t border-[#A47251]/5">
                        {/* Prev Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          aria-label="Previous Page"
                          className="flex h-10 w-10 items-center justify-center rounded-none border border-[#A47251]/10 bg-white text-[#2A1E17] transition-all hover:border-[#DD9E59] hover:bg-[#F0D8A1] disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#A47251]/10 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M15.75 19.5 8.25 12l7.5-7.5" />
                          </svg>
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, index) => {
                          const pageNum = index + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`flex h-10 w-10 items-center justify-center rounded-none text-xs font-bold tracking-wider transition-all cursor-pointer ${
                                currentPage === pageNum
                                  ? "bg-[#A47251] text-white shadow-sm"
                                  : "border border-[#A47251]/10 bg-white text-[#2A1E17] hover:border-[#DD9E59] hover:bg-[#F0D8A1]"
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
                          className="flex h-10 w-10 items-center justify-center rounded-none border border-[#A47251]/10 bg-white text-[#2A1E17] transition-all hover:border-[#DD9E59] hover:bg-[#F0D8A1] disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#A47251]/10 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path strokeLinecap="square" strokeLinejoin="miter" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
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
            className="fixed inset-0 bg-[#A47251]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-[#FDF9F0] py-6 px-6 shadow-xl transition-all">
            <div className="flex items-center justify-between border-b border-[#A47251]/5 pb-4 mb-6">
              <h2 className="font-serif text-lg font-bold text-[#2A1E17]">Filter Treats</h2>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="rounded-none p-1.5 text-[#2A1E17] hover:bg-[#A47251]/5 transition-colors cursor-pointer"
              >
                <span className="sr-only">Close menu</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Filters Panel */}
            <div className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">Search</h4>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search treats..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full bg-[#F0D8A1] border border-[#A47251]/10 rounded-none py-2 pl-9 pr-3 text-xs text-[#2A1E17] placeholder-[#2A1E17]/50 focus:outline-none focus:border-[#DD9E59] transition-all"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="absolute left-3 top-2.5 w-4 h-4 text-[#2A1E17]/60"
                  >
                    <path strokeLinecap="square" strokeLinejoin="miter" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">Category</h4>
                <div className="grid grid-cols-2 gap-2">
                  {dbCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`text-center text-xs py-2 px-3 rounded-none border transition-all ${
                        selectedCategory === category
                          ? "bg-[#A47251] text-white border-[#A47251]"
                          : "bg-[#F0D8A1] border-[#A47251]/5 text-[#2A1E17]/85 hover:bg-[#A47251]/5"
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
                        : category.endsWith("s")
                        ? category
                        : category + "s"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">Price Range</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                    className="w-1/2 bg-[#F0D8A1] border border-[#A47251]/10 rounded-none p-2 text-xs text-center text-[#2A1E17]"
                  />
                  <span className="text-[#2A1E17]/40 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                    className="w-1/2 bg-[#F0D8A1] border border-[#A47251]/10 rounded-none p-2 text-xs text-center text-[#2A1E17]"
                  />
                </div>
              </div>

              {/* Ratings */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">Minimum Rating</h4>
                <div className="flex flex-col space-y-1">
                  {[4.9, 4.8, 4.7, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => { setMinRating(minRating === rating ? null : rating); setCurrentPage(1); }}
                      className={`flex items-center text-xs py-2 px-3 rounded-none border text-left ${
                        minRating === rating
                          ? "bg-[#A47251] text-white border-[#A47251]"
                          : "bg-[#F0D8A1] border-[#A47251]/5 text-[#2A1E17]/85"
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
                  className="rounded border-[#A47251]/10 text-[#DD9E59] focus:ring-[#DD9E59] h-4 w-4 bg-[#F0D8A1]"
                />
                <label htmlFor="only-bestsellers-mobile" className="text-xs font-bold text-[#2A1E17]/85">
                  Bestsellers Only
                </label>
              </div>

              <div className="flex space-x-2 pt-6 border-t border-[#A47251]/5">
                <button
                  onClick={resetFilters}
                  className="w-1/2 border border-[#A47251]/25 text-[#2A1E17] rounded-none py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#F0D8A1] cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-1/2 bg-[#A47251] text-white rounded-none py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Custom Creation Request Modal */}
      {isCustomOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#A47251]/60 backdrop-blur-xs transition-opacity"
            onClick={() => { if (!isCustomSubmitting) setIsCustomOrderOpen(false); }}
          />

          {/* Modal Container */}
          <div className="relative bg-[#FDF9F0] w-full max-w-2xl border-2 border-[#A47251]/20 shadow-2xl p-6 sm:p-8 z-50 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsCustomOrderOpen(false)}
              disabled={isCustomSubmitting}
              className="absolute top-4 right-4 text-[#2A1E17] hover:text-[#DD9E59] disabled:opacity-50 cursor-pointer p-1 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {customSuccessId ? (
              <div className="text-center py-10 space-y-6 animate-fade-in">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#DCF0C3] text-[#2A1E17] border border-[#DCF0C3]">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1E17]">Custom Request Submitted!</h3>
                  <div className="h-1 w-12 bg-[#DD9E59] mx-auto" />
                </div>
                <p className="text-xs sm:text-sm text-[#2A1E17]/80 leading-relaxed max-w-md mx-auto">
                  Your custom design request has been logged successfully as Order ID: <strong className="font-mono">{customSuccessId}</strong>. 
                  Our bakers will review your reference image and details and get back to you via phone or email within 24 hours with a custom quotation.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomOrderOpen(false);
                    setCustomSuccessId(null);
                  }}
                  className="rounded-none bg-[#A47251] text-white py-3 px-8 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer min-w-32"
                >
                  Got It
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#DD9E59]">Custom Creations</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1E17] tracking-tight">Request a Custom Order</h2>
                  <div className="h-0.5 w-12 bg-[#DD9E59] mt-2" />
                </div>

                {customError && (
                  <div className="bg-red-50 border border-red-250 text-red-750 p-3.5 text-xs font-semibold">
                    {customError}
                  </div>
                )}

                <form onSubmit={handlePlaceCustomOrder} className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]/60 border-b border-[#A47251]/10 pb-1">
                      1. Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#FDF9F0] border border-[#A47251]/10 rounded-none px-3.5 py-2.5 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#FDF9F0] border border-[#A47251]/10 rounded-none px-3.5 py-2.5 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +94 77 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#FDF9F0] border border-[#A47251]/10 rounded-none px-3.5 py-2.5 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]/60 border-b border-[#A47251]/10 pb-1">
                      2. Cake Specifications
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Size / Weight *</label>
                        <select
                          value={cakeSize}
                          onChange={(e) => setCakeSize(e.target.value)}
                          className="w-full bg-white border border-[#A47251]/10 rounded-none px-3.5 py-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer"
                        >
                          {availableSizes.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                          <option value="Custom / Multi-tier">Custom / Multi-tier</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Flavor Choice *</label>
                        <select
                          value={cakeFlavor}
                          onChange={(e) => setCakeFlavor(e.target.value)}
                          className="w-full bg-white border border-[#A47251]/10 rounded-none px-3.5 py-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer"
                        >
                          {availableFlavors.map((flavor) => (
                            <option key={flavor} value={flavor}>{flavor}</option>
                          ))}
                          <option value="Custom Flavor">Custom Flavor (specify below)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Icing Choice *</label>
                        <select
                          value={cakeIcing}
                          onChange={(e) => setCakeIcing(e.target.value)}
                          className="w-full bg-white border border-[#A47251]/10 rounded-none px-3.5 py-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer"
                        >
                          {availableIcings.map((icing) => (
                            <option key={icing} value={icing}>{icing}</option>
                          ))}
                          <option value="Custom Cream">Custom / Other (specify below)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Reference Image */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]/60 border-b border-[#A47251]/10 pb-1">
                      3. Design Reference Image
                    </h4>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                        Upload Sample Image *
                      </label>
                      <input
                        type="file"
                        required
                        accept="image/*"
                        onChange={handleCustomImageUpload}
                        className="w-full text-xs text-[#2A1E17]/70 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-none file:border file:border-[#A47251]/10 file:text-[10px] file:font-bold file:bg-white file:text-[#2A1E17] file:hover:bg-[#DD9E59] hover:file:text-[#2A1E17] transition-colors cursor-pointer"
                      />
                      {customSampleImage && (
                        <div className="relative h-28 w-28 rounded-none overflow-hidden border border-[#A47251]/10 bg-white mt-2">
                          <img src={customSampleImage} alt="Sample reference preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fulfillment Details */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]/60 border-b border-[#A47251]/10 pb-1">
                      4. Delivery & Schedule
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-6">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={deliveryType === "pickup"}
                            onChange={() => setDeliveryType("pickup")}
                            className="h-4 w-4 border-[#A47251]/20 text-[#DD9E59] focus:ring-[#DD9E59] accent-[#DD9E59]"
                          />
                          <span className="ml-2 text-xs font-bold uppercase tracking-wider text-[#2A1E17]">Store Pickup</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            checked={deliveryType === "delivery"}
                            onChange={() => setDeliveryType("delivery")}
                            className="h-4 w-4 border-[#A47251]/20 text-[#DD9E59] focus:ring-[#DD9E59] accent-[#DD9E59]"
                          />
                          <span className="ml-2 text-xs font-bold uppercase tracking-wider text-[#2A1E17]">Home Delivery</span>
                        </label>
                      </div>

                      {deliveryType === "pickup" ? (
                        <div className="space-y-3 p-4 bg-[#F0D8A1]/20 border border-[#A47251]/5 rounded-none animate-fade-in">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Select Branch *</label>
                            <select
                              value={pickupBranch}
                              onChange={(e) => setPickupBranch(e.target.value)}
                              className="w-full bg-white border border-[#A47251]/10 rounded-none px-3.5 py-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer"
                            >
                              <option value="Main Bakery - Colombo 07">Main Bakery - Colombo 07</option>
                              <option value="City Outlet - Kandy">City Outlet - Kandy</option>
                              <option value="Coastal Hub - Galle">Coastal Hub - Galle</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F0D8A1]/20 border border-[#A47251]/5 rounded-none animate-fade-in">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Delivery Address *</label>
                            <textarea
                              required
                              rows={2}
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              className="w-full bg-[#FDF9F0] border border-[#A47251]/10 rounded-none px-3.5 py-2 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] resize-none"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">City *</label>
                            <input
                              type="text"
                              required
                              value={deliveryCity}
                              onChange={(e) => setDeliveryCity(e.target.value)}
                              className="w-full bg-[#FDF9F0] border border-[#A47251]/10 rounded-none px-3.5 py-2.5 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59]"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Required Date *</label>
                          <input
                            type="date"
                            required
                            min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                            value={requiredDate}
                            onChange={(e) => setRequiredDate(e.target.value)}
                            className="w-full bg-[#FDF9F0] border border-[#A47251]/10 rounded-none px-3.5 py-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59]"
                          />
                          <span className="text-[9px] text-[#2A1E17]/55 font-semibold block">Minimum 3 days notice required</span>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Required Time *</label>
                          <input
                            type="time"
                            required
                            value={requiredTime}
                            onChange={(e) => setRequiredTime(e.target.value)}
                            className="w-full bg-[#FDF9F0] border border-[#A47251]/10 rounded-none px-3.5 py-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]/60 border-b border-[#A47251]/10 pb-1">
                      5. Theme & Special Instructions
                    </h4>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Design Instructions / Customization notes *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Mention colors, theme text, name to be written, flavor customizations, etc."
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full bg-[#FDF9F0] border border-[#A47251]/20 rounded-none p-3.5 text-xs sm:text-sm text-[#2A1E17] placeholder-[#2A1E17]/40 focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59] transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-4 border-t border-[#A47251]/10 flex items-center justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsCustomOrderOpen(false)}
                      disabled={isCustomSubmitting}
                      className="px-6 py-3 rounded-none text-xs font-bold uppercase tracking-wider text-[#2A1E17] hover:bg-[#F0D8A1]/50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCustomSubmitting}
                      className="rounded-none bg-[#A47251] text-white py-3 px-8 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] disabled:opacity-50 transition-all cursor-pointer min-w-40 flex items-center justify-center"
                    >
                      {isCustomSubmitting ? (
                        <span className="inline-block h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        "Submit Custom Request"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
