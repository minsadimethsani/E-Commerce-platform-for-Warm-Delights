import Image from "next/image";
import Link from "next/link";

export default function Story() {
  return (
    <section className="bg-[#faf5f0] py-24 sm:py-32 border-y border-[#2d1e18]/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          
          {/* Column 1: Image Frame */}
          <div className="relative">
            {/* Decorative Gold Frame Background */}
            <div className="absolute -top-4 -left-4 h-full w-full rounded-2xl border-2 border-[#c2957c]/30 -z-10 hidden sm:block translate-x-2 translate-y-2" />
            
            {/* Image */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg aspect-4/3 sm:aspect-square lg:aspect-4/3">
              <Image
                src="/about_bakery.png"
                alt="Baking ingredients and artisanal preparation on a counter"
                fill
                className="object-cover transition-transform duration-500 hover:scale-103"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            
            {/* Overlay Badge */}
            <div className="absolute -bottom-6 right-6 rounded-2xl bg-[#2d1e18] p-6 text-white shadow-xl max-w-xs hidden sm:block">
              <p className="font-serif text-2xl font-bold text-[#c2957c]">Since 2018</p>
              <p className="mt-1 text-xs text-[#fdfcf9]/80 font-sans leading-relaxed">
                Handcrafting warm memories and premium baked goods daily.
              </p>
            </div>
          </div>

          {/* Column 2: Text Copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#c2957c]">
                Crafted with Passion
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2d1e18] sm:text-5xl leading-tight">
                Our Recipe is Simple: <br />
                We Bake with Love
              </h2>
            </div>
            
            <p className="text-base leading-relaxed text-[#55433c]/85 font-sans">
              Warm Delights began as a humble home-baking project born from the sheer joy of creating memories around dessert tables. Over the years, we have grown into a beloved neighborhood bakery, known for our gourmet signature cakes and warm, savory puff pastries.
            </p>
            
            <p className="text-base leading-relaxed text-[#55433c]/85 font-sans">
              We believe that good baking takes time and patience. Every single croissant is hand-rolled, every sponge is baked in small batches, and every slice of buttercream cake is decorated by hand. We use zero artificial preservatives—only pure creamery butter, locally-sourced fruits, and imported premium cocoa.
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#2d1e18]/8">
              <div>
                <p className="font-serif text-3xl font-bold text-[#2d1e18]">100%</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#55433c]/60">
                  Natural Ingredients
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-[#2d1e18]">Baked</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#55433c]/60">
                  Fresh Every Morning
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="#"
                className="inline-flex items-center rounded-full bg-[#2d1e18] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#c2957c] hover:text-[#2d1e18]"
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
