import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export interface AddOn {
  id: string;
  name: string;
  fee: number;
  desc: string;
}

/**
 * Fetch all optional add-ons from Firestore ordered alphabetically by name.
 */
export async function getAllAddOns(): Promise<AddOn[]> {
  try {
    const addonsRef = collection(db, "addons");
    const q = query(addonsRef, orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    const list: AddOn[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: data.id,
        name: data.name,
        fee: data.fee,
        desc: data.desc || "",
      });
    });
    return list;
  } catch (error) {
    console.error("Error fetching add-ons from Firestore:", error);
    return [];
  }
}

/**
 * Save or update an add-on document in Firestore.
 */
export async function saveAddOn(addon: AddOn): Promise<boolean> {
  try {
    const docRef = doc(db, "addons", addon.id);
    await setDoc(docRef, addon);
    return true;
  } catch (error) {
    console.error(`Error saving add-on ${addon.id}:`, error);
    return false;
  }
}

/**
 * Delete an add-on document from Firestore.
 */
export async function deleteAddOn(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, "addons", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting add-on ${id}:`, error);
    return false;
  }
}
