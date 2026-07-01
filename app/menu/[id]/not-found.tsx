import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default async function ProductNotFound() {
  const allProducts = await getAllProducts();
  
  // Select 4 recommended products (bestsellers, chef specials, or popular items)
  const recommendations = allProducts
    .filter(
      (p) =>
        p.badge?.toLowerCase() === "bestseller" ||
        p.badge?.toLowerCase() === "best seller" ||
        p.badge?.toLowerCase() === "popular" ||
        p.badge?.toLowerCase() === "chef special"
    )
    .slice(0, 4);

  // Fallback if we don't have enough featured/bestseller products
  if (recommendations.length < 4) {
    const fallback = allProducts
      .filter((p) => !recommendations.some((rp) => rp.id === p.id))
      .slice(0, 4 - recommendations.length);
    recommendations.push(...fallback);
  }

  return (
    <div className="bg-[#FDFCF9] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-12">
          <ol className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#55433C]/60">
            <li>
              <Link href="/" className="hover:text-[#C2957C] transition-colors cursor-pointer">
                Home
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="h-3 w-3 text-[#55433C]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link href="/menu" className="hover:text-[#C2957C] transition-colors cursor-pointer">
                Menu
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="h-3 w-3 text-[#55433C]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-[#2D1E18]">Treat Not Found</li>
          </ol>
        </nav>

        {/* Main 404 Section */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto py-8 mb-16 animate-fade-in">
          {/* Empty Dessert Dome SVG */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#C2957C]/5 rounded-full blur-xl animate-pulse"></div>
            <svg
              className="w-36 h-36 text-[#2D1E18] relative"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Stand base */}
              <path d="M30 85 H70 M50 72 V85" stroke="#2D1E18" strokeWidth="4" strokeLinecap="round" />
              
              {/* Cake Stand Plate */}
              <path d="M20 72 H80" stroke="#2D1E18" strokeWidth="5" strokeLinecap="round" />
              <path d="M22 72 Q50 76 78 72" fill="#2D1E18" />

              {/* Glass Dome */}
              <path d="M26 68 C26 30 74 30 74 68 Z" stroke="#2D1E18" strokeWidth="4" strokeLinejoin="round" fill="#FAF5F0" fillOpacity="0.3" />
              <circle cx="50" cy="27" r="4.5" fill="#FAF5F0" stroke="#2D1E18" strokeWidth="3" />

              {/* Glass glare line */}
              <path d="M33 50 A 20 20 0 0 1 48 35" stroke="#C2957C" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

              {/* Crumb Silhouette (Empty stand) */}
              <circle cx="45" cy="67" r="1.5" fill="#C2957C" />
              <circle cx="56" cy="68" r="1" fill="#C2957C" />
              <circle cx="38" cy="68" r="1.2" fill="#C2957C" opacity="0.7" />
            </svg>
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[#C2957C] mb-3">
            Treat Unavailable
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2D1E18] mb-4">
            Where Did the Treat Go?
          </h1>
          <p className="font-sans text-sm text-[#55433C]/80 leading-relaxed mb-8 max-w-md">
            This particular treat might have been retired from our menu, eaten, or is currently unavailable. 
            But don't worry, our ovens are always baking new delights!
          </p>

          <Link
            href="/menu"
            className="rounded-full bg-[#2D1E18] text-white px-8 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-[#C2957C] hover:text-[#2D1E18] shadow-sm hover:shadow-md cursor-pointer"
          >
            Explore All Treats
          </Link>
        </div>

        {/* Recommendations Section */}
        <section className="border-t border-[#2D1E18]/10 pt-16 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C2957C]">
                Recommendations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2D1E18]">
                Try These Popular Treats Instead
              </h2>
            </div>
            <Link
              href="/menu"
              className="mt-4 sm:mt-0 text-xs font-bold uppercase tracking-wider text-[#2D1E18] hover:text-[#C2957C] flex items-center transition-colors cursor-pointer group"
            >
              <span>View Full Menu</span>
              <svg
                className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendations.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
