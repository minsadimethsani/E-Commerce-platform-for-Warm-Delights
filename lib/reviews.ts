import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { Review } from "@/types/database";

/**
 * Fetch all customer reviews from Firestore sorted by creation date descending.
 */
export async function getAllReviews(): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const list: Review[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: data.id,
        productId: data.productId,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.createdAt,
      } as Review);
    });
    return list;
  } catch (error) {
    console.error("Error fetching reviews from Firestore:", error);
    return [];
  }
}
