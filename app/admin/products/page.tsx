import { getAllProducts } from "@/lib/products";
import { getAllCategories } from "@/lib/categories";
import { getAllBadges } from "@/lib/badges";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const initialProducts = await getAllProducts();
  const categories = await getAllCategories();
  const badges = await getAllBadges();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2A1E17] tracking-tight">Product Catalog</h1>
        <p className="mt-1 text-sm text-[#2A1E17]/70">
          Manage inventory, add seasonal specialties, edit pricing, and update descriptions.
        </p>
      </div>

      <ProductsClient 
        initialProducts={initialProducts} 
        categoriesList={categories} 
        badgesList={badges} 
      />
    </div>
  );
}
