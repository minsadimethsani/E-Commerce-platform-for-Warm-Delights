"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2D1E18]/8 bg-[#FDFCF9]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo / Brand Name */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold tracking-wide text-[#2D1E18] transition-colors group-hover:text-[#C2957C]">
                Warm Delights
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-10">
            <Link
              href="/"
              className="font-sans text-sm font-medium tracking-wide text-[#2D1E18]/85 transition-colors hover:text-[#C2957C]"
            >
              Home
            </Link>
            <Link
              href="/menu"
              className="font-sans text-sm font-medium tracking-wide text-[#2D1E18]/85 transition-colors hover:text-[#C2957C]"
            >
              Menu
            </Link>
            <Link
              href="#"
              className="font-sans text-sm font-medium tracking-wide text-[#2D1E18]/85 transition-colors hover:text-[#C2957C]"
            >
              About Us
            </Link>
            <Link
              href="#"
              className="font-sans text-sm font-medium tracking-wide text-[#2D1E18]/85 transition-colors hover:text-[#C2957C]"
            >
              Contact
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="hidden md:flex items-center space-x-6 text-[#2D1E18]/90">
            {/* Search Button */}
            <button
              aria-label="Search"
              className="p-1.5 rounded-full transition-colors hover:bg-[#2D1E18]/5 hover:text-[#C2957C]"
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

            {/* Profile Button */}
            <button
              aria-label="Profile"
              className="p-1.5 rounded-full transition-colors hover:bg-[#2D1E18]/5 hover:text-[#C2957C]"
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
              aria-label="Shopping Cart"
              className="relative p-1.5 rounded-full transition-colors hover:bg-[#2D1E18]/5 hover:text-[#C2957C]"
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
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E5A193] text-[9.5px] font-bold text-white ring-2 ring-[#FDFCF9]">
                2
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-[#2D1E18] hover:bg-[#2D1E18]/5 hover:text-[#C2957C] focus:outline-none"
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
        <div className="md:hidden border-t border-[#2D1E18]/8 bg-[#FDFCF9]" id="mobile-menu">
          <div className="space-y-1 px-4 py-4 sm:px-6">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-[#2D1E18] hover:bg-[#FAF5F0] hover:text-[#C2957C]"
            >
              Home
            </Link>
            <Link
              href="/menu"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-[#2D1E18]/85 hover:bg-[#FAF5F0] hover:text-[#C2957C]"
            >
              Menu
            </Link>
            <Link
              href="#"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-[#2D1E18]/85 hover:bg-[#FAF5F0] hover:text-[#C2957C]"
            >
              About Us
            </Link>
            <Link
              href="#"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-[#2D1E18]/85 hover:bg-[#FAF5F0] hover:text-[#C2957C]"
            >
              Contact
            </Link>

            <div className="mt-6 border-t border-[#2D1E18]/5 pt-4 flex items-center justify-around text-[#2D1E18]">
              <button
                aria-label="Search"
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-[#2D1E18]/5"
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
                <span className="text-sm font-medium">Search</span>
              </button>

              <button
                aria-label="Profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-[#2D1E18]/5"
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

              <button
                aria-label="Shopping Cart"
                className="relative flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-[#2D1E18]/5"
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
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E5A193] text-[8.5px] font-bold text-white">
                    2
                  </span>
                </div>
                <span className="text-sm font-medium">Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
