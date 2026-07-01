import { getAllProducts } from "@/lib/products";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const initialProducts = await getAllProducts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2D1E18] tracking-tight">Product Catalog</h1>
        <p className="mt-1 text-sm text-[#55433C]/70">
          Manage inventory, add seasonal specialties, edit pricing, and update descriptions.
        </p>
      </div>

      <ProductsClient initialProducts={initialProducts} />
    </div>
  );
}
