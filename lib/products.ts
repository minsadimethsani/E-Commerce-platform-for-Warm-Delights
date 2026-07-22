import { products as localProducts, Product } from "@/data/products";
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, getCountFromServer } from "firebase/firestore";
import { db, runWithTimeout } from "./firebase";

export interface FilterParams {
  category?: string;
  subcategory?: string;
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
 * Helper to convert a Firestore Timestamp (or any date/timestamp representation)
 * to a plain serializable { seconds, nanoseconds } object.
 */
export function toSerializableTimestamp(timestamp: any) {
  if (!timestamp) return null;
  if (typeof timestamp.toMillis === "function") {
    return {
      seconds: timestamp.seconds,
      nanoseconds: timestamp.nanoseconds,
    };
  }
  if (typeof timestamp.seconds === "number" && typeof timestamp.nanoseconds === "number") {
    return {
      seconds: timestamp.seconds,
      nanoseconds: timestamp.nanoseconds,
    };
  }
  // Try parsing as date
  const ms = new Date(timestamp).getTime();
  if (!isNaN(ms)) {
    return {
      seconds: Math.floor(ms / 1000),
      nanoseconds: (ms % 1000) * 1000000,
    };
  }
  return null;
}

/**
 * Extract millisecond values from various timestamp representations for sorting.
 */
export function getTimestampMillis(ts: any): number {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") {
    return ts.toMillis();
  }
  if (typeof ts.seconds === "number") {
    return ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1000000);
  }
  const parsed = new Date(ts).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Helper to sort products by latest added (createdAt descending),
 * falling back to numeric ID descending.
 */
export function sortProductsByLatest(productsList: Product[]): Product[] {
  return [...productsList].sort((a, b) => {
    const timeA = getTimestampMillis(a.createdAt);
    const timeB = getTimestampMillis(b.createdAt);

    if (timeB !== timeA) {
      return timeB - timeA;
    }

    const numA = parseInt(a.id.replace("prod-", ""), 10) || 0;
    const numB = parseInt(b.id.replace("prod-", ""), 10) || 0;
    return numB - numA;
  });
}


/**
 * Get all products directly from Firestore, sorted by latest added.
 * Falls back to local data if Firestore fails.
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await runWithTimeout(getDocs(productsRef), 15000);
    
    if (snapshot.empty) {
      return [];
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
        subcategory: data.subcategory || "",
        badge: data.badge || undefined,
        rating: data.rating,
        reviewsCount: data.reviewsCount,
        isAvailable: data.isAvailable !== false,
        ingredients: data.ingredients || [],
        careInstructions: data.careInstructions || "",
        images: data.images || [],
        videoUrl: data.videoUrl !== undefined ? data.videoUrl : (localProducts.find((lp) => lp.id === data.id)?.videoUrl || ""),
        variants: data.variants || [],
        sizes: data.sizes || [],
        flavors: data.flavors || [],
        icings: data.icings || [],
        defaultSize: data.defaultSize || "",
        defaultFlavor: data.defaultFlavor || "",
        defaultIcing: data.defaultIcing || "",
        createdAt: toSerializableTimestamp(data.createdAt),
        updatedAt: toSerializableTimestamp(data.updatedAt),
      } as any);
    });
    return sortProductsByLatest(list);
  } catch (error) {
    console.error("Error fetching all products from Firestore. Falling back to local data.", error);
    return sortProductsByLatest(localProducts);
  }
}

/**
 * Get a single product by ID directly from Firestore.
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await runWithTimeout(getDoc(docRef), 15000);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        category: data.category,
        subcategory: data.subcategory || "",
        badge: data.badge || undefined,
        rating: data.rating,
        reviewsCount: data.reviewsCount,
        isAvailable: data.isAvailable !== false,
        ingredients: data.ingredients || [],
        careInstructions: data.careInstructions || "",
        images: data.images || [],
        videoUrl: data.videoUrl !== undefined ? data.videoUrl : (localProducts.find((lp) => lp.id === data.id)?.videoUrl || ""),
        variants: data.variants || [],
        sizes: data.sizes || [],
        flavors: data.flavors || [],
        icings: data.icings || [],
        defaultSize: data.defaultSize || "",
        defaultFlavor: data.defaultFlavor || "",
        defaultIcing: data.defaultIcing || "",
        createdAt: toSerializableTimestamp(data.createdAt),
        updatedAt: toSerializableTimestamp(data.updatedAt),
      } as any;
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching product ${id} from Firestore. Falling back to local check.`, error);
    return localProducts.find((p) => p.id === id);
  }
}

/**
 * Filter, sort, and paginate products using database-level Firestore queries.
 * Utilizes server-side count queries for low-cost metadata retrieval.
 */
