"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide public storefront footer on admin portal pages
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#A47251] text-[#FDF9F0]/90">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold tracking-wide text-white">
              Warm Delights
            </h2>
            <p className="text-sm leading-relaxed text-[#FDF9F0]/75 font-sans">
              Handcrafting sweet moments and savory pleasures daily.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-5">
              <Link
                href="#"
                className="text-[#FDF9F0]/60 hover:text-[#DD9E59] transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.01 3.796.056 1.03.047 1.724.222 2.2.406a4.63 4.63 0 011.64 1.07 4.625 4.625 0 011.07 1.64c.184.477.359 1.17.406 2.2.047 1.012.056 1.366.056 3.796 0 2.43-.01 2.784-.056 3.796-.047 1.03-.222 1.724-.406 2.2a4.63 4.63 0 01-1.07 1.64 4.625 4.625 0 01-1.64 1.07c-.477.184-1.17.359-2.2.406-1.012.047-1.366.056-3.796.056-2.43 0-2.784-.01-3.796-.056-1.03-.047-1.724-.222-2.2-.406a4.63 4.63 0 01-1.64-1.07 4.625 4.625 0 01-1.07-1.64c-.184-.477-.359-1.17-.406-2.2C2.01 16.2 2 15.846 2 13.417c0-2.43.01-2.784.056-3.796.047-1.03.222-1.724.406-2.2a4.63 4.63 0 011.07-1.64 4.63 4.63 0 011.64-1.07c.477-.184 1.17-.359 2.2-.406 1.012-.047 1.366-.056 3.796-.056L12.315 2zm0 2.062c-2.405 0-2.69.01-3.637.052-.877.04-1.354.187-1.67.31a2.569 2.569 0 00-.95.619 2.57 2.57 0 00-.62.95c-.122.315-.27.792-.31 1.67C5.01 8.527 5 8.81 5 11.215c0 2.405.01 2.69.052 3.637.04.877.187 1.354.31 1.67.122.315.27.792.31 1.67.042.947.052 1.232.052 3.637s-.01 2.69-.052 3.636c-.04.878-.187 1.354-.31 1.67a2.57 2.57 0 00-.619.95 2.569 2.569 0 00-.95.619c-.315.122-.792.27-1.67.31-.947.042-1.233.052-3.637.052-2.405 0-2.69-.01-3.637-.052-.877-.04-1.354-.187-1.67-.31a2.57 2.57 0 00-.95-.619 2.57 2.57 0 00-.62-.95c-.122-.315-.27-.792-.31-1.67C9.01 13.9 9 13.617 9 11.212c0-2.405.01-2.69.052-3.637.04-.877.187-1.354.31-1.67.122-.315.27-.792.31-1.67.042-.947.052-1.232.052-3.637s-.01-2.69-.052-3.637c-.04-.877-.187-1.354-.31-1.67a2.57 2.57 0 00-.62-.95 2.57 2.57 0 00-.95-.619c-.315-.122-.792-.27-1.67-.31C15.617 4.01 15.33 4 12.927 4h-.612zM12 7.785a4.43 4.43 0 100 8.86 4.43 4.43 0 000-8.86zm0 2.062a2.368 2.368 0 110 4.735 2.368 2.368 0 010-4.735zm6.541-1.579a1.037 1.037 0 11-2.073 0 1.037 1.037 0 012.073 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-[#FDF9F0]/60 hover:text-[#DD9E59] transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-[#FDF9F0]/60 hover:text-[#DD9E59] transition-colors"
                aria-label="Pinterest"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.248 2.656 7.876 6.4 9.356-.088-.79-.166-2.003.034-2.868.181-.782 1.17-4.962 1.17-4.962s-.299-.597-.299-1.48c0-1.385.803-2.42 1.802-2.42.85 0 1.26.638 1.26 1.402 0 .855-.544 2.134-.825 3.32-.234.988.497 1.794 1.47 1.794 1.764 0 3.12-1.86 3.12-4.545 0-2.378-1.708-4.04-4.14-4.04-2.82 0-4.475 2.117-4.475 4.302 0 .853.328 1.767.738 2.266a.23.23 0 01.053.22c-.08.332-.258 1.052-.293 1.196-.046.19-.153.23-.353.137-1.317-.614-2.14-2.538-2.14-4.08 0-3.322 2.414-6.374 6.96-6.374 3.654 0 6.495 2.604 6.495 6.085 0 3.63-2.288 6.55-5.462 6.55-1.066 0-2.07-.554-2.412-1.208l-.657 2.502c-.238.914-.881 2.062-1.313 2.76A10.003 10.003 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold tracking-wide text-white">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm font-sans">
              <li>
                <Link
                  href="/"
                  className="text-[#FDF9F0]/75 hover:text-[#DD9E59] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/menu"
                  className="text-[#FDF9F0]/75 hover:text-[#DD9E59] transition-colors"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/menu?category=Custom"
                  className="text-[#FDF9F0]/75 hover:text-[#DD9E59] transition-colors"
                >
                  Custom Cakes
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[#FDF9F0]/75 hover:text-[#DD9E59] transition-colors"
                >
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Hours */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold tracking-wide text-white">
              Opening Hours
            </h3>
            <ul className="space-y-2.5 text-sm font-sans text-[#FDF9F0]/75">
              <li className="flex justify-between">
                <span>Mon - Sat:</span>
                <span>8:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between text-[#DD9E59]">
                <span>Sunday:</span>
                <span>9:00 AM - 6:00 PM</span>
              </li>
              <li className="pt-2 border-t border-[#FDF9F0]/10">
                <span className="block font-medium text-white">Warm Delights </span>
                <span className="block mt-1">Boralesgamuwa, Nugegoda,Sri Lanka</span>
                <span className="block mt-0.5">Tel: +94 75 552 4468</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold tracking-wide text-white">
              Newsletter
            </h3>
            <p className="text-sm leading-relaxed text-[#FDF9F0]/75 font-sans">
              Subscribe to receive updates on seasonal specials, New Arrivals and exclusive offers.
            </p>
            <form className="mt-4 sm:flex sm:max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="email-address"
                required
                className="w-full min-w-0 rounded-none border border-[#FDF9F0]/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-[#FDF9F0]/40 focus:border-[#DD9E59] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#DD9E59]"
                placeholder="Enter your email"
              />
              <button
                type="submit"
                className="mt-2 sm:mt-0 flex w-full sm:w-auto items-center justify-center rounded-none bg-[#DD9E59] px-4 py-2 text-sm font-semibold text-[#2A1E17] transition-colors hover:bg-[#F0D8A1] hover:text-white"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="mt-16 border-t border-[#FDF9F0]/8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FDF9F0]/50 font-sans">
          <p>&copy; {new Date().getFullYear()} Warm Delights Bakery. All rights reserved.</p>
          <div className="mt-4 sm:mt-0 space-x-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
