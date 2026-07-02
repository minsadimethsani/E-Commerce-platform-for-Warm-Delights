"use client";

import { useState } from "react";
import { Category } from "@/lib/categories";
import { Badge } from "@/lib/badges";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CategoriesClientProps {
  initialCategories: Category[];
  initialBadges: Badge[];
}

export default function CategoriesClient({
  initialCategories,
  initialBadges,
}: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [badges, setBadges] = useState<Badge[]>(initialBadges);

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
    try {
      const name = newCatName.trim();
      const id = slugify(name);

      if (categories.some((c) => c.id === id)) {
        alert("A category with this identifier already exists.");
        setIsAddingCat(false);
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
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? All subcategories will also be deleted.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "categories", id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      alert("Error deleting category from database.");
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
    }
  };

  // Delete Subcategory
  const handleDeleteSubcategory = async (catId: string, subcatText: string) => {
    const targetCat = categories.find((c) => c.id === catId);
    if (!targetCat) return;

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
    }
  };

  // Add Badge
  const handleAddBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeName.trim()) return;

    setIsAddingBadge(true);
    try {
      const name = newBadgeName.trim();
      const id = slugify(name);

      if (badges.some((b) => b.id === id)) {
        alert("A badge with this name already exists.");
        setIsAddingBadge(false);
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
    }
  };

  // Delete Badge
  const handleDeleteBadge = async (id: string) => {
    if (!confirm("Are you sure you want to delete this badge?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "badges", id));
      setBadges((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error(`Failed to delete badge ${id}:`, error);
      alert("Error deleting badge from database.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      {/* 1. Categories & Subcategories Manager (Left Panel) */}
      <section className="rounded-2xl border border-[#2D1E18]/5 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2D1E18]">Categories & Subcategories</h2>
          <p className="text-xs text-[#55433C]/60 mt-1">
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
            className="flex-1 bg-[#FAF5F0] border border-[#2D1E18]/10 rounded-lg p-2.5 text-xs text-[#2D1E18] focus:outline-none focus:border-[#C2957C]"
          />
          <button
            type="submit"
            disabled={isAddingCat}
            className="bg-[#2D1E18] text-white rounded-lg px-4 text-xs font-bold uppercase tracking-wider hover:bg-[#C2957C] hover:text-[#2D1E18] transition-all cursor-pointer disabled:opacity-40"
          >
            {isAddingCat ? "Adding..." : "Add"}
          </button>
        </form>

        {/* Category List */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-[#2D1E18]/5 bg-[#FAF5F0]/30 p-4 space-y-3"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-bold text-[#2D1E18]">{cat.name}</span>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  aria-label={`Delete ${cat.name} category`}
                  className="text-xs text-rose-600 hover:text-rose-900 font-bold transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>

              {/* Subcategories list */}
              <div className="space-y-2 border-t border-[#2D1E18]/5 pt-3">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-[#55433C]/65">
                  Subcategories
                </span>
                
                {cat.subcategories.length === 0 ? (
                  <span className="text-[10px] text-[#55433C]/50 block">No subcategories defined.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((subcat) => (
                      <span
                        key={subcat}
                        className="inline-flex items-center gap-1 bg-white border border-[#2D1E18]/5 text-[#55433C] rounded-md pl-2 pr-1 py-0.5 text-[10px] font-semibold"
                      >
                        <span>{subcat}</span>
                        <button
                          onClick={() => handleDeleteSubcategory(cat.id, subcat)}
                          aria-label={`Delete ${subcat} subcategory`}
                          className="hover:text-rose-600 text-[#55433C]/40 text-xs font-bold transition-colors cursor-pointer"
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
                    className="flex-1 bg-white border border-[#2D1E18]/10 rounded-md p-1.5 text-[10px] text-[#2D1E18] focus:outline-none focus:border-[#C2957C]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubcategory(cat.id)}
                    className="bg-[#2D1E18] text-white rounded-md px-2.5 text-[10px] font-bold hover:bg-[#C2957C] hover:text-[#2D1E18] transition-all cursor-pointer"
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
      <section className="rounded-2xl border border-[#2D1E18]/5 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#2D1E18]">Promo Badges & Tags</h2>
          <p className="text-xs text-[#55433C]/60 mt-1">
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
            className="flex-1 bg-[#FAF5F0] border border-[#2D1E18]/10 rounded-lg p-2.5 text-xs text-[#2D1E18] focus:outline-none focus:border-[#C2957C]"
          />
          <button
            type="submit"
            disabled={isAddingBadge}
            className="bg-[#2D1E18] text-white rounded-lg px-4 text-xs font-bold uppercase tracking-wider hover:bg-[#C2957C] hover:text-[#2D1E18] transition-all cursor-pointer disabled:opacity-40"
          >
            {isAddingBadge ? "Adding..." : "Add"}
          </button>
        </form>

        {/* Badges List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center justify-between rounded-xl border border-[#2D1E18]/5 bg-[#FAF5F0]/30 px-4 py-3"
            >
              <div className="flex items-center space-x-2">
                <span className="inline-block rounded bg-[#E5A193] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                  {badge.name}
                </span>
                <span className="text-[10px] text-[#55433C]/50 font-mono">({badge.id})</span>
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
