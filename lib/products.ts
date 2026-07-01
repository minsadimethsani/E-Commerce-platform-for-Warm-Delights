import { products as localProducts, Product } from "@/data/products";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { seedAllCollectionsIfEmpty } from "./db-seed";
import { unstable_cache } from "next/cache";

export interface FilterParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  onlyBestsellers?: boolean;
  sortBy?: "featured" | "price-asc" | "price-desc" | "rating-desc";
  page?: number;
  limit?: number;
}

export interface PaginatedResult {
  products: Product[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

/**
 * Fetch all products from Firestore, executing a seed check first for all collections.
 * Safely falls back to local data if Firestore is unreachable or errors.
 */
const fetchProductsFromDb = async (): Promise<Product[]> => {
  try {
    // Triggers check for all collections (products, users, orders, reviews)
    await seedAllCollectionsIfEmpty();
    
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      return localProducts;
    }

    const list: Product[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        category: data.category,
        badge: data.badge || undefined,
        rating: data.rating,
        reviewsCount: data.reviewsCount,
        isAvailable: data.isAvailable !== false,
        ingredients: data.ingredients || [],
        careInstructions: data.careInstructions || "",
      } as any);
    });

    // Sort by ID order for display consistency
    return list.sort((a, b) => {
      const numA = parseInt(a.id.replace("prod-", ""), 10) || 0;
      const numB = parseInt(b.id.replace("prod-", ""), 10) || 0;
      return numA - numB;
    });
  } catch (error) {
    console.error("Error fetching products from Firestore. Falling back to local data.", error);
    return localProducts;
  }
};

/**
 * Next.js cached data wrapper for Firestore list query.
 * Revalidates every 5 minutes (300 seconds).
 */
export const getCachedProducts = unstable_cache(
  async () => {
    return fetchProductsFromDb();
  },
  ["products-list"],
  {
    revalidate: 300,
    tags: ["products"]
  }
);

/**
 * Get all products in the database (via server-side cache)
 */
export async function getAllProducts(): Promise<Product[]> {
  return getCachedProducts();
}

/**
 * Get a single product by its unique ID (via server-side cache)
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  const allProducts = await getCachedProducts();
  return allProducts.find((p) => p.id === id);
}

/**
 * Filter, sort, and paginate products based on query parameters.
 * Operates on the server-cached Firestore dataset.
 */
export async function getFilteredProducts(filters: FilterParams): Promise<PaginatedResult> {
  const allProducts = await getCachedProducts();
  let result = [...allProducts];

  const {
    category = "All",
    search = "",
    minPrice,
    maxPrice,
    minRating,
    onlyBestsellers = false,
    sortBy = "featured",
    page = 1,
    limit = 8,
  } = filters;

  // 1. Filter by category
  if (category !== "All" && category.trim() !== "") {
    result = result.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // 2. Filter by search query (case-insensitive substring match)
  if (search.trim() !== "") {
    const queryStr = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(queryStr) ||
        p.description.toLowerCase().includes(queryStr)
    );
  }

  // 3. Filter by min price
  if (minPrice !== undefined && !isNaN(minPrice)) {
    result = result.filter((p) => p.price >= minPrice);
  }

  // 4. Filter by max price
  if (maxPrice !== undefined && !isNaN(maxPrice)) {
    result = result.filter((p) => p.price <= maxPrice);
  }

  // 5. Filter by rating
  if (minRating !== undefined && !isNaN(minRating)) {
    result = result.filter((p) => p.rating >= minRating);
  }

  // 6. Filter by bestseller badge
  if (onlyBestsellers) {
    result = result.filter(
      (p) =>
        p.badge?.toLowerCase() === "bestseller" ||
        p.badge?.toLowerCase() === "best seller"
    );
  }

  // 7. Sort
  if (sortBy === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating-desc") {
    result.sort((a, b) => b.rating - a.rating);
  }

  // 8. Pagination
  const total = result.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const sanitizedPage = Math.max(1, Math.min(page, totalPages));
  
  const startIndex = (sanitizedPage - 1) * limit;
  const paginatedProducts = result.slice(startIndex, startIndex + limit);

  return {
    products: paginatedProducts,
    total,
    totalPages,
    page: sanitizedPage,
    limit,
  };
}
