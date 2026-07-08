import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { getReviewsByProductId } from "@/lib/reviews";
import AdminProductDetailClient from "./AdminProductDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const reviews = await getReviewsByProductId(id);

  return (
    <div className="space-y-8">
      {/* Page Header with Back Link */}
      <div className="space-y-2">
        <LinkBack href="/admin/products" />
        <h1 className="font-serif text-3xl font-bold text-[#2A1E17] tracking-tight">
          Product Details: {product.name}
        </h1>
        <p className="text-sm text-[#3A2E2B]/70">
          Review details, monitor ingredients and care instructions, and check customer reviews.
        </p>
      </div>

      <AdminProductDetailClient product={product} initialReviews={reviews} />
    </div>
  );
}

// Simple Back link element
import Link from "next/link";
function LinkBack({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#C5A880] hover:text-[#2A1E17] transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-3.5 h-3.5 mr-1"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
      Back to Products
    </Link>
  );
}
