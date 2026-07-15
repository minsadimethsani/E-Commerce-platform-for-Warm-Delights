import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Warm Delights Artisanal Bakery",
  description: "Read the Terms and Conditions of Warm Delights. Learn about our cake ordering, cancellation policies, delivery schedules, and customer guidelines.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-[#FDF9F0] min-h-screen py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#2A1E17]/60">
            <li>
              <Link href="/" className="hover:text-[#DD9E59] transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="h-3 w-3 text-[#2A1E17]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[#2A1E17]">Terms &amp; Conditions</span>
            </li>
          </ol>
        </nav>

        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#DD9E59]">
            Client &amp; Service Agreement
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#2A1E17]">
            Terms &amp; Conditions
          </h1>
          <div className="h-1 w-16 bg-[#DD9E59] mx-auto rounded-none" />
          <p className="text-xs sm:text-sm text-[#2A1E17]/70 uppercase tracking-widest font-bold">
            Last Updated: July 15, 2026
          </p>
        </div>

        {/* Policy Content Card */}
        <div className="bg-white border border-[#A47251]/10 p-8 sm:p-10 shadow-xs space-y-8 text-[#2A1E17]/90 rounded-none">
          
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-2">
              1. Order Placement &amp; Customization
            </h2>
            <p className="font-sans text-sm leading-relaxed">
              All custom cake designs, size selections, and toppings configurations must be completed through our online platform order system. Please ensure all spelling, flavors, and collection branch selections are accurate at checkout.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-2">
              2. Baking Schedules &amp; Pickups
            </h2>
            <p className="font-sans text-sm leading-relaxed">
              Our pastries and savory goods are baked fresh daily. Pickups are scheduled at your selected branch during operating hours. If you fail to retrieve a custom cake order within 24 hours of the scheduled pickup date, the order will be disposed of without any eligibility for a refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-2">
              3. Cancellation &amp; Refund Policy
            </h2>
            <p className="font-sans text-sm leading-relaxed">
              Cancellations for standard products must be requested at least 24 hours prior to the scheduled delivery or pickup. For custom designer cakes, cancellations are only accepted up to 48 hours in advance, as special decorations and cake bases are prepared ahead of schedule.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-2">
              4. Freshness &amp; Handling Guarantee
            </h2>
            <p className="font-sans text-sm leading-relaxed">
              We guarantee the quality and freshness of our products at the time of pickup or delivery handover. Warm Delights is not liable for structural damages, meltings, or drops occurring after the order has been successfully picked up or delivered by the dispatch rider.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-2">
              5. Queries &amp; Concerns
            </h2>
            <p className="font-sans text-sm leading-relaxed">
              For any urgent order revisions or quality disputes, please call us directly or use our <Link href="/contact" className="text-[#DD9E59] font-semibold hover:underline">Contact Page</Link> for prompt assistance.
            </p>
          </section>

        </div>

        {/* Action Button */}
        <div className="text-center pt-10">
          <Link
            href="/menu"
            className="inline-block bg-[#A47251] text-white px-8 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:bg-[#DD9E59] hover:text-[#2A1E17] rounded-none shadow-sm hover:shadow-md cursor-pointer"
          >
            Return to Menu
          </Link>
        </div>

      </div>
    </div>
  );
}