export async function getFilteredProducts(filters: FilterParams): Promise<PaginatedResult> {
  try {
    const productsRef = collection(db, "products");
    const constraints: any[] = [where("isAvailable", "==", true)];

    const {
      category = "All",
      subcategory = "",
      search = "",
      minPrice,
      maxPrice,
      minRating,
      onlyBestsellers = false,
      sortBy = "featured",
      page = 1,
      limit: limitVal = 8,
    } = filters;

    // 1. Category Filter (Equality)
    if (category !== "All" && category.trim() !== "") {
      constraints.push(where("category", "==", category));
    }

    // Subcategory Filter (Equality)
    if (subcategory && subcategory.trim() !== "") {
      constraints.push(where("subcategory", "==", subcategory.trim()));
    }

    // 2. Bestseller Filter (Equality/In)
    if (onlyBestsellers) {
      constraints.push(where("badge", "in", ["Bestseller", "Best Seller"]));
    }

    // 3. Search Prefix (Inequality)
    // Uses the nameLowercase field to support case-insensitive prefix searches
    if (search.trim() !== "") {
      const searchLower = search.trim().toLowerCase();
      constraints.push(where("nameLowercase", ">=", searchLower));
      constraints.push(where("nameLowercase", "<=", searchLower + "\uf8ff"));
    }

    // 4. Price & Rating range Filters (Inequality)
    if (minPrice !== undefined && !isNaN(minPrice)) {
      constraints.push(where("price", ">=", minPrice));
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      constraints.push(where("price", "<=", maxPrice));
    }
    if (minRating !== undefined && !isNaN(minRating)) {
      constraints.push(where("rating", ">=", minRating));
    }

    // 5. Query Ordering (To comply with Firestore inequality restrictions)
    if (search.trim() !== "") {
      constraints.push(orderBy("nameLowercase", "asc"));
    } else if (minPrice !== undefined || maxPrice !== undefined) {
      constraints.push(orderBy("price", sortBy === "price-desc" ? "desc" : "asc"));
    } else if (minRating !== undefined) {
      constraints.push(orderBy("rating", "desc"));
    } else {
      if (sortBy === "price-asc") {
        constraints.push(orderBy("price", "asc"));
      } else if (sortBy === "price-desc") {
        constraints.push(orderBy("price", "desc"));
      } else if (sortBy === "rating-desc") {
        constraints.push(orderBy("rating", "desc"));
      } else {
        constraints.push(orderBy("id", "asc"));
      }
    }

    // 6. Execute Count Query on Server (Extremely cheap: 1 document read per 1,000 counted)
    const countQuery = query(productsRef, ...constraints);
    const countSnapshot = await runWithTimeout(getCountFromServer(countQuery), 15000);
    const total = countSnapshot.data().count;

    // 7. Execute Data Query (Paginating up to page * limit to resolve page lists)
    const maxFetchCount = page * limitVal;
    const dataQuery = query(productsRef, ...constraints, limit(maxFetchCount));
    const snapshot = await runWithTimeout(getDocs(dataQuery), 15000);

    const allFetched: Product[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      allFetched.push({
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        category: data.category,
        subcategory: data.subcategory || "",
        badge: data.badge || undefined,
        rating: data.rating,
        reviewsCount: data.reviewsCount,
        isAvailable: data.isAvailable !== false,
        ingredients: data.ingredients || [],
        careInstructions: data.careInstructions || "",
        images: data.images || [],
        videoUrl: data.videoUrl !== undefined ? data.videoUrl : (localProducts.find((lp) => lp.id === data.id)?.videoUrl || ""),
        variants: data.variants || [],
        sizes: data.sizes || [],
        flavors: data.flavors || [],
        icings: data.icings || [],
        defaultSize: data.defaultSize || "",
        defaultFlavor: data.defaultFlavor || "",
        defaultIcing: data.defaultIcing || "",
      } as any);
    });

    // In-memory sort fallback if search / inequality sorting took precedence over requested sorting
    if (search.trim() !== "" || minRating !== undefined) {
      if (sortBy === "price-asc") {
        allFetched.sort((a, b) => a.price - b.price);
      } else if (sortBy === "price-desc") {
        allFetched.sort((a, b) => b.price - a.price);
      } else if (sortBy === "rating-desc") {
        allFetched.sort((a, b) => b.rating - a.rating);
      }
    }

    // Slice for page index offsets
    const totalPages = Math.ceil(total / limitVal) || 1;
    const sanitizedPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (sanitizedPage - 1) * limitVal;
    const paginatedProducts = allFetched.slice(startIndex, startIndex + limitVal);

    return {
      products: paginatedProducts,
      total,
      totalPages,
      page: sanitizedPage,
      limit: limitVal,
    };
  } catch (error) {
    console.error("Firestore filtered query failed. Falling back to in-memory filtering of Firestore products.", error);
    
    // Fallback to filtering all Firestore products in memory
    let result = await getAllProducts();
    const { category = "All", subcategory = "", search = "", minPrice, maxPrice, minRating, onlyBestsellers = false, sortBy = "featured", page = 1, limit: limitVal = 8 } = filters;

    result = result.filter((p) => p.isAvailable);

    if (category !== "All" && category.trim() !== "") {
      result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (subcategory && subcategory.trim() !== "") {
      result = result.filter((p) => (p as any).subcategory?.toLowerCase() === subcategory.trim().toLowerCase());
    }
    if (search.trim() !== "") {
      const qStr = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(qStr) || p.description.toLowerCase().includes(qStr) || (p as any).subcategory?.toLowerCase().includes(qStr));
    }
    if (minPrice !== undefined && !isNaN(minPrice)) result = result.filter((p) => p.price >= minPrice);
    if (maxPrice !== undefined && !isNaN(maxPrice)) result = result.filter((p) => p.price <= maxPrice);
    if (minRating !== undefined && !isNaN(minRating)) result = result.filter((p) => p.rating >= minRating);
    if (onlyBestsellers) {
      result = result.filter((p) => p.badge?.toLowerCase() === "bestseller" || p.badge?.toLowerCase() === "best seller");
    }
    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating-desc") result.sort((a, b) => b.rating - a.rating);

    const total = result.length;
    const totalPages = Math.ceil(total / limitVal) || 1;
    const sanitizedPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (sanitizedPage - 1) * limitVal;
    
    return {
      products: result.slice(startIndex, startIndex + limitVal),
      total,
      totalPages,
      page: sanitizedPage,
      limit: limitVal,
    };
  }
}
