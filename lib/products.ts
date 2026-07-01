import { products, Product } from "@/data/products";

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
 * Get all products in the database
 */
export async function getAllProducts(): Promise<Product[]> {
  return products;
}

/**
 * Get a single product by its unique ID
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  return products.find((p) => p.id === id);
}

/**
 * Filter, sort, and paginate products based on query parameters.
 * Emulates a database query on the server side.
 */
export async function getFilteredProducts(filters: FilterParams): Promise<PaginatedResult> {
  let result = [...products];

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

  // 2. Filter by search query
  if (search.trim() !== "") {
    const query = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
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
