import Image from "next/image";
import Link from "next/link";

export default function Story() {
  return (
    // 1. Reduced top padding drastically (pt-2 / sm:pt-4) to remove the gap beneath the cards
    <section className="bg-[#F0D8A1] pt-2 pb-12 sm:pt-4 sm:pb-20 border-y border-[#A47251]/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 2. Changed items-center to items-start to place content and image align top flush */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Column 1: Image Frame */}
          <div className="relative">
            {/* Decorative Gold Frame Background - Adjusted alignment to fit closer to image top border */}
            <div className="absolute top-0 -left-4 h-full w-full rounded-none border-2 border-[#DD9E59]/30 -z-10 hidden sm:block translate-x-2" />

            {/* Image */}
            <div className="relative overflow-hidden rounded-none shadow-lg aspect-4/3 sm:aspect-square lg:aspect-4/3">
              <Image
                src="/about_bakery.png"
                alt="Baking ingredients and artisanal preparation on a counter"
                fill
                className="object-cover transition-transform duration-500 hover:scale-103"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Overlay Badge */}
            <div className="absolute -bottom-6 right-6 rounded-none bg-[#A47251] p-6 text-white shadow-xl max-w-xs hidden sm:block">
              <p className="font-serif text-2xl font-bold text-[#DD9E59]">Since 2018</p>
              <p className="mt-1 text-xs text-[#FDF9F0]/80 font-sans leading-relaxed">
                Handcrafting warm memories and premium baked goods daily.
              </p>
            </div>
          </div>

          {/* Column 2: Text Copy */}
          {/* 3. Added a subtle pt-2 to line up the baseline text exactly with the image frame top boundary */}
          <div className="space-y-8 pt-2">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#DD9E59]">
                Crafted with Passion
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2A1E17] sm:text-5xl leading-tight">
                Our Recipe is Simple: <br />
                We Bake with Love
              </h2>
            </div>

            <p className="text-base leading-relaxed text-[#2A1E17]/85 font-sans">
              Warm Delights began as a humble home-baking project born from the sheer joy of creating memories around dessert tables. Over the years, we have grown into a beloved neighborhood bakery, known for our gourmet signature cakes and warm, savory puff pastries.
            </p>

            <p className="text-base leading-relaxed text-[#2A1E17]/85 font-sans">
              We believe that good baking takes time and patience. Every single croissant is hand-rolled, every sponge is baked in small batches, and every slice of buttercream cake is decorated by hand. We use zero artificial preservatives—only pure creamery butter, locally-sourced fruits, and imported premium cocoa.
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#A47251]/8">
              <div>
                <p className="font-serif text-3xl font-bold text-[#2A1E17]">100%</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#2A1E17]/60">
                  Natural Ingredients
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-[#2A1E17]">Baked</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#2A1E17]/60">
                  Fresh Every Morning
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center rounded-none bg-[#A47251] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#DD9E59] hover:text-[#2A1E17]"
              >
                Read Our Story
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}