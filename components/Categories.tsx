import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    title: "Signature Cakes",
    description: "Indulgent layered cakes, classic buttercream sponges, and rich chocolate fudge creations.",
    image: "/category_cakes.png",
    linkText: "View Cakes",
    linkHref: "#",
    tag: "Bestseller",
  },
  {
    title: "Artisanal Savories",
    description: "Warm, flaky puff pastries, freshly baked quiches, and gourmet savory rolls.",
    image: "/category_savories.png",
    linkText: "View Savories",
    linkHref: "#",
    tag: "Fresh Daily",
  },
  {
    title: "Custom Creations",
    description: "Intricately designed cakes customized for weddings, birthdays, and milestones.",
    image: "/category_custom.png",
    linkText: "Design Your Cake",
    linkHref: "#",
    tag: "Made to Order",
  },
];

export default function Categories() {
  return (
    <section className="bg-[#fdfcf9] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2d1e18] sm:text-5xl">
            Our Sweet & Savory Offerings
          </h2>
          <div className="mt-4 h-1 w-12 bg-[#c2957c] mx-auto rounded-full" />
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#55433c]/80">
            Handcrafted with patience, baked to perfection. Explore our artisanal signature ranges.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.title}
              className="group flex flex-col overflow-hidden rounded-2xl bg-[#faf5f0] border border-[#2d1e18]/5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              {/* Image Container */}
              <div className="relative aspect-4/3 overflow-hidden bg-[#2d1e18]/5">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Badge Overlay */}
                <div className="absolute top-4 left-4">
                  <span className="inline-block rounded-md bg-[#fdfcf9] px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#c2957c] uppercase shadow-sm">
                    {category.tag}
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-1 flex-col justify-between p-8">
                <div className="space-y-3">
                  <h3 className="font-serif text-2xl font-bold text-[#2d1e18] group-hover:text-[#c2957c] transition-colors">
                    {category.title}
                  </h3>
                  <p className="font-sans text-sm leading-relaxed text-[#55433c]/85">
                    {category.description}
                  </p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-[#2d1e18]/5">
                  <Link
                    href={category.linkHref}
                    className="inline-flex items-center text-sm font-semibold tracking-wide text-[#2d1e18] hover:text-[#c2957c] transition-colors"
                  >
                    <span>{category.linkText}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.2}
                      stroke="currentColor"
                      className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
