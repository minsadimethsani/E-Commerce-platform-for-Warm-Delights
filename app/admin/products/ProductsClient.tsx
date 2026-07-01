"use client";

import { useState } from "react";
import { Product } from "@/data/products";
import { doc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ProductsClientProps {
  initialProducts: Product[];
}

const CATEGORIES = ["Cake", "Savory", "Pastry", "Cookie", "Custom"] as const;

export default function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Product["category"]>("Cake");
  const [badge, setBadge] = useState("");
  const [image, setImage] = useState("/category_cakes.png");
  const [isSaving, setIsSaving] = useState(false);

  const openAddForm = () => {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setDescription("");
    setCategory("Cake");
    setBadge("");
    setImage("/category_cakes.png");
    setIsFormOpen(true);
  };

  const openEditForm = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price.toString());
    setDescription(p.description);
    setCategory(p.category);
    setBadge(p.badge || "");
    setImage(p.image);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      console.log(`Product ${id} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting product from Firestore:", error);
      alert("Error: Database permission denied or network failure.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice)) {
        alert("Invalid price value.");
        setIsSaving(false);
        return;
      }

      let id = "";
      let rating = 5.0;
      let reviewsCount = 0;

      if (editingProduct) {
        id = editingProduct.id;
        rating = editingProduct.rating;
        reviewsCount = editingProduct.reviewsCount;
      } else {
        // Auto-increment custom ID pattern 'prod-X'
        const numericIds = products.map((p) => parseInt(p.id.replace("prod-", ""), 10) || 0);
        const nextNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
        id = `prod-${nextNum}`;
      }

      // Default ingredients and instructions based on category
      let ingredients: string[] = [];
      let careInstructions = "";
      if (category === "Cake") {
        ingredients = ["Cake flour", "eggs", "sugar", "butter", "whipping cream", "vanilla"];
        careInstructions = "Keep refrigerated. Serve chilled or rest at room temp for 15 mins.";
      } else if (category === "Savory") {
        ingredients = ["Wheat flour", "milk", "cheese", "vegetables", "eggs", "butter"];
        careInstructions = "Store refrigerated. Reheat in preheated oven at 180C for 5-8 minutes.";
      } else if (category === "Pastry") {
        ingredients = ["Pastry flour", "butter (82% fat)", "milk", "yeast", "sugar", "sea salt"];
        careInstructions = "Best enjoyed fresh. Toast in oven at 170C for 2-3 minutes for crispness.";
      } else if (category === "Cookie") {
        ingredients = ["Pastry flour", "chocolate chunks", "brown sugar", "butter", "eggs", "vanilla"];
        careInstructions = "Store in airtight jar. Toast in toaster oven for 60 seconds.";
      } else {
        ingredients = ["Premium organic ingredients", "eggs", "butter", "cane sugar"];
        careInstructions = "Keep in cool dry place. Consume within 3 days.";
      }

      const savePayload = {
        id,
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        image,
        category,
        badge: badge.trim() || "",
        rating,
        reviewsCount,
        isAvailable: true,
        ingredients,
        careInstructions,
        updatedAt: Timestamp.now(),
      } as any;

      if (!editingProduct) {
        savePayload.createdAt = Timestamp.now();
      }

      await setDoc(doc(db, "products", id), savePayload);

      // Map to state array
      const savedProduct: Product = {
        id,
        name: savePayload.name,
        description: savePayload.description,
        price: savePayload.price,
        image: savePayload.image,
        category: savePayload.category,
        badge: savePayload.badge || undefined,
        rating: savePayload.rating,
        reviewsCount: savePayload.reviewsCount,
      };

      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === id ? savedProduct : p)));
      } else {
        setProducts((prev) => [...prev, savedProduct]);
      }

      setIsFormOpen(false);
      console.log(`Product ${id} saved successfully.`);
    } catch (error) {
      console.error("Error saving product to Firestore:", error);
      alert("Error: Database write permission denied or network failure.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Products Table (Left Column) */}
      <div className="flex-1 w-full space-y-4">
        
        {/* Table header control panel */}
        <div className="flex items-center justify-between pb-2">
          <div className="text-xs font-semibold text-[#55433C]/60 uppercase tracking-wider">
            Total Inventory: {products.length} Items
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center space-x-2 bg-[#2D1E18] text-white rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#C2957C] hover:text-[#2D1E18] transition-all cursor-pointer shadow-xs"
          >
            <span>Add Product</span>
          </button>
        </div>

        {/* Real Table */}
        <div className="overflow-hidden rounded-2xl border border-[#2D1E18]/5 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2D1E18]/5">
              <thead className="bg-[#FAF5F0]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Rating</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D1E18]/5 bg-white">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF5F0]/30 transition-colors">
                    {/* Image & Title */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-[#2D1E18]/5">
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-[#2D1E18]">{p.name}</span>
                          {p.badge && (
                            <span className="inline-block rounded bg-[#E5A193] px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#55433C]">
                      {p.category}
                    </td>
                    {/* Price */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-[#2D1E18]">
                      ${p.price.toFixed(2)}
                    </td>
                    {/* Rating */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-amber-500">
                      ⭐ {p.rating.toFixed(1)} ({p.reviewsCount})
                    </td>
                    {/* Action buttons */}
                    <td className="whitespace-nowrap px-6 py-4 text-right text-xs font-bold space-x-3">
                      <button
                        onClick={() => openEditForm(p)}
                        className="text-[#C2957C] hover:text-[#2D1E18] transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-rose-600 hover:text-rose-900 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Product Form Editor (Right Drawer/Panel, visible when form is open) */}
      {isFormOpen && (
        <aside className="w-full lg:w-96 rounded-2xl border border-[#2D1E18]/5 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#2D1E18]/5 pb-4">
            <h3 className="font-serif text-lg font-bold text-[#2D1E18]">
              {editingProduct ? `Edit: ${editingProduct.id}` : "New Product"}
            </h3>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-xs font-bold text-[#55433C]/60 hover:text-[#2D1E18] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-[#55433C]/75">
                Product Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Signature Focaccia"
                required
                className="w-full bg-[#FAF5F0] border border-[#2D1E18]/10 rounded-lg p-2.5 text-xs text-[#2D1E18] focus:outline-none focus:border-[#C2957C]"
              />
            </div>

            {/* Price Input */}
            <div className="space-y-1.5">
              <label htmlFor="price" className="block text-[10px] font-bold uppercase tracking-wider text-[#55433C]/75">
                Price ($) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="12.50"
                required
                className="w-full bg-[#FAF5F0] border border-[#2D1E18]/10 rounded-lg p-2.5 text-xs text-[#2D1E18] focus:outline-none focus:border-[#C2957C]"
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="category" className="block text-[10px] font-bold uppercase tracking-wider text-[#55433C]/75">
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Product["category"])}
                className="w-full bg-[#FAF5F0] border border-[#2D1E18]/10 rounded-lg p-2.5 text-xs text-[#2D1E18] focus:outline-none focus:border-[#C2957C] cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Badge Input */}
            <div className="space-y-1.5">
              <label htmlFor="badge" className="block text-[10px] font-bold uppercase tracking-wider text-[#55433C]/75">
                Badge / Promo Tag
              </label>
              <input
                id="badge"
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Chef Special, Bestseller, New"
                className="w-full bg-[#FAF5F0] border border-[#2D1E18]/10 rounded-lg p-2.5 text-xs text-[#2D1E18] focus:outline-none focus:border-[#C2957C]"
              />
            </div>

            {/* Image Path */}
            <div className="space-y-1.5">
              <label htmlFor="image" className="block text-[10px] font-bold uppercase tracking-wider text-[#55433C]/75">
                Image Path
              </label>
              <select
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full bg-[#FAF5F0] border border-[#2D1E18]/10 rounded-lg p-2.5 text-xs text-[#2D1E18] focus:outline-none focus:border-[#C2957C] cursor-pointer"
              >
                <option value="/hero_bakery.png">Chocolate Cake (/hero_bakery.png)</option>
                <option value="/category_cakes.png">Strawberry Gateau (/category_cakes.png)</option>
                <option value="/category_savories.png">Savory Quiche (/category_savories.png)</option>
                <option value="/category_custom.png">Custom Wedding (/category_custom.png)</option>
                <option value="/about_bakery.png">Hamper / Ingredients (/about_bakery.png)</option>
              </select>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="desc" className="block text-[10px] font-bold uppercase tracking-wider text-[#55433C]/75">
                Description *
              </label>
              <textarea
                id="desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the taste profile, decoration, size..."
                required
                className="w-full bg-[#FAF5F0] border border-[#2D1E18]/10 rounded-lg p-2.5 text-xs text-[#2D1E18] focus:outline-none focus:border-[#C2957C] resize-none"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-full bg-[#2D1E18] text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#C2957C] hover:text-[#2D1E18] transition-all cursor-pointer disabled:opacity-40"
            >
              {isSaving ? "Saving..." : "Save Product"}
            </button>

          </form>
        </aside>
      )}

    </div>
  );
}
