"use client";

import { useState, useEffect } from "react";
import { Category } from "@/lib/categories";
import { Badge } from "@/lib/badges";
import { doc, setDoc, deleteDoc, collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface CategoriesClientProps {
  initialCategories: Category[];
  initialBadges: Badge[];
}

export default function CategoriesClient({
  initialCategories,
  initialBadges,
}: CategoriesClientProps) {
  const { setIsMutating } = useAuth();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [badges, setBadges] = useState<Badge[]>(initialBadges);

  useEffect(() => {
    const categoriesRef = collection(db, "categories");
    const qCat = query(categoriesRef);
    const unsubscribeCat = onSnapshot(qCat, (snapshot) => {
      const list: Category[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name,
          subcategories: data.subcategories || [],
        } as Category);
      });
      // Sort alphabetically by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(list);
    }, (error) => {
      console.error("Firestore onSnapshot for categories failed:", error);
    });

    const badgesRef = collection(db, "badges");
    const qBadge = query(badgesRef);
    const unsubscribeBadge = onSnapshot(qBadge, (snapshot) => {
      const list: Badge[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name,
        } as Badge);
      });
      // Sort alphabetically by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      setBadges(list);
    }, (error) => {
      console.error("Firestore onSnapshot for badges failed:", error);
    });

    return () => {
      unsubscribeCat();
      unsubscribeBadge();
    };
  }, []);

  // New Category Input
  const [newCatName, setNewCatName] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  // New Subcategory Inputs (Mapped by Category ID)
  const [newSubcatNames, setNewSubcatNames] = useState<Record<string, string>>({});

  // New Badge Input
  const [newBadgeName, setNewBadgeName] = useState("");
  const [isAddingBadge, setIsAddingBadge] = useState(false);

  // Helper to slugify names
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsAddingCat(true);
    setIsMutating(true);
    try {
      const name = newCatName.trim();
      const id = slugify(name);

      if (categories.some((c) => c.id === id)) {
        alert("A category with this identifier already exists.");
        setIsAddingCat(false);
        setIsMutating(false);
        return;
      }

      const categoryPayload: Category = {
        id,
        name,
        subcategories: [],
      };

      await setDoc(doc(db, "categories", id), categoryPayload);
      setCategories((prev) => [...prev, categoryPayload].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCatName("");
    } catch (error) {
      console.error("Failed to add category:", error);
      alert("Error writing category to database.");
    } finally {
      setIsAddingCat(false);
      setIsMutating(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? All subcategories will also be deleted.")) {
      return;
    }

    setIsMutating(true);
    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      alert("Error deleting category from database.");
    } finally {
      setIsMutating(false);
    }
  };

  // Add Subcategory inline
  const handleAddSubcategory = async (catId: string) => {
    const subcatText = newSubcatNames[catId]?.trim();
    if (!subcatText) return;

    const targetCat = categories.find((c) => c.id === catId);
    if (!targetCat) return;

    if (targetCat.subcategories.includes(subcatText)) {
      alert("This subcategory already exists.");
      return;
    }

    setIsMutating(true);
    try {
      const updatedSubcategories = [...targetCat.subcategories, subcatText].sort();
      const docRef = doc(db, "categories", catId);
      
      await setDoc(docRef, {
        ...targetCat,
        subcategories: updatedSubcategories,
      });

      // Update state
      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? { ...c, subcategories: updatedSubcategories } : c))
      );

      // Clear input
      setNewSubcatNames((prev) => ({ ...prev, [catId]: "" }));
    } catch (error) {
      console.error("Failed to add subcategory:", error);
      alert("Error writing subcategory to database.");
    } finally {
      setIsMutating(false);
    }
  };

  // Delete Subcategory
  const handleDeleteSubcategory = async (catId: string, subcatText: string) => {
    const targetCat = categories.find((c) => c.id === catId);
    if (!targetCat) return;

    setIsMutating(true);
    try {
      const updatedSubcategories = targetCat.subcategories.filter((s) => s !== subcatText);
      const docRef = doc(db, "categories", catId);

      await setDoc(docRef, {
        ...targetCat,
        subcategories: updatedSubcategories,
      });

      // Update state
      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? { ...c, subcategories: updatedSubcategories } : c))
      );
    } catch (error) {
      console.error("Failed to delete subcategory:", error);
      alert("Error deleting subcategory from database.");
    } finally {
      setIsMutating(false);
    }
  };

  // Add Badge
  const handleAddBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeName.trim()) return;

    setIsAddingBadge(true);
    setIsMutating(true);
    try {
      const name = newBadgeName.trim();
      const id = slugify(name);

      if (badges.some((b) => b.id === id)) {
        alert("A badge with this name already exists.");
        setIsAddingBadge(false);
        setIsMutating(false);
        return;
      }

      const badgePayload: Badge = {
        id,
        name,
      };

      await setDoc(doc(db, "badges", id), badgePayload);
      setBadges((prev) => [...prev, badgePayload].sort((a, b) => a.name.localeCompare(b.name)));
      setNewBadgeName("");
    } catch (error) {
      console.error("Failed to add badge:", error);
      alert("Error writing badge to database.");
    } finally {
      setIsAddingBadge(false);
      setIsMutating(false);
    }
  };

  // Delete Badge
  const handleDeleteBadge = async (id: string) => {
    if (!confirm("Are you sure you want to delete this badge?")) {
      return;
    }

    setIsMutating(true);
    try {
      await deleteDoc(doc(db, "badges", id));
      setBadges((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error(`Failed to delete badge ${id}:`, error);
      alert("Error deleting badge from database.");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      {/* 1. Categories & Subcategories Manager (Left Panel) */}
      <section className="rounded-2xl border border-[#2A1E17]/5 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2A1E17]">Categories & Subcategories</h2>
          <p className="text-xs text-[#3A2E2B]/60 mt-1">
            Organize catalog filters and group products into matching subcategories.
          </p>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="e.g. Gluten-Free, Vegan"
            required
            className="flex-1 bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-lg p-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#C5A880]"
          />
          <button
            type="submit"
            disabled={isAddingCat}
            className="bg-[#2A1E17] text-white rounded-lg px-4 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2A1E17] transition-all cursor-pointer disabled:opacity-40"
          >
            {isAddingCat ? "Adding..." : "Add"}
          </button>
        </form>

        {/* Category List */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-[#2A1E17]/5 bg-[#EFEFEA]/30 p-4 space-y-3"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-bold text-[#2A1E17]">{cat.name}</span>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  aria-label={`Delete ${cat.name} category`}
                  className="text-xs text-rose-600 hover:text-rose-900 font-bold transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>

              {/* Subcategories list */}
              <div className="space-y-2 border-t border-[#2A1E17]/5 pt-3">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-[#3A2E2B]/65">
                  Subcategories
                </span>
                
                {cat.subcategories.length === 0 ? (
                  <span className="text-[10px] text-[#3A2E2B]/50 block">No subcategories defined.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((subcat) => (
                      <span
                        key={subcat}
                        className="inline-flex items-center gap-1 bg-white border border-[#2A1E17]/5 text-[#3A2E2B] rounded-md pl-2 pr-1 py-0.5 text-[10px] font-semibold"
                      >
                        <span>{subcat}</span>
                        <button
                          onClick={() => handleDeleteSubcategory(cat.id, subcat)}
                          aria-label={`Delete ${subcat} subcategory`}
                          className="hover:text-rose-600 text-[#3A2E2B]/40 text-xs font-bold transition-colors cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Subcategory Inline Input */}
                <div className="flex gap-1.5 pt-2">
                  <input
                    type="text"
                    value={newSubcatNames[cat.id] || ""}
                    onChange={(e) =>
                      setNewSubcatNames((prev) => ({ ...prev, [cat.id]: e.target.value }))
                    }
                    placeholder="Add subcategory..."
                    className="flex-1 bg-white border border-[#2A1E17]/10 rounded-md p-1.5 text-[10px] text-[#2A1E17] focus:outline-none focus:border-[#C5A880]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubcategory(cat.id)}
                    className="bg-[#2A1E17] text-white rounded-md px-2.5 text-[10px] font-bold hover:bg-[#C5A880] hover:text-[#2A1E17] transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Promo Badges Manager (Right Panel) */}
      <section className="rounded-2xl border border-[#2A1E17]/5 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2A1E17]">Promo Badges & Tags</h2>
          <p className="text-xs text-[#3A2E2B]/60 mt-1">
            Create visual marketing labels like "Chef Special" or "Bestseller".
          </p>
        </div>

        {/* Add Badge Form */}
        <form onSubmit={handleAddBadge} className="flex gap-2">
          <input
            type="text"
            value={newBadgeName}
            onChange={(e) => setNewBadgeName(e.target.value)}
            placeholder="e.g. Chef Special, Organic"
            required
            className="flex-1 bg-[#EFEFEA] border border-[#2A1E17]/10 rounded-lg p-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#C5A880]"
          />
          <button
            type="submit"
            disabled={isAddingBadge}
            className="bg-[#2A1E17] text-white rounded-lg px-4 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2A1E17] transition-all cursor-pointer disabled:opacity-40"
          >
            {isAddingBadge ? "Adding..." : "Add"}
          </button>
        </form>

        {/* Badges List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center justify-between rounded-xl border border-[#2A1E17]/5 bg-[#EFEFEA]/30 px-4 py-3"
            >
              <div className="flex items-center space-x-2">
                <span className="inline-block rounded bg-[#EFEFEA] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                  {badge.name}
                </span>
                <span className="text-[10px] text-[#3A2E2B]/50 font-mono">({badge.id})</span>
              </div>
              <button
                onClick={() => handleDeleteBadge(badge.id)}
                aria-label={`Delete ${badge.name} badge`}
                className="text-xs text-rose-600 hover:text-rose-900 font-bold transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
