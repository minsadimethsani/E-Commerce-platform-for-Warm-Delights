"use client";

import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { doc, setDoc, deleteDoc, Timestamp, collection, query, orderBy, onSnapshot, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Category } from "@/lib/categories";
import { Badge } from "@/lib/badges";
import { useAuth } from "@/context/AuthContext";

interface ProductsClientProps {
  initialProducts: Product[];
  categoriesList: Category[];
  badgesList: Badge[];
}

export default function ProductsClient({
  initialProducts,
  categoriesList,
  badgesList,
}: ProductsClientProps) {
  const { setIsMutating } = useAuth();
  // Deduplicate initial products by id
  const uniqueInitial = initialProducts.reduce((acc: Product[], current) => {
    const x = acc.find(item => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  const [products, setProducts] = useState<Product[]>(uniqueInitial);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("id", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: data.id || docSnap.id,
          name: data.name,
          description: data.description,
          price: data.price,
          image: data.image,
          category: data.category,
          badge: data.badge || undefined,
          rating: data.rating,
          reviewsCount: data.reviewsCount,
          isAvailable: data.isAvailable !== false,
          ingredients: data.ingredients || [],
          careInstructions: data.careInstructions || "",
          images: data.images || [],
          videoUrl: data.videoUrl || "",
          variants: data.variants || [],
          sizes: data.sizes || [],
          flavors: data.flavors || [],
          icings: data.icings || [],
          defaultSize: data.defaultSize || "",
          defaultFlavor: data.defaultFlavor || "",
          defaultIcing: data.defaultIcing || "",
        } as any);
      });

      // Deduplicate on live snapshot updates
      const uniqueList = list.reduce((acc: Product[], current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      setProducts(uniqueList);
    }, (error) => {
      console.error("Firestore onSnapshot failed:", error);
    });

    return () => unsubscribe();
  }, []);

  // Fallback to default lists if collections are empty
  const categories = categoriesList.length > 0 ? categoriesList : [
    { id: "cake", name: "Cake", subcategories: ["Sponge Cake", "Fudge Cake", "Cheesecakes"] },
    { id: "savory", name: "Savory", subcategories: ["Quiches", "Bread", "Pies"] },
    { id: "pastry", name: "Pastry", subcategories: ["Croissants", "Tarts", "Danishes"] },
    { id: "cookie", name: "Cookie", subcategories: ["Chocolate Chip", "Macarons", "Shortbread"] },
    { id: "custom", name: "Custom", subcategories: ["Wedding Cakes", "Birthday Cakes", "Custom Hampers"] }
  ];
  const badges = badgesList.length > 0 ? badgesList : [
    { id: "bestseller", name: "Bestseller" },
    { id: "new", name: "New" },
    { id: "seasonal", name: "Seasonal" },
    { id: "chef-special", name: "Chef Special" }
  ];

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Cake");
  const [subcategory, setSubcategory] = useState("");
  const [badge, setBadge] = useState("");
  const [image, setImage] = useState("/category_cakes.png");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Variant States
  const [variants, setVariants] = useState<{ name: string; price: number; isAvailable?: boolean }[]>([]);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantPrice, setNewVariantPrice] = useState("");

  // Consolidated Multi-variant states
  const [sizes, setSizes] = useState<{ name: string; price: number; priceMultiplier?: number }[]>([]);
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizePrice, setNewSizePrice] = useState("");

  const [flavors, setFlavors] = useState<{ name: string; price: number }[]>([]);
  const [newFlavor, setNewFlavor] = useState("");
  const [newFlavorPrice, setNewFlavorPrice] = useState("");

  const [icings, setIcings] = useState<{ name: string; price: number }[]>([]);
  const [newIcing, setNewIcing] = useState("");
  const [newIcingPrice, setNewIcingPrice] = useState("");

  const [defaultSize, setDefaultSize] = useState("");
  const [defaultFlavor, setDefaultFlavor] = useState("");
  const [defaultIcing, setDefaultIcing] = useState("");

  // Multiple compressed images state
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  // In-browser WebP image compression helper
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to WebP with 0.75 quality (yielding lightweight 20-30KB data URIs)
          const dataUrl = canvas.toDataURL("image/webp", 0.75);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsCompressing(true);
    const files = Array.from(e.target.files);

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const videoFiles = files.filter((file) => file.type.startsWith("video/"));

    if (videoFiles.length > 0) {
      const videoFile = videoFiles[0];
      if (videoFile.size > 2 * 1024 * 1024) {
        alert("Video file size exceeds 2MB limit. Please upload a smaller video.");
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setVideoUrl(event.target?.result as string);
        };
        reader.readAsDataURL(videoFile);
      }
    }

    try {
      const compressedList: string[] = [];
      for (const file of imageFiles) {
        const compressed = await compressImage(file);
        compressedList.push(compressed);
      }
      setUploadedImages((prev) => {
        const nextList = [...prev, ...compressedList];
        if (prev.length === 0 && nextList.length > 0) {
          setImage(nextList[0]);
        }
        return nextList;
      });
    } catch (error) {
      console.error("Image compression failed:", error);
      alert("Failed to compress and upload images.");
    } finally {
      setIsCompressing(false);
    }
  };

  const removeUploadedImage = (indexToRemove: number) => {
    setUploadedImages((prev) => {
      const nextList = prev.filter((_, i) => i !== indexToRemove);
      if (image === prev[indexToRemove]) {
        setImage(nextList.length > 0 ? nextList[0] : "/category_cakes.png");
      }
      return nextList;
    });
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setDescription("");
    setCategory(categories[0]?.name || "Cake");
    setSubcategory("");
    setBadge("");
    setImage("/category_cakes.png");
    setVideoUrl("");
    setUploadedImages([]);
    setVariants([]);
    setNewVariantName("");
    setNewVariantPrice("");

    // Clear dynamic variations
    setSizes([]);
    setNewSizeName("");
    setNewSizePrice("");
    setFlavors([]);
    setNewFlavor("");
    setNewFlavorPrice("");
    setIcings([]);
    setNewIcing("");
    setNewIcingPrice("");

    setDefaultSize("");
    setDefaultFlavor("");
    setDefaultIcing("");

    setIsFormOpen(true);
  };

  const openEditForm = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price.toString());
    setDescription(p.description);
    setCategory(p.category);
    setSubcategory((p as any).subcategory || "");
    setBadge(p.badge || "");
    setImage(p.image);
    setVideoUrl((p as any).videoUrl || "");
    setUploadedImages((p as any).images || [p.image]);
    setVariants((p as any).variants || []);
    setNewVariantName("");
    setNewVariantPrice("");

    const defaultSz = (p as any).defaultSize || "";
    const defaultFl = (p as any).defaultFlavor || "";
    const defaultIc = (p as any).defaultIcing || "";

    setDefaultSize(defaultSz);
    setDefaultFlavor(defaultFl);
    setDefaultIcing(defaultIc);

    // Populate dynamic variations (filtering out defaults)
    const rawSizes = (p as any).sizes || [];
    setSizes(rawSizes.filter((s: any) => s.name !== defaultSz));
    setNewSizeName("");
    setNewSizePrice("");

    const loadedFlavors = ((p as any).flavors || []).map((f: any) => 
      typeof f === "string" ? { name: f, price: 0 } : f
    );
    setFlavors(loadedFlavors.filter((f: any) => f.name !== defaultFl));
    setNewFlavor("");
    setNewFlavorPrice("");

    const loadedIcings = ((p as any).icings || []).map((ic: any) => 
      typeof ic === "string" ? { name: ic, price: 0 } : ic
    );
    setIcings(loadedIcings.filter((ic: any) => ic.name !== defaultIc));
    setNewIcing("");
    setNewIcingPrice("");

    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setIsMutating(true);
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      console.log(`Product ${id} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting product from Firestore:", error);
      alert("Error: Database permission denied or network failure.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;

    if (!confirm(`Are you sure you want to delete the ${selectedProductIds.length} selected products? This action cannot be undone.`)) {
      return;
    }

    setIsUpdating(true);
    setIsMutating(true);
    try {
      const batch = writeBatch(db);
      selectedProductIds.forEach((id) => {
        const docRef = doc(db, "products", id);
        batch.delete(docRef);
      });
      await batch.commit();

      // Clear the local product list display array from deleted items
      setProducts((prev) => prev.filter((p) => !selectedProductIds.includes(p.id)));

      // Empty the selection array
      setSelectedProductIds([]);
      console.log("Bulk deletion completed successfully.");
    } catch (error) {
      console.error("Error bulk deleting products from Firestore:", error);
      alert("Error: Missing database write permissions or network failure during bulk delete.");
    } finally {
      setIsUpdating(false);
      setIsMutating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    setIsMutating(true);
    try {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice)) {
        alert("Invalid price value.");
        setIsSaving(false);
        setIsMutating(false);
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
      } else if (category === "Custom") {
        ingredients = ["Handpressed organic edible flowers", "local premium flour", "farm-fresh eggs", "pure cane sugar", "natural flavor extracts"];
        careInstructions = "Keep refrigerated. Rest at room temperature for 1 hour before serving. Consume within 3 days.";
      } else {
        ingredients = ["Premium organic ingredients", "eggs", "butter", "cane sugar"];
        careInstructions = "Keep in cool dry place. Consume within 3 days.";
      }

      const finalImage = image;

      // Prepend defaults with price 0 if they are specified
      const finalSizes = [...sizes];
      if (defaultSize.trim() && !sizes.some(s => s.name === defaultSize.trim())) {
        finalSizes.unshift({ name: defaultSize.trim(), price: 0 });
      }

      const finalFlavors = [...flavors];
      if (defaultFlavor.trim() && !flavors.some(f => f.name === defaultFlavor.trim())) {
        finalFlavors.unshift({ name: defaultFlavor.trim(), price: 0 });
      }

      const finalIcings = [...icings];
      if (defaultIcing.trim() && !icings.some(ic => ic.name === defaultIcing.trim())) {
        finalIcings.unshift({ name: defaultIcing.trim(), price: 0 });
      }

      const savePayload = {
        id,
        name: name.trim(),
        nameLowercase: name.trim().toLowerCase(),
        description: description.trim(),
        price: parsedPrice,
        image: finalImage,
        images: uploadedImages,
        category,
        subcategory,
        badge: badge.trim() || "",
        rating,
        reviewsCount,
        isAvailable: true,
        ingredients,
        careInstructions,
        videoUrl: videoUrl.trim(),
        variants: variants,
        sizes: finalSizes,
        flavors: finalFlavors,
        icings: finalIcings,
        defaultSize: defaultSize.trim() || "",
        defaultFlavor: defaultFlavor.trim() || "",
        defaultIcing: defaultIcing.trim() || "",
        updatedAt: Timestamp.now(),
      } as any;

      if (!editingProduct) {
        savePayload.createdAt = Timestamp.now();
      }

      await setDoc(doc(db, "products", id), savePayload);

      // Map to state array
      const savedProduct: Product & { images?: string[]; subcategory?: string; defaultSize?: string; defaultFlavor?: string; defaultIcing?: string } = {
        id,
        name: savePayload.name,
        description: savePayload.description,
        price: savePayload.price,
        image: savePayload.image,
        category: savePayload.category,
        subcategory: savePayload.subcategory || "",
        badge: savePayload.badge || undefined,
        rating: savePayload.rating,
        reviewsCount: savePayload.reviewsCount,
        images: savePayload.images,
        variants: savePayload.variants,
        sizes: savePayload.sizes,
        flavors: savePayload.flavors,
        icings: savePayload.icings,
        defaultSize: savePayload.defaultSize || "",
        defaultFlavor: savePayload.defaultFlavor || "",
        defaultIcing: savePayload.defaultIcing || "",
        videoUrl: savePayload.videoUrl,
      } as any;

      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === id ? savedProduct : p)));
      } else {
        setProducts((prev) => {
          if (prev.some((p) => p.id === id)) {
            return prev.map((p) => (p.id === id ? savedProduct : p));
          }
          return [...prev, savedProduct];
        });
      }

      setIsFormOpen(false);
      console.log(`Product ${id} saved successfully.`);
    } catch (error) {
      console.error("Error saving product to Firestore:", error);
      alert("Error: Database write permission denied or network failure.");
    } finally {
      setIsSaving(false);
      setIsMutating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">

      {/* Products Table (Left Column) */}
      <div className="flex-1 w-full space-y-4">

        {/* Contextual Action Bar for Bulk Deletion */}
        {selectedProductIds.length > 0 && (
          <div className="flex items-center justify-between bg-rose-50 border border-rose-250 rounded-2xl px-6 py-4 transition-all duration-300 shadow-xs">
            <div className="flex items-center space-x-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
              <span className="font-sans px-1.5 py-0.5 border border-rose-300 bg-white text-[9px] uppercase tracking-wider text-rose-700">Select</span>
              <span>{selectedProductIds.length} {selectedProductIds.length === 1 ? "Product" : "Products"} Selected</span>
            </div>

            <button
              onClick={handleBulkDelete}
              disabled={isUpdating}
              className="bg-rose-600 text-white rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isUpdating ? "Deleting..." : "Delete Selected"}
            </button>
          </div>
        )}

        {/* Table header control panel */}
        <div className="flex items-center justify-between pb-2">
          <div className="text-xs font-semibold text-[#2A1E17]/60 uppercase tracking-wider">
            Total Inventory: {products.length} Items
          </div>
          <button
            onClick={openAddForm}
            disabled={isUpdating}
            className="flex items-center space-x-2 bg-[#A47251] text-white rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span>Add Product</span>
          </button>
        </div>

        {/* Real Table */}
        <div className="overflow-hidden rounded-2xl border border-[#A47251]/5 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#A47251]/5">
              <thead className="bg-[#F0D8A1]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60 w-12">
                    <input
                      type="checkbox"
                      disabled={isUpdating}
                      checked={products.length > 0 && selectedProductIds.length === products.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProductIds(products.map((p) => p.id));
                        } else {
                          setSelectedProductIds([]);
                        }
                      }}
                      className="rounded border-[#A47251]/20 text-[#DD9E59] focus:ring-[#DD9E59] h-4 w-4 cursor-pointer accent-[#DD9E59]"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Available Variations</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Rating</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#2A1E17]/60">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#A47251]/5 bg-white">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F0D8A1]/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap w-12">
                      <input
                        type="checkbox"
                        disabled={isUpdating}
                        checked={selectedProductIds.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIds((prev) => [...prev, p.id]);
                          } else {
                            setSelectedProductIds((prev) => prev.filter((id) => id !== p.id));
                          }
                        }}
                        className="rounded border-[#A47251]/20 text-[#DD9E59] focus:ring-[#DD9E59] h-4 w-4 cursor-pointer accent-[#DD9E59]"
                      />
                    </td>
                    {/* Image & Title */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-none bg-[#A47251]/5">
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <Link href={`/admin/products/${p.id}`} className="block text-sm font-bold text-[#2A1E17] hover:text-[#DD9E59] transition-colors cursor-pointer">
                            {p.name}
                          </Link>
                          {p.badge && (
                            <span className="inline-block rounded-none bg-[#F0D8A1] px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#2A1E17]">
                      {p.category}
                    </td>
                    {/* Price */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-[#2A1E17]">
                      Rs. {p.price.toFixed(2)}
                    </td>
                    {/* Available Variations Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1 max-w-[200px]">
                        {/* Sizes */}
                        {p.sizes && p.sizes.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[8px] font-bold text-[#2A1E17]/50 uppercase tracking-wide block mr-1 self-center">Sizes:</span>
                            {p.sizes.map((s: any, idx: number) => (
                              <span key={idx} className="inline-block bg-[#F0D8A1] text-[#2A1E17] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#A47251]/5">
                                {s.name} {s.price > 0 ? `(+Rs.${s.price})` : s.price < 0 ? `(-Rs.${Math.abs(s.price)})` : ""}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Flavors */}
                        {p.flavors && p.flavors.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[8px] font-bold text-[#2A1E17]/50 uppercase tracking-wide block mr-1 self-center">Flavors:</span>
                            {p.flavors.map((f: any, idx: number) => {
                              const fName = typeof f === "string" ? f : f.name;
                              const fPrice = typeof f === "string" ? 0 : f.price;
                              return (
                                <span key={idx} className="inline-block bg-[#DD9E59]/15 text-[#DD9E59] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#DD9E59]/10">
                                  {fName} {fPrice > 0 ? `(+Rs.${fPrice})` : fPrice < 0 ? `(-Rs.${Math.abs(fPrice)})` : ""}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {/* Icings */}
                        {(p as any).icings && (p as any).icings.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[8px] font-bold text-[#2A1E17]/50 uppercase tracking-wide block mr-1 self-center">Icings:</span>
                            {(p as any).icings.map((ic: any, idx: number) => {
                              const icName = typeof ic === "string" ? ic : ic.name;
                              const icPrice = typeof ic === "string" ? 0 : ic.price;
                              return (
                                <span key={idx} className="inline-block bg-[#A47251]/10 text-[#2A1E17] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#A47251]/5">
                                  {icName} {icPrice > 0 ? `(+Rs.${icPrice})` : icPrice < 0 ? `(-Rs.${Math.abs(icPrice)})` : ""}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {(!p.sizes || p.sizes.length === 0) && (!p.flavors || p.flavors.length === 0) && (!(p as any).icings || (p as any).icings.length === 0) && (
                          <span className="text-[10px] text-[#2A1E17]/40 italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-[#2A1E17]">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1 py-0.5">Rating: {p.rating.toFixed(1)}</span> ({p.reviewsCount})
                    </td>
                    {/* Action buttons */}
                    <td className="whitespace-nowrap px-6 py-4 text-right text-xs font-bold space-x-2">
                      <button
                        onClick={() => openEditForm(p)}
                        disabled={isUpdating}
                        aria-label="Edit product details"
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-[#DD9E59] hover:bg-[#F0D8A1] hover:text-[#2A1E17] transition-colors cursor-pointer disabled:opacity-30"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4.5 h-4.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.04a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={isUpdating}
                        aria-label="Delete product"
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-800 transition-colors cursor-pointer disabled:opacity-30"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4.5 h-4.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Product Form Editor Modal (Full-Screen Overlay Page) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-[#FDF9F0] overflow-y-auto flex flex-col">
          {/* Header Bar */}
          <header className="sticky top-0 z-10 flex h-20 items-center justify-between bg-[#A47251] text-[#FDF9F0] px-6 sm:px-10 shadow-md">
            <div>
              <h2 className="font-serif text-xl font-bold tracking-wide text-white">
                {editingProduct ? `Edit Product: ${editingProduct.id}` : "Add New Product"}
              </h2>
              <span className="text-[#DD9E59] text-[10px] uppercase font-sans font-bold tracking-wider mt-0.5 block">
                Warm Delights Inventory Manager
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsFormOpen(false)}
              className="rounded-full bg-white/10 p-2 text-[#FDF9F0] hover:bg-white/20 transition-all cursor-pointer"
              aria-label="Close editor"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          {/* Form Content Body */}
          <div className="flex-1 py-10 px-4 sm:px-6">
            <div className="mx-auto max-w-2xl bg-white rounded-3xl border border-[#A47251]/5 p-8 sm:p-10 shadow-sm">
              <form onSubmit={handleSave} className="space-y-6">

                {/* 1. Name Input */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                    Product Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Signature Focaccia"
                    required
                    className="w-full bg-[#F0D8A1] border border-[#A47251]/10 rounded-lg p-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59]"
                  />
                </div>

                {/* 2. Category Dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="category" className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubcategory(""); // Reset subcategory when category changes
                    }}
                    className="w-full bg-[#F0D8A1] border border-[#A47251]/10 rounded-lg p-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-between items-center mt-1.5 px-0.5">
                    <span className="text-[9px] text-[#2A1E17]/60 font-sans">Need a different category?</span>
                    <Link
                      href="/admin/categories"
                      className="text-[9px] font-bold text-[#DD9E59] hover:text-[#2A1E17] hover:underline transition-colors font-sans"
                    >
                      Manage Categories & Subcategories →
                    </Link>
                  </div>
                </div>

                {/* 3. Subcategory Dropdown (if active category has subcategories) */}
                {(() => {
                  const selectedCatObj = categories.find(
                    (c) => c.name.toLowerCase() === category.toLowerCase()
                  );
                  const subcats = selectedCatObj ? selectedCatObj.subcategories : [];
                  if (subcats.length === 0) return null;
                  return (
                    <div className="space-y-1.5">
                      <label htmlFor="subcategory" className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                        Subcategory
                      </label>
                      <select
                        id="subcategory"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        className="w-full bg-[#F0D8A1] border border-[#A47251]/10 rounded-lg p-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer"
                      >
                        <option value="">None</option>
                        {subcats.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })()}

                {/* 4. Product Variations (Size, Flavor, Icing) */}
                <div className="space-y-4 p-5 bg-[#F0D8A1]/30 border border-[#A47251]/5 rounded-2xl">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#2A1E17]">Product Variations</h4>
                    <p className="text-[10px] text-[#2A1E17]/75">Configure default baseline variants (covered by base price) and other dynamic variants with additional costs.</p>
                  </div>

                  {/* A. Default Selections (Manual Text Inputs) */}
                  <div className="space-y-3 border-t border-[#A47251]/5 pt-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                      Default Variant Selections (Base Price Baseline)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#2A1E17]/60 mb-1">
                          Default Size/Weight
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 500g"
                          value={defaultSize}
                          onChange={(e) => {
                            setDefaultSize(e.target.value);
                            setIsMutating(true);
                          }}
                          className="w-full bg-white border border-[#A47251]/10 rounded-lg p-2 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59]"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#2A1E17]/60 mb-1">
                          Default Flavor
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Chocolate"
                          value={defaultFlavor}
                          onChange={(e) => {
                            setDefaultFlavor(e.target.value);
                            setIsMutating(true);
                          }}
                          className="w-full bg-white border border-[#A47251]/10 rounded-lg p-2 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59]"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#2A1E17]/60 mb-1">
                          Default Icing
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Butter Icing"
                          value={defaultIcing}
                          onChange={(e) => {
                            setDefaultIcing(e.target.value);
                            setIsMutating(true);
                          }}
                          className="w-full bg-white border border-[#A47251]/10 rounded-lg p-2 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* B. Size Variations */}
                  <div className="space-y-2 border-t border-[#A47251]/5 pt-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                      Size / Weight Variations (Other than default)
                    </span>

                    {sizes.length === 0 ? (
                      <p className="text-[10px] text-[#2A1E17]/55 italic bg-white p-2.5 rounded-lg border border-[#A47251]/5">
                        No additional sizes configured.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {sizes.map((s, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-[#A47251]/10 text-xs text-[#2A1E17]">
                            <span className="font-semibold">{s.name}</span>
                            <div className="flex items-center space-x-4">
                              <span className="text-[#2A1E17]/85 font-medium">
                                {s.price > 0 ? `+Rs. ${s.price.toFixed(2)}` : s.price < 0 ? `-Rs. ${Math.abs(s.price).toFixed(2)}` : "Rs. 0.00"} {s.priceMultiplier ? `(x${s.priceMultiplier})` : ""}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSizes((prev) => prev.filter((_, i) => i !== idx))}
                                className="text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Size Input fields */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="e.g. 1kg"
                        value={newSizeName}
                        onChange={(e) => {
                          setNewSizeName(e.target.value);
                          setIsMutating(true);
                        }}
                        className="bg-white border border-[#A47251]/10 rounded-lg p-2 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] flex-1"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Add Price"
                        value={newSizePrice}
                        onChange={(e) => {
                          setNewSizePrice(e.target.value);
                          setIsMutating(true);
                        }}
                        className="bg-white border border-[#A47251]/10 rounded-lg p-2 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] w-20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newSizeName.trim()) {
                            alert("Please fill in size name.");
                            return;
                          }
                          const priceVal = newSizePrice ? parseFloat(newSizePrice) : 0;
                          if (isNaN(priceVal)) {
                            alert("Invalid price.");
                            return;
                          }
                          setSizes((prev) => [
                            ...prev,
                            { name: newSizeName.trim(), price: priceVal }
                          ]);
                          setNewSizeName("");
                          setNewSizePrice("");
                          setIsMutating(false);
                        }}
                        className="bg-[#A47251] hover:bg-[#DD9E59] hover:text-[#2A1E17] text-white rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* C. Flavor Variations */}
                  <div className="space-y-2 border-t border-[#A47251]/5 pt-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                      Flavor Variations (Other than default)
                    </span>

                    {flavors.length === 0 ? (
                      <p className="text-[10px] text-[#2A1E17]/55 italic bg-white p-2.5 rounded-lg border border-[#A47251]/5">
                        No additional flavors configured.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white border border-[#A47251]/5 rounded-lg">
                        {flavors.map((f, idx) => {
                          const fName = typeof f === "string" ? f : f.name;
                          const fPrice = typeof f === "string" ? 0 : f.price;
                          return (
                            <span key={idx} className="inline-flex items-center bg-[#F0D8A1] text-[#2A1E17] text-[10px] font-bold px-2 py-0.5 rounded-md">
                              <span>{fName} {fPrice > 0 ? `(+Rs. ${fPrice})` : fPrice < 0 ? `(-Rs. ${Math.abs(fPrice)})` : ""}</span>
                              <button
                                type="button"
                                onClick={() => setFlavors((prev) => prev.filter((_, i) => i !== idx))}
                                className="ml-1.5 hover:text-rose-600 text-xs font-bold cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Red Velvet"
                        value={newFlavor}
                        onChange={(e) => {
                          setNewFlavor(e.target.value);
                          setIsMutating(true);
                        }}
                        className="bg-white border border-[#A47251]/10 rounded-lg p-2 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] flex-1"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Add Price"
                        value={newFlavorPrice}
                        onChange={(e) => {
                          setNewFlavorPrice(e.target.value);
                          setIsMutating(true);
                        }}
                        className="bg-white border border-[#A47251]/10 rounded-lg p-2 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] w-24"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newFlavor.trim()) {
                            const pVal = newFlavorPrice ? parseFloat(newFlavorPrice) : 0;
                            setFlavors((prev) => [
                              ...prev,
                              { name: newFlavor.trim(), price: isNaN(pVal) ? 0 : pVal }
                            ]);
                            setNewFlavor("");
                            setNewFlavorPrice("");
                            setIsMutating(false);
                          }
                        }}
                        className="bg-[#A47251] hover:bg-[#DD9E59] hover:text-[#2A1E17] text-white rounded-lg px-4 text-xs font-bold transition-all cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* D. Icing Variations */}
                  <div className="space-y-2 border-t border-[#A47251]/5 pt-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                      Icing Variations (Other than default)
                    </span>

                    {icings.length === 0 ? (
                      <p className="text-[10px] text-[#2A1E17]/55 italic bg-white p-2.5 rounded-lg border border-[#A47251]/5">
                        No additional icings configured.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white border border-[#A47251]/5 rounded-lg">
                        {icings.map((ic, idx) => {
                          const icName = typeof ic === "string" ? ic : ic.name;
                          const icPrice = typeof ic === "string" ? 0 : ic.price;
                          return (
                            <span key={idx} className="inline-flex items-center bg-[#F0D8A1] text-[#2A1E17] text-[10px] font-bold px-2 py-0.5 rounded-md">
                              <span>{icName} {icPrice > 0 ? `(+Rs. ${icPrice})` : icPrice < 0 ? `(-Rs. ${Math.abs(icPrice)})` : ""}</span>
                              <button
                                type="button"
                                onClick={() => setIcings((prev) => prev.filter((_, i) => i !== idx))}
                                className="ml-1.5 hover:text-rose-600 text-xs font-bold cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Fondant"
                        value={newIcing}
                        onChange={(e) => {
                          setNewIcing(e.target.value);
                          setIsMutating(true);
                        }}
                        className="bg-white border border-[#A47251]/10 rounded-lg p-2 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] flex-1"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Add Price"
                        value={newIcingPrice}
                        onChange={(e) => {
                          setNewIcingPrice(e.target.value);
                          setIsMutating(true);
                        }}
                        className="bg-white border border-[#A47251]/10 rounded-lg p-2 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] w-24"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newIcing.trim()) {
                            const pVal = newIcingPrice ? parseFloat(newIcingPrice) : 0;
                            setIcings((prev) => [
                              ...prev,
                              { name: newIcing.trim(), price: isNaN(pVal) ? 0 : pVal }
                            ]);
                            setNewIcing("");
                            setNewIcingPrice("");
                            setIsMutating(false);
                          }
                        }}
                        className="bg-[#A47251] hover:bg-[#DD9E59] hover:text-[#2A1E17] text-white rounded-lg px-4 text-xs font-bold transition-all cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                </div>

                {/* 5. Base Price Input */}
                <div className="space-y-1.5">
                  <label htmlFor="price" className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                    Price (Rs.) *
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
                    className="w-full bg-[#F0D8A1] border border-[#A47251]/10 rounded-lg p-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59]"
                  />
                </div>

                {/* 6. Badge Dropdown */}
                <div className="space-y-1.5">
                  <label htmlFor="badge" className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                    Badge / Promo Tag
                  </label>
                  <select
                    id="badge"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full bg-[#F0D8A1] border border-[#A47251]/10 rounded-lg p-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer"
                  >
                    <option value="">No Badge / None</option>
                    {badges.map((bg) => (
                      <option key={bg.id} value={bg.name}>
                        {bg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7. Media (Photos & Videos) Upload & Selection */}
                <div className="space-y-3">
                  {/* Upload Photos & Videos */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                      Upload Photos & Videos
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="w-full text-xs text-[#2A1E17]/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#F0D8A1] file:text-[#2A1E17] file:hover:bg-[#DD9E59] hover:file:text-[#2A1E17] transition-colors cursor-pointer"
                    />
                    <p className="text-[9px] text-[#2A1E17]/55">
                      Photos will be WebP auto-compressed. Videos must be WebM/MP4, max 2MB.
                    </p>
                    {isCompressing && (
                      <span className="text-[10px] text-amber-600 block animate-pulse font-semibold">
                        [COMPRESSING] Compressing and converting to WebP...
                      </span>
                    )}
                  </div>

                  {/* Uploaded Preview Thumbnails */}
                  {(uploadedImages.length > 0 || videoUrl) && (
                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-[#2A1E17]/50">
                        Uploaded Media ({uploadedImages.length + (videoUrl ? 1 : 0)})
                      </span>
                      <div className="flex flex-wrap gap-2.5 p-2 bg-[#F0D8A1] border border-[#A47251]/5 rounded-none max-h-36 overflow-y-auto">
                        {videoUrl && (
                          <div className="relative h-14 w-14 rounded-none overflow-hidden border border-[#A47251]/10 group bg-black">
                            <video src={videoUrl} className="h-full w-full object-cover" muted playsInline />
                            <span className="absolute top-0.5 right-0.5 bg-black/60 rounded-none px-1 text-[7px] text-white font-bold uppercase tracking-wider">
                              Video
                            </span>
                            <button
                              type="button"
                              onClick={() => setVideoUrl("")}
                              className="absolute inset-0 bg-red-600/85 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold uppercase cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        {uploadedImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative h-14 w-14 rounded-none overflow-hidden border border-[#A47251]/10 group">
                            <img src={imgUrl} alt="Upload preview" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeUploadedImage(idx)}
                              className="absolute inset-0 bg-red-600/85 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold uppercase cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 9. Description Textarea */}
                <div className="space-y-1.5">
                  <label htmlFor="desc" className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                    Description *
                  </label>
                  <textarea
                    id="desc"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the taste profile, decoration, size..."
                    required
                    className="w-full bg-[#F0D8A1] border border-[#A47251]/10 rounded-lg p-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] resize-none"
                  />
                </div>

                {/* Actions row */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#A47251]/5">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 rounded-full bg-[#A47251] text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer disabled:opacity-40"
                  >
                    {isSaving ? "Saving..." : "Save Product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 rounded-full bg-transparent border border-[#A47251]/25 text-[#2A1E17] py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#F0D8A1] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
