import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Story from "@/components/Story";
import ProductCatalogSkeleton from "@/components/ProductCatalogSkeleton";
import { getAllProducts } from "@/lib/products";

const ProductCatalog = dynamic(() => import("@/components/ProductCatalog"), {
  loading: () => <ProductCatalogSkeleton />,
  ssr: true,
});

export default async function Home() {
  const allProducts = await getAllProducts();
  const products = allProducts.filter((p) => p.isAvailable !== false);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <Hero products={products} />

      {/* Categories Showcase */}
      <Categories products={products} />

      {/* Our Bakery Story */}
      <Story />

      {/* Product Catalog */}
      <ProductCatalog initialProducts={products} />
    </div>
  );
}
