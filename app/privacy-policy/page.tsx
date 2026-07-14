import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Warm Delights Artisanal Bakery",
  description: "Read our privacy policy and data agreement guidelines. Learn how Warm Delights handles customer data, ordering details, and secure transactions.",
};

export default function PrivacyPolicyPage() {
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
              <span className="text-[#2A1E17]">Privacy Policy</span>
            </li>
          </ol>
        </nav>

        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#DD9E59]">
            Data Agreement & Protection
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#2A1E17]">
            Privacy Policy
          </h1>
          <div className="h-1 w-16 bg-[#DD9E59] mx-auto rounded-none" />
          <p className="text-xs sm:text-sm text-[#2A1E17]/70 uppercase tracking-widest font-bold">
            Last Updated: July 13, 2026
          </p>
        </div>

        {/* Policy Content Card */}
        <div className="bg-white border border-[#A47251]/10 p-8 sm:p-10 shadow-xs space-y-8 text-[#2A1E17]/90 rounded-none">
          
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-2">
              1. Information We Collect
            </h2>
            <p className="font-sans text-sm leading-relaxed">
              When you place an order or interact with our storefront, we collect information necessary to fulfill your request and improve your artisanal baking experience. This includes your name, delivery address, phone number, email address, custom cake configurations, and billing info.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-2">
              2. How We Use Your Data
            </h2>
            <p className="font-sans text-sm leading-relaxed">
              We process your details exclusively to coordinate baking schedules, organize branch pickups or home deliveries, verify secure card payments, send manual bank transfer confirmations, and occasionally notify you of menu updates. We will never sell, trade, or share your contact data with external advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-2">
              3. Secure Payments & Processing
            </h2>
            <p className="font-sans text-sm leading-relaxed">
              Online credit card transactions are handled via encrypted payment gateway interfaces. Warm Delights does not store or process complete card numbers on our local databases. Physical Cash on Delivery payments are gathered in person by authorized dispatch riders or bakery managers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-2">
              4. Cookies & Web Analytics
            </h2>
            <p className="font-sans text-sm leading-relaxed">
              Our site employs standard functional cookies to preserve items inside your shopping cart drawer as you browse different categories. Disabling cookies will interrupt order customizer selections and shopping cart functionalities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#2A1E17] border-b border-[#A47251]/5 pb-2">
              5. Contacting Us
            </h2>
            <p className="font-sans text-sm leading-relaxed">
              If you have any questions regarding your data, order logs, or request updates, please connect with us via our <Link href="/contact" className="text-[#DD9E59] font-semibold hover:underline">Contact Page</Link> or call us at (555) 789-2345.
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
