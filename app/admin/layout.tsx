"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: DashboardIcon },
  { name: "Orders", href: "/admin/orders", icon: OrdersIcon },
  { name: "Products", href: "/admin/products", icon: ProductsIcon },
  { name: "Categories & Tags", href: "/admin/categories", icon: CategoriesIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userProfile, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login?redirect=%2Fadmin");
      } else if (userProfile?.role !== "admin") {
        router.replace("/");
      }
    }
  }, [user, userProfile, loading, router]);

  // Refresh router on pathname change to pull latest Firestore data
  useEffect(() => {
    router.refresh();
  }, [pathname, router]);

  if (loading || !user || userProfile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex flex-col items-center justify-center space-y-4">
        <span className="inline-block h-10 w-10 border-4 border-[#C5A880] border-t-transparent rounded-full animate-spin"></span>
        <p className="text-xs font-bold uppercase tracking-widest text-[#2A1E17]/60 animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col lg:flex-row">
      
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#2A1E17] text-[#FBFBF9]/90 border-r border-[#2A1E17]/10 z-30">
        <div className="flex h-20 items-center px-6 border-b border-[#FBFBF9]/10">
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="font-serif text-xl font-bold tracking-wide text-white">
              Warm Delights <span className="text-[#C5A880] text-xs uppercase tracking-wider block font-sans font-semibold mt-0.5">Admin Portal</span>
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
                    ? "bg-[#C5A880] text-[#2A1E17] shadow-sm"
                    : "hover:bg-white/5 hover:text-white text-[#FBFBF9]/75"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-[#2A1E17]" : "text-[#FBFBF9]/50 group-hover:text-white"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions in sidebar */}
        <div className="p-4 border-t border-[#FBFBF9]/10 space-y-3">
          <Link
            href="/"
            className="flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-[#FBFBF9]/70 hover:bg-white/5 hover:text-white transition-all"
          >
            <StorefrontIcon className="h-5 w-5 text-[#FBFBF9]/50" />
            <span>Storefront</span>
          </Link>

          {/* Admin User Card (Bottom Left Corner) */}
          {user && (
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 mt-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-[#C5A880] text-[#2A1E17] font-bold text-sm">
                  {userProfile?.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">
                    {userProfile?.displayName || "Admin User"}
                  </span>
                  <span className="text-[10px] text-[#FBFBF9]/50 truncate">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-[#FBFBF9]/50 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-all cursor-pointer shrink-0"
              >
                <LogoutIcon className="h-4.5 w-4.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sticky Header */}
      <header className="lg:hidden sticky top-0 z-40 flex h-16 items-center justify-between bg-[#2A1E17] text-[#FBFBF9] px-4 sm:px-6 shadow-sm">
        <div className="flex items-center">
          <span className="font-serif text-lg font-bold tracking-wide text-white">
            Warm Delights <span className="text-[#C5A880] text-[10px] font-sans font-bold uppercase ml-1">Admin</span>
          </span>
        </div>

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          type="button"
          aria-label="Open sidebar"
          className="rounded-md p-1.5 text-[#FBFBF9]/90 hover:bg-white/10 hover:text-white focus:outline-none"
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
            className="fixed inset-0 bg-[#2A1E17]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex w-full max-w-xs flex-col bg-[#2A1E17] py-6 px-6 shadow-xl transition-all h-full text-[#FBFBF9]/90">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <span className="font-serif text-lg font-bold text-white">Warm Delights</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                type="button"
                className="rounded-md p-1 text-[#FBFBF9]/80 hover:bg-white/10 hover:text-white transition-colors"
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
                        ? "bg-[#C5A880] text-[#2A1E17]"
                        : "hover:bg-white/5 hover:text-white text-[#FBFBF9]/75"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-4 space-y-3">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#FBFBF9]/70 hover:bg-white/5 hover:text-white"
              >
                <StorefrontIcon className="h-5 w-5" />
                <span>Storefront</span>
              </Link>

              {user && (
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-[#C5A880] text-[#2A1E17] font-bold text-sm">
                      {userProfile?.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "A"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">
                        {userProfile?.displayName || "Admin User"}
                      </span>
                      <span className="text-[10px] text-[#FBFBF9]/50 truncate font-mono">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                    }}
                    title="Sign Out"
                    className="p-1.5 text-[#FBFBF9]/50 hover:text-rose-450 hover:bg-white/5 rounded-lg transition-all cursor-pointer shrink-0"
                  >
                    <LogoutIcon className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}
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

function CategoriesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.659A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  );
}

function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
  );
}
