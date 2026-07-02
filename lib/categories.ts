import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { seedAllCollectionsIfEmpty } from "./db-seed";

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

/**
 * Fetch all categories from Firestore ordered alphabetically.
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    await seedAllCollectionsIfEmpty();
    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    const list: Category[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: data.id,
        name: data.name,
        subcategories: data.subcategories || [],
      });
    });
    return list;
  } catch (error) {
    console.error("Error fetching categories from Firestore:", error);
    return [];
  }
}

/**
 * Save or update a category document in Firestore.
 */
export async function saveCategory(category: Category): Promise<boolean> {
  try {
    const docRef = doc(db, "categories", category.id);
    await setDoc(docRef, category);
    return true;
  } catch (error) {
    console.error(`Error saving category ${category.id}:`, error);
    return false;
  }
}

/**
 * Delete a category document from Firestore.
 */
export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, "categories", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    return false;
  }
}
