"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { getCart, removeFromCart, updateCartQuantity, CartItem, clearCart } from "@/lib/cart";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Interactive States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCartItems(getCart());
      setMounted(true);
    }, 0);

    const handleCartUpdate = () => {
      setCartItems(getCart());
    };

    const handleOpenCart = () => {
      setIsCartOpen(true);
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("open-cart", handleOpenCart);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("open-cart", handleOpenCart);
      clearTimeout(timer);
    };
  }, []);

  const cartCount = mounted ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const totalAmount = cartItems.reduce(
    (acc, item) => acc + (item.selectedVariant ? item.selectedVariant.price : item.product.price) * item.quantity,
    0
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim() !== "") {
      router.push(`/menu?search=${encodeURIComponent(searchValue.trim())}`);
      setIsSearchOpen(false);
      setSearchValue("");
      setIsOpen(false); // Close mobile menu if open
    }
  };

  const handleCheckout = () => {
    setIsOrderPlaced(true);
    clearCart();
  };

  // Hide public storefront header on admin portal pages
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#0D1B2A]/8 bg-[#F9F9F8]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo / Brand Name */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold tracking-wide text-[#0D1B2A] transition-colors group-hover:text-[#E09F3E]">
                Warm Delights
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-10">
            <Link
              href="/"
              className="font-sans text-sm font-medium tracking-wide text-[#0D1B2A]/85 transition-colors hover:text-[#E09F3E]"
            >
              Home
            </Link>
            <Link
              href="/menu"
              className="font-sans text-sm font-medium tracking-wide text-[#0D1B2A]/85 transition-colors hover:text-[#E09F3E]"
            >
              Menu
            </Link>
            <Link
              href="/about"
              className="font-sans text-sm font-medium tracking-wide text-[#0D1B2A]/85 transition-colors hover:text-[#E09F3E]"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="font-sans text-sm font-medium tracking-wide text-[#0D1B2A]/85 transition-colors hover:text-[#E09F3E]"
            >
              Contact
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="hidden md:flex items-center space-x-6 text-[#0D1B2A]/90">
            {/* Search Container */}
            <div className="relative flex items-center">
              {isSearchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-[#EAE8E4] border border-[#0D1B2A]/10 rounded-full px-3 py-1.5 w-64 animate-fade-in"
                >
                  <input
                    type="text"
                    placeholder="Search treats..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent border-none text-xs text-[#0D1B2A] placeholder-[#0D1B2A]/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-0.5 rounded-full hover:bg-[#0D1B2A]/10 text-[#0D1B2A]/60 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                /* Search Button */
                <button
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search"
                  className="p-1.5 rounded-full transition-colors hover:bg-[#0D1B2A]/5 hover:text-[#E09F3E] cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-5.5 h-5.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Profile Button */}
            <button
              aria-label="Profile"
              className="p-1.5 rounded-full transition-colors hover:bg-[#0D1B2A]/5 hover:text-[#E09F3E] cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5.5 h-5.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Cart"
              className="relative p-1.5 rounded-full transition-colors hover:bg-[#0D1B2A]/5 hover:text-[#E09F3E] cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5.5 h-5.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {/* Badge */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E09F3E] text-[9.5px] font-bold text-white ring-2 ring-[#F9F9F8]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-[#0D1B2A] hover:bg-[#0D1B2A]/5 hover:text-[#E09F3E] focus:outline-none cursor-pointer"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-[#0D1B2A]/8 bg-[#F9F9F8]" id="mobile-menu">
          <div className="space-y-1 px-4 py-4 sm:px-6">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-[#0D1B2A] hover:bg-[#EAE8E4] hover:text-[#E09F3E]"
            >
              Home
            </Link>
            <Link
              href="/menu"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-[#0D1B2A]/85 hover:bg-[#EAE8E4] hover:text-[#E09F3E]"
            >
              Menu
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-[#0D1B2A]/85 hover:bg-[#EAE8E4] hover:text-[#E09F3E]"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-[#0D1B2A]/85 hover:bg-[#EAE8E4] hover:text-[#E09F3E]"
            >
              Contact
            </Link>

            {/* Mobile Search input inline */}
            <div className="mt-6 border-t border-[#0D1B2A]/5 pt-4 px-3">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#EAE8E4] border border-[#0D1B2A]/10 rounded-full px-3 py-2 w-full">
                <span className="text-[#0D1B2A]/50 mr-2 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search treats..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full bg-transparent border-none text-sm text-[#0D1B2A] placeholder-[#0D1B2A]/50 focus:outline-none"
                />
              </form>
            </div>

            <div className="mt-4 border-t border-[#0D1B2A]/5 pt-4 flex items-center justify-around text-[#0D1B2A]">
              {/* Profile Button Mobile */}
              <button
                aria-label="Profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-[#0D1B2A]/5 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5.5 h-5.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <span className="text-sm font-medium">Account</span>
              </button>

              {/* Cart Button Mobile */}
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  setIsOpen(false);
                }}
                aria-label="Shopping Cart"
                className="relative flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-[#0D1B2A]/5 cursor-pointer"
              >
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-5.5 h-5.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E09F3E] text-[8.5px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop overlay */}
            <div
              className="absolute inset-0 bg-[#0D1B2A]/40 backdrop-blur-xs transition-opacity"
              onClick={() => {
                setIsCartOpen(false);
                setIsOrderPlaced(false);
              }}
            />

            {/* Slide-over panel */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md bg-[#F9F9F8] shadow-2xl flex flex-col h-screen transform transition-all duration-300">
                
                {/* Header */}
                <div className="px-6 py-6 border-b border-[#0D1B2A]/5 flex items-center justify-between">
                  <h2 className="font-serif text-lg font-bold text-[#0D1B2A]">Your Shopping Bag</h2>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsOrderPlaced(false);
                    }}
                    className="p-1 text-[#0D1B2A]/60 hover:text-[#E09F3E] cursor-pointer"
                  >
                    <span className="sr-only">Close panel</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {isOrderPlaced ? (
                    /* Checkout Success view */
                    <div className="text-center py-16 space-y-4">
                      <span className="text-4xl block">🎉</span>
                      <h3 className="font-serif font-bold text-xl text-emerald-800">Order Placed!</h3>
                      <p className="text-sm text-[#0D1B2A]/75 max-w-xs mx-auto">
                        Your fresh delights order has been received. Thank you for baking with Warm Delights!
                      </p>
                      <button
                        onClick={() => {
                          setIsOrderPlaced(false);
                          setIsCartOpen(false);
                        }}
                        className="rounded-full bg-emerald-700 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 cursor-pointer"
                      >
                        Keep Browsing
                      </button>
                    </div>
                  ) : cartItems.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-16 space-y-4">
                      <span className="text-3xl block">👜</span>
                      <p className="text-sm text-[#0D1B2A]/60">Your shopping bag is empty.</p>
                      <Link
                        href="/menu"
                        onClick={() => setIsCartOpen(false)}
                        className="inline-block rounded-full bg-[#0D1B2A] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#E09F3E] hover:text-[#0D1B2A]"
                      >
                        Explore Our Menu
                      </Link>
                    </div>
                  ) : (
                    /* Items List */
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={`${item.product.id}-${item.selectedVariant?.name || "base"}`} className="flex items-center space-x-4 p-3 bg-white rounded-xl border border-[#0D1B2A]/5">
                          {/* Image */}
                          <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-[#0D1B2A]/5 flex-shrink-0">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-sm font-bold text-[#0D1B2A] truncate">{item.product.name}</h4>
                            {item.selectedVariant && (
                              <span className="inline-block px-1.5 py-0.5 bg-[#EAE8E4] rounded-md text-[9px] font-bold text-[#0D1B2A]/70 uppercase tracking-wide mb-1">
                                {item.selectedVariant.name}
                              </span>
                            )}
                            <span className="text-[10px] text-[#E09F3E] font-bold uppercase tracking-wider block mb-1">
                              {item.product.category}
                            </span>
                            <span className="text-xs font-medium text-[#0D1B2A]/60 block">
                              Rs. {(item.selectedVariant ? item.selectedVariant.price : item.product.price).toFixed(2)} each
                            </span>
                          </div>

                          {/* Controls */}
                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex items-center space-x-2 bg-[#EAE8E4]/50 border border-[#0D1B2A]/10 rounded-full px-1.5 py-0.5 scale-90">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.selectedVariant?.name, item.quantity - 1)}
                                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#0D1B2A]/5 font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-xs font-semibold text-[#0D1B2A] w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.selectedVariant?.name, item.quantity + 1)}
                                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#0D1B2A]/5 font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeFromCart(item.product.id, item.selectedVariant?.name)}
                              className="text-[10px] text-red-650 hover:underline font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && !isOrderPlaced && (
                  <div className="px-6 py-6 border-t border-[#0D1B2A]/5 bg-white space-y-4">
                    <div className="flex items-center justify-between text-base font-serif font-bold text-[#0D1B2A]">
                      <span>Subtotal</span>
                      <span>Rs. {totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-[#0D1B2A]/60 font-sans leading-relaxed">
                      Shipping, taxes, and promotional discounts are calculated at final checkout page.
                    </p>
                    <button
                      onClick={handleCheckout}
                      className="w-full rounded-full bg-[#0D1B2A] text-white py-3.5 text-xs font-bold uppercase tracking-wider text-center hover:bg-[#E09F3E] hover:text-[#0D1B2A] transition-all cursor-pointer"
                    >
                      Place Fresh Order
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
