import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story | Warm Delights Artisanal Bakery",
  description:
    "Discover the history, philosophy, and artisanal processes behind Warm Delights Bakery. Founded by Chef Pierre, we use premium, organic, locally-sourced ingredients to bake love into every bite.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FBFBF9] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#3A2E2B]/60">
            <li>
              <Link href="/" className="hover:text-[#C5A880] transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="h-3 w-3 text-[#3A2E2B]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[#2A1E17]">Our Story</span>
            </li>
          </ol>
        </nav>

        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
            Baking With Love
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2A1E17]">
            Our Story & Heritage
          </h1>
          <div className="h-1 w-16 bg-[#C5A880] mx-auto rounded-full" />
          <p className="text-sm sm:text-base md:text-lg text-[#3A2E2B]/80 leading-relaxed max-w-2xl mx-auto">
            From a humble home kitchen to an artisanal neighborhood sanctuary—discover the passion, quality ingredients, and slow-baking philosophy behind every Warm Delights creation.
          </p>
        </div>

        {/* Narrative & Image Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">
          {/* Left: Text Content */}
          <div className="lg:col-span-7 space-y-6 text-[#3A2E2B]/90">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1E17] leading-tight">
              Crafting Sweet Moments and Savory Pleasures Since 2018
            </h2>
            <p className="font-sans text-sm sm:text-base leading-relaxed">
              Warm Delights began with a simple belief: that baking is an act of pure connection. Founded by Chef Pierre after years of training in European pastry arts, our goal has always been to elevate the neighborhood bakery into a space of comfort, premium flavor, and visual wonder.
            </p>
            <p className="font-sans text-sm sm:text-base leading-relaxed">
              We reject shortcuts. There are no artificial preservatives, emulsifiers, or frozen doughs in our kitchen. Instead, our team wakes up at 3:00 AM every morning to hand-laminate croissants, simmer fresh berry compotes, and feed our organic sourdough starter. We believe that time, patience, and attention to detail are what separate ordinary pastries from memory-making treats.
            </p>
            <p className="font-sans text-sm sm:text-base leading-relaxed">
              Every cake, quiche, and cookie that leaves our ovens is a labor of love. We build long-term relationships with local organic wheat farmers, pasture-raised egg producers, and premium dairy creameries to ensure our ingredients are as sustainable as they are delicious.
            </p>
          </div>

          {/* Right: Premium Image Grid */}
          <div className="lg:col-span-5 relative h-[380px] sm:h-[450px] w-full overflow-hidden rounded-2xl border border-[#2A1E17]/5 shadow-md">
            <Image
              src="/about_bakery.png"
              alt="Artisanal Bakery environment showing freshly baked breads and cakes"
              fill
              className="object-cover transition-transform duration-500 hover:scale-102"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
          </div>
        </div>

        {/* Core Philosophy Section */}
        <section className="bg-[#EFEFEA]/45 rounded-3xl p-8 sm:p-12 lg:p-16 mb-24 border border-[#2A1E17]/5">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
              Our Ingredients & Values
            </span>
            <h3 className="font-serif text-3xl font-bold text-[#2A1E17]">
              The Pillars of Warm Delights
            </h3>
            <div className="h-0.5 w-12 bg-[#C5A880] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Value 1 */}
            <div className="bg-[#FBFBF9] p-6 rounded-2xl border border-[#2A1E17]/5 space-y-4">
              <span className="text-3xl block">🌾</span>
              <h4 className="font-serif text-lg font-bold text-[#2A1E17]">Slow Fermentation</h4>
              <p className="text-xs sm:text-sm text-[#3A2E2B]/85 leading-relaxed">
                Our sourdoughs and puff pastries go through extended cold-fermentation periods. This unlocks deep flavor notes and makes our crusts incredibly light and easy to digest.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-[#FBFBF9] p-6 rounded-2xl border border-[#2A1E17]/5 space-y-4">
              <span className="text-3xl block">🥛</span>
              <h4 className="font-serif text-lg font-bold text-[#2A1E17]">Grass-Fed & Organic</h4>
              <p className="text-xs sm:text-sm text-[#3A2E2B]/85 leading-relaxed">
                From 82% fat French-style churning butter to local grass-fed organic milk, we source fats that produce rich creams, flaky layers, and smooth ganaches.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-[#FBFBF9] p-6 rounded-2xl border border-[#2A1E17]/5 space-y-4">
              <span className="text-3xl block">🌱</span>
              <h4 className="font-serif text-lg font-bold text-[#2A1E17]">Zero Preservatives</h4>
              <p className="text-xs sm:text-sm text-[#3A2E2B]/85 leading-relaxed">
                Everything is baked from scratch using pure sugar, real vanilla beans, and actual dark chocolate. We never use pre-mixes, margarine, or artificial flavorings.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-[#FBFBF9] p-6 rounded-2xl border border-[#2A1E17]/5 space-y-4">
              <span className="text-3xl block">❤️</span>
              <h4 className="font-serif text-lg font-bold text-[#2A1E17]">Community Focus</h4>
              <p className="text-xs sm:text-sm text-[#3A2E2B]/85 leading-relaxed">
                We believe a neighborhood bakery should be the heart of a community. We sponsor local farms and host baking workshops to share the joy of sourdough.
              </p>
            </div>
          </div>
        </section>

        {/* Master Baker Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">
          {/* Left: Chef Image */}
          <div className="lg:col-span-5 order-last lg:order-first relative h-[380px] sm:h-[450px] w-full overflow-hidden rounded-2xl border border-[#2A1E17]/5 shadow-md bg-[#2A1E17]/5">
            <Image
              src="/category_cakes.png"
              alt="Chef Pierre decorating a strawberry gateau cake"
              fill
              className="object-cover transition-transform duration-500 hover:scale-102"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>

          {/* Right: Chef Info */}
          <div className="lg:col-span-7 space-y-6 text-[#3A2E2B]/90">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">
              The Artisanal Mind
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2A1E17] leading-tight">
              Chef Pierre & The Culinary Team
            </h2>
            <div className="h-0.5 w-12 bg-[#C5A880] rounded-full" />
            <p className="font-sans text-sm sm:text-base leading-relaxed">
              Chef Pierre brings over 15 years of professional pastry experience, having worked in classical French patisseries in Lyon and modern dessert bars in Melbourne. He believes that baking is both a rigorous science and a fluid, creative art.
            </p>
            <blockquote className="border-l-4 border-[#C5A880] pl-4 py-1 italic text-[#2A1E17] font-serif text-lg">
              &ldquo;A recipe is just a blueprint. The real magic happens when you understand the flour, respect the room temperature, and bake with intent.&rdquo;
            </blockquote>
            <p className="font-sans text-sm sm:text-base leading-relaxed">
              Under Pierre&apos;s leadership, our team of bakers, laminators, and chocolatiers work in complete harmony. From hand-carving custom wedding cake structures to ensuring the crumb of our croissants is perfectly open, the team ensures every delight is a masterpiece.
            </p>
          </div>
        </div>

        {/* Call to Action Banner */}
        <section className="bg-[#2A1E17] text-white rounded-3xl p-8 sm:p-12 lg:p-16 text-center space-y-6 relative overflow-hidden shadow-lg">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#C5A880] opacity-10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#C5A880] opacity-10 rounded-full blur-3xl" />
          
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880] block relative z-10">
            Taste the Craftsmanship
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-xl mx-auto relative z-10">
            Experience Our Freshly Baked Offerings
          </h2>
          <p className="text-[#FBFBF9]/80 max-w-md mx-auto text-sm sm:text-base leading-relaxed relative z-10">
            Every day, we bring a fresh assortment of quiches, pastries, cookies, and layered cakes to life. Order online today or book a custom creation.
          </p>
          <div className="pt-4 relative z-10">
            <Link
              href="/menu"
              className="inline-block rounded-full bg-[#C5A880] text-[#2A1E17] px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-[#FBFBF9] hover:text-[#2A1E17] shadow-sm hover:shadow-md cursor-pointer"
            >
              Explore Our Menu
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
