import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";

interface CategoriesProps {
  products?: Product[];
}

export default function Categories({ products = [] }: CategoriesProps) {
  const activeProducts = (products.length > 0 ? products : []).filter((p) => p.isAvailable !== false);

  // Identify which images are used in the Hero section to avoid duplicates on the page
  const usedImages = new Set<string>();

  // Mimic Slide 1 featured product image
  const availableProduct =
    activeProducts.find((p) => p.isAvailable !== false && p.image) || activeProducts[0];
  if (availableProduct?.image) {
    usedImages.add(availableProduct.image);
  }

  // Mimic Slide 2 signature delights images
  let imageProducts = activeProducts.filter((p) => p.isAvailable !== false && p.image);
  if (imageProducts.length < 4) {
    const merged = [...imageProducts];
    for (const item of activeProducts) {
      if (merged.length >= 4) break;
      if (!merged.some((m) => m.id === item.id)) {
        merged.push(item);
      }
    }
    imageProducts = merged;
  }
  const slide2Products = imageProducts.slice(0, 4);
  slide2Products.forEach((p) => {
    if (p.image) usedImages.add(p.image);
  });

  // Mimic Slide 3 custom cakes collage images
  let customCakes = activeProducts.filter(
    (p) => p.category === "Custom" && p.image
  );
  if (customCakes.length < 3) {
    const fallbackIds = ["prod-4", "prod-18", "prod-20"];
    const fallbackList = activeProducts.filter((p) => fallbackIds.includes(p.id));
    customCakes = [...customCakes, ...fallbackList.filter(f => !customCakes.some(c => c.id === f.id))].slice(0, 3);
  }
  customCakes.forEach((p) => {
    if (p.image) usedImages.add(p.image);
  });

  // Helper to find a suitable unique image for a category
  const getCategoryImage = (categoryName: "Cake" | "Savory" | "Custom", fallbackDefault: string) => {
    // 1. Try to find a product in this category that has an image not in usedImages
    const unusedProduct = activeProducts.find(
      (p) => p.category === categoryName && p.image && !usedImages.has(p.image)
    );
    if (unusedProduct?.image) {
      usedImages.add(unusedProduct.image);
      return unusedProduct.image;
    }

    // 2. Fallback: try to find any product in this category that has an image
    const anyProduct = activeProducts.find((p) => p.category === categoryName && p.image);
    if (anyProduct?.image) {
      usedImages.add(anyProduct.image);
      return anyProduct.image;
    }

    // 3. Ultimate Fallback: default static image
    return fallbackDefault;
  };

  const signatureCakesImage = getCategoryImage("Cake", "/category_cakes.png");
  const artisanalSavoriesImage = getCategoryImage("Savory", "/category_savories.png");
  const customCreationsImage = getCategoryImage("Custom", "/category_custom.png");

  const categories = [
    {
      title: "Signature Cakes",
      description: "Indulgent layered cakes, classic buttercream sponges, and rich chocolate fudge creations.",
      image: signatureCakesImage,
      linkText: "View Cakes",
      linkHref: "/menu?category=Cake",
      tag: "Bestseller",
    },
    {
      title: "Artisanal Savories",
      description: "Warm, flaky puff pastries, freshly baked quiches, and gourmet savory rolls.",
      image: artisanalSavoriesImage,
      linkText: "View Savories",
      linkHref: "/menu?category=Savory",
      tag: "Fresh Daily",
    },
    {
      title: "Custom Creations",
      description: "Intricately designed cakes customized for weddings, birthdays, and milestones.",
      image: customCreationsImage,
      linkText: "Design Your Cake",
      linkHref: "/menu?category=Custom",
      tag: "Made to Order",
    },
  ];
  return (
    <section className="bg-[#FDF9F0] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2A1E17] sm:text-5xl">
            Our Sweet & Savory Offerings
          </h2>
          <div className="mt-4 h-1 w-12 bg-[#DD9E59] mx-auto rounded-none" />
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#2A1E17]/80">
            Handcrafted with patience, baked to perfection. Explore our artisanal signature ranges.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.title}
              className="group flex flex-col overflow-hidden rounded-none bg-[#F0D8A1] border border-[#A47251]/5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              {/* Image Container */}
              <div className="relative aspect-4/3 overflow-hidden bg-[#A47251]/5">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Badge Overlay */}
                <div className="absolute top-4 left-4">
                  <span className="inline-block rounded-none bg-[#FDF9F0] px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#DD9E59] uppercase shadow-sm">
                    {category.tag}
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-1 flex-col justify-between p-8">
                <div className="space-y-3">
                  <h3 className="font-serif text-2xl font-bold text-[#2A1E17] group-hover:text-[#DD9E59] transition-colors">
                    {category.title}
                  </h3>
                  <p className="font-sans text-sm leading-relaxed text-[#2A1E17]/85">
                    {category.description}
                  </p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-[#A47251]/5">
                  <Link
                    href={category.linkHref}
                    className="inline-flex items-center text-sm font-semibold tracking-wide text-[#2A1E17] hover:text-[#DD9E59] transition-colors"
                  >
                    <span>{category.linkText}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.2}
                      stroke="currentColor"
                      className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
