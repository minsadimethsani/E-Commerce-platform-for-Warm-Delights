import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts, getProductById } from "@/lib/products";
import { getAllAddOns } from "@/lib/addons";
import { getReviewsByProductId } from "@/lib/reviews";
import ProductDetailClient from "../../menu/[id]/ProductDetailClient";

import { Product } from "@/data/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate static params for Next.js to pre-render the pages
export async function generateStaticParams() {
  const allProducts: Product[] = await getAllProducts();
  return allProducts.map((product: Product) => ({
    id: product.id,
  }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    return {
      title: "Product Not Found | Warm Delights",
      description: "The requested treat could not be found on our menu.",
    };
  }

  return {
    title: `${product.name} | Warm Delights Menu`,
    description: `${product.description} Handcrafted daily at Warm Delights bakery. Only Rs. ${product.price.toFixed(2)}.`,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const [product, allProducts, addons, reviews]: [Product | undefined, Product[], any[], any[]] = await Promise.all([
    getProductById(resolvedParams.id),
    getAllProducts(),
    getAllAddOns(),
    getReviewsByProductId(resolvedParams.id)
  ]);

  if (!product || product.isAvailable === false) {
    notFound();
  }

  const availableProducts = allProducts.filter((p: Product) => p.isAvailable !== false);

  // Find 4 related products in the same category, excluding current product
  const relatedProducts = availableProducts
    .filter((p: Product) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // If we don't have enough, pad with other products
  if (relatedProducts.length < 4) {
    const fallbackProducts = availableProducts
      .filter((p: Product) => p.id !== product.id && !relatedProducts.some((rp: Product) => rp.id === p.id))
      .slice(0, 4 - relatedProducts.length);
    relatedProducts.push(...fallbackProducts);
  }

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} initialAddOns={addons} initialReviews={reviews} />;
}
