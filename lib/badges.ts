import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export interface Badge {
  id: string;
  name: string;
}

/**
 * Fetch all promo badges from Firestore ordered alphabetically.
 */
export async function getAllBadges(): Promise<Badge[]> {
  try {
    const badgesRef = collection(db, "badges");
    const q = query(badgesRef, orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    const list: Badge[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: data.id,
        name: data.name,
      });
    });
    return list;
  } catch (error) {
    console.error("Error fetching badges from Firestore:", error);
    return [];
  }
}

/**
 * Save or update a badge document in Firestore.
 */
export async function saveBadge(badge: Badge): Promise<boolean> {
  try {
    const docRef = doc(db, "badges", badge.id);
    await setDoc(docRef, badge);
    return true;
  } catch (error) {
    console.error(`Error saving badge ${badge.id}:`, error);
    return false;
  }
}

/**
 * Delete a badge document from Firestore.
 */
export async function deleteBadge(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, "badges", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting badge ${id}:`, error);
    return false;
  }
}
