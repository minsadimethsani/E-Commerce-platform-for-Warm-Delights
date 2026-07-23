import "../lib/load-env";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import fs from "fs";
import path from "path";

async function exportProducts() {
  try {
    console.log("Fetching products from Firestore...");
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    if (snapshot.empty) {
      console.log("Firestore products collection is empty.");
      return;
    }
    const products: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: data.id || doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        badge: data.badge || undefined,
        category: data.category,
        rating: data.rating,
        reviewsCount: data.reviewsCount,
        videoUrl: data.videoUrl || undefined,
        isAvailable: data.isAvailable !== false,
        variants: data.variants || undefined,
        sizes: data.sizes || undefined,
        flavors: data.flavors || undefined,
        icings: data.icings || undefined,
        defaultSize: data.defaultSize || undefined,
        defaultFlavor: data.defaultFlavor || undefined,
        defaultIcing: data.defaultIcing || undefined,
      });
    });

    products.sort((a, b) => {
      const numA = parseInt(a.id.replace("prod-", ""), 10) || 0;
      const numB = parseInt(b.id.replace("prod-", ""), 10) || 0;
      return numA - numB;
    });

    console.log(`Found ${products.length} products in Firestore.`);
    
    const content = `export interface ProductVariant {
  name: string;
  price: number;
  isAvailable?: boolean;
}

export interface ProductSize {
  name: string;
  price: number;
  priceMultiplier?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
  category: string;
  rating: number;
  reviewsCount: number;
  videoUrl?: string;
  isAvailable?: boolean;
  variants?: ProductVariant[];
  sizes?: ProductSize[];
  flavors?: (string | { name: string; price: number })[];
  icings?: (string | { name: string; price: number })[];
  defaultSize?: string;
  defaultFlavor?: string;
  defaultIcing?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const products: Product[] = ${JSON.stringify(products, null, 2)};
`;

    fs.writeFileSync(path.join(process.cwd(), "data", "products.ts"), content, "utf-8");
    console.log("Successfully updated data/products.ts with Firestore data!");
  } catch (error) {
    console.error("Error exporting products:", error);
  }
}

exportProducts();
