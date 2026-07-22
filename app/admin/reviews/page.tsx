import { getAllReviews } from "@/lib/reviews";
import { getAllProducts } from "@/lib/products";
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminReviewsPage() {
  const [reviews, products] = await Promise.all([
    getAllReviews(),
    getAllProducts()
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2A1E17] tracking-tight">Customer Reviews Manager</h1>
        <p className="mt-1 text-sm text-[#2A1E17]/70">
          Moderate customer reviews and feedback for all menu products.
        </p>
      </div>

      <ReviewsClient initialReviews={reviews} products={products} />
    </div>
  );
}
