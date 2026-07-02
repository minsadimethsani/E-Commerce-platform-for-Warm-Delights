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
  const products = await getAllProducts();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <Hero products={products} />

      {/* Categories Showcase */}
      <Categories />

      {/* Our Bakery Story */}
      <Story />

      {/* Product Catalog */}
      <ProductCatalog initialProducts={products} />
    </div>
  );
}
