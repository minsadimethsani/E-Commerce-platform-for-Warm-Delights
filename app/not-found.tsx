import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipe Not Found | Warm Delights",
  description: "The page you are looking for does not exist on our menu.",
};

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#FBFBF9] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        {/* Baking Themed Graphic */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 -m-4 bg-[#C5A880]/5 rounded-full blur-xl animate-pulse"></div>
          <svg
            className="w-48 h-48 text-[#2A1E17] relative drop-shadow-sm"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Steam trails */}
            <path
              d="M75 40 Q80 25 75 10 T75 -10"
              stroke="#C5A880"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-pulse"
              opacity="0.6"
            />
            <path
              d="M100 40 Q105 20 100 0 T100 -20"
              stroke="#C5A880"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-pulse"
              style={{ animationDelay: "0.3s" }}
              opacity="0.8"
            />
            <path
              d="M125 40 Q130 25 125 10 T125 -10"
              stroke="#C5A880"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-pulse"
              style={{ animationDelay: "0.6s" }}
              opacity="0.6"
            />

            {/* Baking cloche / Cake dome */}
            <path
              d="M40 140 C40 70 160 70 160 140 Z"
              fill="#EFEFEA"
              stroke="#2A1E17"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            {/* Handle on top */}
            <circle cx="100" cy="70" r="10" fill="#EFEFEA" stroke="#2A1E17" strokeWidth="5" />
            
            {/* Cloche tray / base */}
            <path
              d="M25 140 H175"
              stroke="#2A1E17"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M30 140 C30 148 170 148 170 140"
              fill="#2A1E17"
            />

            {/* Missing treat crumb silhouette inside */}
            <circle cx="95" cy="115" r="4" fill="#C5A880" />
            <circle cx="115" cy="125" r="3" fill="#C5A880" opacity="0.8" />
            <circle cx="85" cy="130" r="2.5" fill="#C5A880" opacity="0.6" />
          </svg>
        </div>

        {/* Text Section */}
        <div className="space-y-4">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C5A880] bg-[#C5A880]/10 px-3 py-1 rounded-none">
            Error 404
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2A1E17]">
            Recipe Not Found
          </h1>
          <p className="font-sans text-sm text-[#3A2E2B]/80 leading-relaxed max-w-sm mx-auto">
            It looks like this page rose a bit too high and disappeared! The recipe or link you are looking for doesn&apos;t exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3 rounded-none text-xs font-bold uppercase tracking-wider text-white bg-[#2A1E17] hover:bg-[#C5A880] hover:text-[#2A1E17] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer text-center"
          >
            Return to Home
          </Link>
          <Link
            href="/menu"
            className="w-full sm:w-auto px-8 py-3 rounded-none text-xs font-bold uppercase tracking-wider text-[#2A1E17] border border-[#2A1E17]/20 hover:border-[#2A1E17] hover:bg-[#EFEFEA] transition-all duration-300 cursor-pointer text-center"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
