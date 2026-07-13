import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { getAllOrders } from "@/lib/orders";
import { getAllReviews } from "@/lib/reviews";

// Ensure the page fetches fresh database entries on every load
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const products = await getAllProducts();
  const orders = await getAllOrders();
  const reviews = await getAllReviews();

  // Compute analytics from live database collections
  const totalSales = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrders = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  );

  const totalProducts = products.length;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 4.8; // Fallback to baker's default if empty

  // Filter 5 most recent orders
  const recentOrders = orders.slice(0, 5);

  // Group top products based on reviews/ratings
  const topProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <div className="space-y-10">
      
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2A1E17] tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-[#3A2E2B]/70">
          Real-time insights and analytics for Warm Delights bakery operations.
        </p>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Sales Card */}
        <div className="rounded-2xl border border-[#2A1E17]/5 bg-[#EFEFEA]/50 p-6 transition-all hover:bg-[#EFEFEA] hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">Total Revenue</span>
            <div className="border border-[#2A1E17]/10 p-1 bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-[#2A1E17]">
                <rect x="3" y="6" width="18" height="12" strokeLinecap="square" strokeLinejoin="miter" />
                <rect x="9" y="10" width="6" height="4" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-serif font-bold text-[#2A1E17]">Rs. {totalSales.toFixed(2)}</span>
            <span className="block mt-1 text-[10px] font-semibold text-emerald-600">Excludes cancelled orders</span>
          </div>
        </div>

        {/* Active Orders Card */}
        <div className="rounded-2xl border border-[#2A1E17]/5 bg-[#EFEFEA]/50 p-6 transition-all hover:bg-[#EFEFEA] hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">Active Orders</span>
            <div className="border border-[#2A1E17]/10 p-1 bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-[#2A1E17]">
                <polygon points="3,6 7,6 9,16 20,16 21,8 6,8" strokeLinecap="square" strokeLinejoin="miter" />
                <rect x="9" y="18" width="2" height="2" />
                <rect x="17" y="18" width="2" height="2" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-serif font-bold text-[#2A1E17]">{activeOrders.length}</span>
            <span className="block mt-1 text-[10px] font-semibold text-[#C5A880]">Requires baking / dispatch</span>
          </div>
        </div>

        {/* Catalog Size Card */}
        <div className="rounded-2xl border border-[#2A1E17]/5 bg-[#EFEFEA]/50 p-6 transition-all hover:bg-[#EFEFEA] hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">Total Products</span>
            <div className="border border-[#2A1E17]/10 p-1 bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-[#2A1E17]">
                <rect x="4" y="12" width="16" height="8" strokeLinecap="square" strokeLinejoin="miter" />
                <rect x="6" y="6" width="12" height="6" strokeLinecap="square" strokeLinejoin="miter" />
                <line x1="12" y1="2" x2="12" y2="6" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-serif font-bold text-[#2A1E17]">{totalProducts}</span>
            <span className="block mt-1 text-[10px] font-semibold text-[#3A2E2B]/60">Items in online catalog</span>
          </div>
        </div>

        {/* Rating Card */}
        <div className="rounded-2xl border border-[#2A1E17]/5 bg-[#EFEFEA]/50 p-6 transition-all hover:bg-[#EFEFEA] hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">Average Rating</span>
            <div className="border border-amber-200 p-1 bg-amber-50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-amber-600">
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-serif font-bold text-[#2A1E17]">{avgRating.toFixed(1)} / 5.0</span>
            <span className="block mt-1 text-[10px] font-semibold text-amber-500">Based on {reviews.length} reviews</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Orders & Products */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Side: Recent Orders Table (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#2A1E17]">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold uppercase tracking-wider text-[#C5A880] hover:text-[#2A1E17] transition-colors"
            >
              Manage Orders &rarr;
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#2A1E17]/5 bg-white shadow-xs">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-[#3A2E2B]/60 text-sm">
                No orders placed yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#2A1E17]/5">
                  <thead className="bg-[#EFEFEA]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">Items Count</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#3A2E2B]/60">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A1E17]/5 bg-white">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#EFEFEA]/30 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-[#2A1E17]">
                          {order.id}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-[#3A2E2B]">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-[#2A1E17]">
                          Rs. {order.total.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span
                            className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              order.status === "delivered"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : order.status === "cancelled"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Popular Products List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#2A1E17]">Highly Rated</h2>
            <Link
              href="/admin/products"
              className="text-xs font-bold uppercase tracking-wider text-[#C5A880] hover:text-[#2A1E17] transition-colors"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="rounded-2xl border border-[#2A1E17]/5 bg-white p-6 shadow-xs space-y-4">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between pb-3 border-b border-[#2A1E17]/5 last:border-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#2A1E17]/5">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2A1E17] line-clamp-1">{p.name}</h4>
                    <span className="text-[10px] text-[#3A2E2B]/60 uppercase font-semibold">{p.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-[#2A1E17]">Rs. {p.price.toFixed(2)}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1 py-0.5 mt-0.5">Rating: {p.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
