import { cache } from "react";
import { collection, getDocs, query, orderBy, where, doc, setDoc, deleteDoc, limit } from "firebase/firestore";
import { db } from "./firebase";
import { Review } from "@/types/database";

/**
 * Fetch all customer reviews from Firestore sorted by creation date descending.
 * Converts Timestamp objects to plain ISO strings for React Server Component serialization.
 */
export const getAllReviews = cache(async function getAllReviews(): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"), limit(20));
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
});

/**
 * Fetch reviews associated with a specific product ID.
 * Performs filter in Firestore, and sorts in memory to avoid composite index requirements.
 * Converts Timestamp objects to plain ISO strings for serialization.
 */
export const getReviewsByProductId = cache(async function getReviewsByProductId(productId: string): Promise<Review[]> {
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
});

/**
 * Create a new review in Firestore.
 * Automatically generates a unique ID, writes to Firestore, and returns the serialized review.
 */
export async function addReview(review: Omit<Review, "id" | "createdAt">): Promise<Review> {
  const reviewsRef = collection(db, "reviews");
  const newDocRef = doc(reviewsRef);
  const dateNow = new Date();
  
  const newReview: Review = {
    id: newDocRef.id,
    productId: review.productId,
    userId: review.userId,
    userName: review.userName,
    rating: review.rating,
    comment: review.comment,
    createdAt: dateNow as any, // Stored as Date/Timestamp in Firestore
  };

  await setDoc(newDocRef, newReview);

  // Return with serialized createdAt ISO string
  return {
    ...newReview,
    createdAt: dateNow.toISOString() as any,
  };
}

/**
 * Delete a review from Firestore by document ID.
 */
export async function deleteReview(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, "reviews", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting review ${id}:`, error);
    return false;
  }
}
