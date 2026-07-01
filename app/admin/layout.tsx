"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: DashboardIcon },
  { name: "Orders", href: "/admin/orders", icon: OrdersIcon },
  { name: "Products", href: "/admin/products", icon: ProductsIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col lg:flex-row">
      
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#2D1E18] text-[#FDFCF9]/90 border-r border-[#2D1E18]/10 z-30">
        <div className="flex h-20 items-center px-6 border-b border-[#FDFCF9]/10">
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="font-serif text-xl font-bold tracking-wide text-white">
              Warm Delights <span className="text-[#C2957C] text-xs uppercase tracking-wider block font-sans font-semibold mt-0.5">Admin Portal</span>
            </span>
          </Link>
        </div>
        
        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center space-x-3 rounded-xl px-4 py-3.5 text-sm font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-[#C2957C] text-[#2D1E18] shadow-sm"
                    : "hover:bg-white/5 hover:text-white text-[#FDFCF9]/75"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-[#2D1E18]" : "text-[#FDFCF9]/50 group-hover:text-white"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions in sidebar */}
        <div className="p-4 border-t border-[#FDFCF9]/10">
          <Link
            href="/"
            className="flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-[#FDFCF9]/70 hover:bg-white/5 hover:text-white transition-all"
          >
            <StorefrontIcon className="h-5 w-5 text-[#FDFCF9]/50" />
            <span>Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Sticky Header */}
      <header className="lg:hidden sticky top-0 z-40 flex h-16 items-center justify-between bg-[#2D1E18] text-[#FDFCF9] px-4 sm:px-6 shadow-sm">
        <div className="flex items-center">
          <span className="font-serif text-lg font-bold tracking-wide text-white">
            Warm Delights <span className="text-[#C2957C] text-[10px] font-sans font-bold uppercase ml-1">Admin</span>
          </span>
        </div>

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          type="button"
          aria-label="Open sidebar"
          className="rounded-md p-1.5 text-[#FDFCF9]/90 hover:bg-white/10 hover:text-white focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </header>

      {/* Mobile Drawer (Slide-over overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#2D1E18]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex w-full max-w-xs flex-col bg-[#2D1E18] py-6 px-6 shadow-xl transition-all h-full text-[#FDFCF9]/90">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <span className="font-serif text-lg font-bold text-white">Warm Delights</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                type="button"
                className="rounded-md p-1 text-[#FDFCF9]/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 space-y-1.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center space-x-3 rounded-xl px-4 py-3.5 text-sm font-semibold tracking-wide transition-all ${
                      isActive
                        ? "bg-[#C2957C] text-[#2D1E18]"
                        : "hover:bg-white/5 hover:text-white text-[#FDFCF9]/75"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#FDFCF9]/70 hover:bg-white/5 hover:text-white"
              >
                <StorefrontIcon className="h-5 w-5" />
                <span>Storefront</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 w-full min-h-screen">
        <main className="flex-1 p-6 sm:p-8 lg:p-10">{children}</main>
      </div>

    </div>
  );
}

// Custom Icons
function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21.75h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21.75h7.5" />
    </svg>
  );
}

function OrdersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function ProductsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l5.096-.813a18.976 18.976 0 0013.062-13.061L21 3m0 0a1.875 1.875 0 10-2.625 2.625L21 3m0 0l-1.875 1.875M9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
    </svg>
  );
}

function StorefrontIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615m-7.5 0h18m-18 0V4.024m18 5.325V4.024m0 0a3.001 3.001 0 0 0-3.75-.615 3.001 3.001 0 0 0-3.75.615m7.5 0h-18m0 0A3.001 3.001 0 0 0 7.5 2.76a3.001 3.001 0 0 0 3.75.65m-7.5 0V1.5h18v1.26" />
    </svg>
  );
}
