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
        <h1 className="font-serif text-3xl font-bold text-[#2D1E18] tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-[#55433C]/70">
          Real-time insights and analytics for Warm Delights bakery operations.
        </p>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Sales Card */}
        <div className="rounded-2xl border border-[#2D1E18]/5 bg-[#FAF5F0]/50 p-6 transition-all hover:bg-[#FAF5F0] hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Total Revenue</span>
            <span className="text-lg">💰</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-serif font-bold text-[#2D1E18]">Rs. {totalSales.toFixed(2)}</span>
            <span className="block mt-1 text-[10px] font-semibold text-emerald-600">Excludes cancelled orders</span>
          </div>
        </div>

        {/* Active Orders Card */}
        <div className="rounded-2xl border border-[#2D1E18]/5 bg-[#FAF5F0]/50 p-6 transition-all hover:bg-[#FAF5F0] hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Active Orders</span>
            <span className="text-lg">🛒</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-serif font-bold text-[#2D1E18]">{activeOrders.length}</span>
            <span className="block mt-1 text-[10px] font-semibold text-[#C2957C]">Requires baking / dispatch</span>
          </div>
        </div>

        {/* Catalog Size Card */}
        <div className="rounded-2xl border border-[#2D1E18]/5 bg-[#FAF5F0]/50 p-6 transition-all hover:bg-[#FAF5F0] hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Total Products</span>
            <span className="text-lg">🍰</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-serif font-bold text-[#2D1E18]">{totalProducts}</span>
            <span className="block mt-1 text-[10px] font-semibold text-[#55433C]/60">Items in online catalog</span>
          </div>
        </div>

        {/* Rating Card */}
        <div className="rounded-2xl border border-[#2D1E18]/5 bg-[#FAF5F0]/50 p-6 transition-all hover:bg-[#FAF5F0] hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Average Rating</span>
            <span className="text-lg">⭐</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-serif font-bold text-[#2D1E18]">{avgRating.toFixed(1)} / 5.0</span>
            <span className="block mt-1 text-[10px] font-semibold text-amber-500">Based on {reviews.length} reviews</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Orders & Products */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Side: Recent Orders Table (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#2D1E18]">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold uppercase tracking-wider text-[#C2957C] hover:text-[#2D1E18] transition-colors"
            >
              Manage Orders &rarr;
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#2D1E18]/5 bg-white shadow-xs">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-[#55433C]/60 text-sm">
                No orders placed yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#2D1E18]/5">
                  <thead className="bg-[#FAF5F0]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Order ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Items Count</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#55433C]/60">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D1E18]/5 bg-white">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#FAF5F0]/30 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-[#2D1E18]">
                          {order.id}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-[#55433C]">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-[#2D1E18]">
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
            <h2 className="font-serif text-xl font-bold text-[#2D1E18]">Highly Rated</h2>
            <Link
              href="/admin/products"
              className="text-xs font-bold uppercase tracking-wider text-[#C2957C] hover:text-[#2D1E18] transition-colors"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="rounded-2xl border border-[#2D1E18]/5 bg-white p-6 shadow-xs space-y-4">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between pb-3 border-b border-[#2D1E18]/5 last:border-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#2D1E18]/5">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2D1E18] line-clamp-1">{p.name}</h4>
                    <span className="text-[10px] text-[#55433C]/60 uppercase font-semibold">{p.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-[#2D1E18]">Rs. {p.price.toFixed(2)}</span>
                  <span className="block text-[10px] font-semibold text-amber-500">⭐ {p.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
