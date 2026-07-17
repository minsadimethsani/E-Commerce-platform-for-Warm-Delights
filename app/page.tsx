import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/lib/products";
import Link from "next/link";
import { Product } from "@/data/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductSectionProps {
  title: string;
  description: string;
  products: Product[];
  viewAllLink: string;
  viewAllText?: string;
  bgColor?: string;
}

function ProductSection({
  title,
  description,
  products,
  viewAllLink,
  viewAllText = "View All",
  bgColor = "bg-[#FDF9F0]",
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className={`py-12 sm:py-16 ${bgColor}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-[#A47251]/10 pb-6">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2A1E17] sm:text-4xl">
              {title}
            </h2>
            <p className="text-sm text-[#2A1E17]/70 max-w-xl leading-relaxed">
              {description}
            </p>
          </div>
          <Link
            href={viewAllLink}
            className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold tracking-wide text-[#DD9E59] hover:text-[#2A1E17] transition-colors group cursor-pointer"
          >
            <span>{viewAllText}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
              stroke="currentColor"
              className="ml-1.5 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const allProducts = await getAllProducts();
  const products = allProducts.filter((p) => p.isAvailable !== false);

  // 1. Popular Items
  const popularItems = products
    .filter(
      (p) =>
        p.badge === "Bestseller" ||
        p.badge === "Best Seller" ||
        p.badge === "Popular" ||
        p.rating >= 4.8
    )
    .slice(0, 4);

  // 2. Cakes
  const cakes = products
    .filter((p) => p.category === "Cake" && !p.name.toLowerCase().includes("gateau"))
    .slice(0, 4);

  // 3. Gateaux
  const gateaux = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes("gateau") ||
        p.description.toLowerCase().includes("gateau")
    )
    .slice(0, 4);

  // 4. Savory
  const savory = products.filter((p) => p.category === "Savory").slice(0, 4);

  // 5. Custom Cakes
  const customCakes = products.filter((p) => p.category === "Custom").slice(0, 4);

  // 6. Sweet (Pastry & Cookies)
  const sweet = products
    .filter((p) => p.category === "Pastry" || p.category === "Cookie")
    .slice(0, 4);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <Hero products={products} />

      {/* Categories Showcase (Our Sweet & Savory Offerings) */}
      <Categories products={products} />

      {/* Popular Items Section */}
      <ProductSection
        title="Popular Items"
        description="Our highly-rated signature treats and customer favorites baked fresh daily."
        products={popularItems}
        viewAllLink="/menu"
        viewAllText="View Full Menu"
        bgColor="bg-[#FDF9F0]"
      />

      {/* Cakes Section */}
      <ProductSection
        title="Signature Cakes"
        description="Delightful layered creations, classic buttercream sponges, and rich fudge cakes."
        products={cakes}
        viewAllLink="/menu?category=Cake"
        viewAllText="Explore All Cakes"
        bgColor="bg-[#F5ECD7]/40"
      />

      {/* Gateaux Section */}
      <ProductSection
        title="Exquisite Gateaux"
        description="Indulgent, European-inspired fresh cream gateaux crafted for ultimate decadence."
        products={gateaux}
        viewAllLink="/menu?search=gateau"
        viewAllText="Explore Gateaux"
        bgColor="bg-[#FDF9F0]"
      />

      {/* Savory Section */}
      <ProductSection
        title="Artisanal Savory"
        description="Flaky quiches, freshly baked breads, and warm pastries to satisfy your savory cravings."
        products={savory}
        viewAllLink="/menu?category=Savory"
        viewAllText="Explore Savories"
        bgColor="bg-[#F5ECD7]/40"
      />

      {/* Custom Cakes Section */}
      <ProductSection
        title="Custom Cakes"
        description="Bespoke, handcrafted creations customized to make your special moments unforgettable."
        products={customCakes}
        viewAllLink="/menu?category=Custom"
        viewAllText="Design Your Cake"
        bgColor="bg-[#FDF9F0]"
      />

      {/* Sweet Section */}
      <ProductSection
        title="Sweet Delights"
        description="Delicate french pastries, soft-baked cookies, tarts, and bite-sized confectionery."
        products={sweet}
        viewAllLink="/menu"
        viewAllText="Explore Sweet Treats"
        bgColor="bg-[#F5ECD7]/40"
      />
    </div>
  );
}
