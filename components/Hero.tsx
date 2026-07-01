import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-[#2d1e18]">
      {/* Background Image with Next.js 16 optimization */}
      <Image
        src="/hero_bakery.png"
        alt="Gourmet decorated cake on a bakery workshop counter"
        fill
        className="object-cover opacity-65"
        sizes="100vw"
        preload
        loading="eager"
      />

      {/* Dark Vignette Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2d1e18]/80 via-[#2d1e18]/45 to-[#2d1e18]/30" />

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-block rounded-full bg-[#faf5f0]/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-[#e5a193] uppercase backdrop-blur-sm border border-white/10 mb-6">
          Handcrafted Daily in Small Batches
        </span>
        
        <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
          Crafting Warm Moments of <br className="hidden sm:inline" />
          <span className="text-[#c2957c]">Artisanal Delight</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#fdfcf9]/85">
          From rustic, decadent signature cakes for your special milestones to warm, flaky, golden-brown savory pastries. Baked fresh daily with love and local premium ingredients.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#"
            className="w-full sm:w-auto rounded-full bg-[#c2957c] px-8 py-4 text-sm font-semibold tracking-wide text-[#2d1e18] shadow-lg transition-all hover:bg-[#e5a193] hover:text-white hover:scale-102 hover:shadow-xl text-center"
          >
            Order Online
          </Link>
          <Link
            href="#"
            className="w-full sm:w-auto rounded-full border-2 border-white/80 bg-transparent px-8 py-4 text-sm font-semibold tracking-wide text-white transition-all hover:bg-white hover:text-[#2d1e18] hover:scale-102 text-center"
          >
            Explore Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
