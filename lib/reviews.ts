import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "./firebase";
import { Review } from "@/types/database";

/**
 * Fetch all customer reviews from Firestore sorted by creation date descending.
 * Converts Timestamp objects to plain ISO strings for React Server Component serialization.
 */
export async function getAllReviews(): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const list: Review[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const dateStr = data.createdAt?.toDate 
        ? data.createdAt.toDate().toISOString() 
        : (typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString());

      list.push({
        id: data.id,
        productId: data.productId,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        comment: data.comment,
        createdAt: dateStr as any,
      });
    });
    return list;
  } catch (error) {
    console.error("Error fetching reviews from Firestore:", error);
    return [];
  }
}

/**
 * Fetch reviews associated with a specific product ID.
 * Performs filter in Firestore, and sorts in memory to avoid composite index requirements.
 * Converts Timestamp objects to plain ISO strings for serialization.
 */
export async function getReviewsByProductId(productId: string): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("productId", "==", productId));
    const snapshot = await getDocs(q);
    const list: Review[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const dateStr = data.createdAt?.toDate 
        ? data.createdAt.toDate().toISOString() 
        : (typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString());

      list.push({
        id: data.id,
        productId: data.productId,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        comment: data.comment,
        createdAt: dateStr as any,
      });
    });

    // In-memory sort: newest reviews first
    return list.sort((a, b) => {
      const dateA = new Date(a.createdAt as any).getTime();
      const dateB = new Date(b.createdAt as any).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return [];
  }
}
