import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export interface Reel {
  id: string;
  videoUrl: string;
  posterUrl?: string;
  title: string;
  createdAt: any;
}

/**
 * Fetch all reel videos from Firestore ordered by createdAt descending.
 */
export async function getAllReels(): Promise<Reel[]> {
  try {
    const reelsRef = collection(db, "reels");
    const q = query(reelsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const list: Reel[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        videoUrl: data.videoUrl,
        posterUrl: data.posterUrl || "",
        title: data.title || "",
        createdAt: data.createdAt,
      });
    });
    return list;
  } catch (error) {
    console.error("Error fetching reels from Firestore:", error);
    return [];
  }
}

/**
 * Save or update a reel document in Firestore.
 */
export async function saveReel(reel: Reel): Promise<boolean> {
  try {
    const docRef = doc(db, "reels", reel.id);
    await setDoc(docRef, reel);
    return true;
  } catch (error) {
    console.error(`Error saving reel ${reel.id}:`, error);
    return false;
  }
}

/**
 * Delete a reel document from Firestore.
 */
export async function deleteReel(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, "reels", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting reel ${id}:`, error);
    return false;
  }
}
