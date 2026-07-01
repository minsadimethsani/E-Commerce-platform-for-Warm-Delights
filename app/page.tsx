import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Story from "@/components/Story";
import ProductCatalogSkeleton from "@/components/ProductCatalogSkeleton";

const ProductCatalog = dynamic(() => import("@/components/ProductCatalog"), {
  loading: () => <ProductCatalogSkeleton />,
  ssr: true,
});

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <Hero />

      {/* Categories Showcase */}
      <Categories />

      {/* Our Bakery Story */}
      <Story />

      {/* Product Catalog */}
      <ProductCatalog />
    </div>
  );
}
