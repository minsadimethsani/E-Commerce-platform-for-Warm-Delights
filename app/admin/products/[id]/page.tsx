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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#A47251]/10 pb-6">
        <div className="space-y-2">
          <LinkBack href="/admin/products" />
          <h1 className="font-serif text-3xl font-bold text-[#2A1E17] tracking-tight">
            Product Details: {product.name}
          </h1>
          <p className="text-sm text-[#2A1E17]/70">
            Review details, monitor ingredients and care instructions, and check customer reviews.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link
            href={`/admin/products?edit=${product.id}`}
            className="inline-flex items-center space-x-2 bg-[#A47251] text-white rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer shadow-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.04a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
            <span>Edit Product</span>
          </Link>
        </div>
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
      className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#DD9E59] hover:text-[#2A1E17] transition-colors"
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
