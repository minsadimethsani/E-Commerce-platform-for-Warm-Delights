"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulate API request delay
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "general", message: "" });
    }, 1200);
  };

  return (
    <div className="bg-[#FDF9F0] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
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
              <span className="text-[#2A1E17]">Contact Us</span>
            </li>
          </ol>
        </nav>

        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#DD9E59]">
            Get In Touch
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2A1E17]">
            Connect With Our Bakery
          </h1>
          <div className="h-1 w-16 bg-[#DD9E59] mx-auto rounded-none" />
          <p className="text-sm sm:text-base md:text-lg text-[#2A1E17]/80 leading-relaxed max-w-2xl mx-auto">
            Have a question about custom cakes, catering services, or our baking processes? Drop us a line—our ovens are warm, and we are always happy to listen.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
          
          {/* Left Column: Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#F0D8A1]/45 border border-[#A47251]/5 rounded-none p-8 sm:p-10 space-y-8">
              
              {/* Bakery Details */}
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold text-[#2A1E17]">Warm Delights HQ</h3>
                
                <div className="space-y-4 text-[#2A1E17]/90 text-sm">
                  {/* Address */}
                  <div className="flex items-start space-x-3">
                    <div className="border border-[#A47251]/10 p-1.5 bg-white flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-[#2A1E17]">
                        <polygon points="12,2 20,8 20,22 4,22 4,8" strokeLinecap="square" strokeLinejoin="miter" />
                        <rect x="10" y="10" width="4" height="4" />
                      </svg>
                    </div>
                    <div>
                      <span className="block font-semibold text-[#2A1E17]">Address</span>
                      <span className="block mt-1">123 Sweetwater Lane, Suite 40</span>
                      <span className="block">San Francisco, CA 94103</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-3">
                    <div className="border border-[#A47251]/10 p-1.5 bg-white flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-[#2A1E17]">
                        <rect x="5" y="3" width="14" height="18" strokeLinecap="square" strokeLinejoin="miter" />
                        <rect x="10" y="17" width="4" height="2" />
                      </svg>
                    </div>
                    <div>
                      <span className="block font-semibold text-[#2A1E17]">Phone</span>
                      <span className="block mt-1 hover:text-[#DD9E59] transition-colors">
                        <a href="tel:+15557892345">(555) 789-2345</a>
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-3">
                    <div className="border border-[#A47251]/10 p-1.5 bg-white flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-[#2A1E17]">
                        <rect x="3" y="5" width="18" height="14" strokeLinecap="square" strokeLinejoin="miter" />
                        <polygon points="3,5 12,13 21,5" strokeLinecap="square" strokeLinejoin="miter" />
                      </svg>
                    </div>
                    <div>
                      <span className="block font-semibold text-[#2A1E17]">Email</span>
                      <span className="block mt-1 hover:text-[#DD9E59] transition-colors">
                        <a href="mailto:hello@warmdelights.com">hello@warmdelights.com</a>
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Opening Hours */}
              <div className="space-y-4 pt-6 border-t border-[#A47251]/10">
                <h4 className="font-serif text-lg font-bold text-[#2A1E17]">Bakery Hours</h4>
                <ul className="space-y-2.5 text-sm text-[#2A1E17]/85">
                  <li className="flex justify-between">
                    <span>Monday - Saturday:</span>
                    <span className="font-semibold">8:00 AM - 8:00 PM</span>
                  </li>
                  <li className="flex justify-between text-[#DD9E59]">
                    <span>Sunday:</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 bg-[#FDF9F0] rounded-none border border-[#A47251]/5 space-y-2">
                <span className="font-serif font-bold text-sm text-[#2A1E17] flex items-center gap-2 block">
                  <span className="inline-block border border-[#A47251]/10 bg-[#F0D8A1] px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-sans">Event</span>
                  Custom & Event Orders
                </span>
                <p className="text-xs text-[#2A1E17]/75 leading-relaxed">
                  Planning a wedding, birthday, or corporate gathering? We recommend ordering custom tiered cakes at least 2 weeks in advance.
                </p>
              </div>

            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#FDF9F0] border border-[#A47251]/10 rounded-none p-8 sm:p-10 shadow-xs">
              <h3 className="font-serif text-2xl font-bold text-[#2A1E17] mb-6">Send A Message</h3>
              
              {status === "success" ? (
                /* Success feedback UI */
                <div className="text-center py-12 px-6 bg-[#DCF0C3] rounded-none border border-[#DCF0C3] text-[#2A1E17] space-y-4 animate-fade-in">
                  <div className="mx-auto w-12 h-12 border border-[#DCF0C3] bg-white flex items-center justify-center font-bold text-[#2A1E17] text-lg">
                    OK
                  </div>
                  <h4 className="font-serif font-bold text-xl">Thank you for writing!</h4>
                  <p className="text-sm max-w-sm mx-auto opacity-90">
                    Your message has been whisked away to our culinary team. We will review your inquiry and get back to you within 24 hours.
                  </p>

                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-6 inline-block rounded-none bg-[#A47251] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#A47251] transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                /* Form UI */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-[#F0D8A1]/50 border border-[#A47251]/10 rounded-none py-3 px-4 text-sm text-[#2A1E17] placeholder-[#2A1E17]/50 focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59] transition-all"
                        placeholder="e.g. Emily Watson"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-[#F0D8A1]/50 border border-[#A47251]/10 rounded-none py-3 px-4 text-sm text-[#2A1E17] placeholder-[#2A1E17]/50 focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59] transition-all"
                        placeholder="e.g. emily@example.com"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">
                      Inquiry Type
                    </label>
                    <div className="relative">
                      <select
                        name="subject"
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full appearance-none bg-[#F0D8A1]/50 border border-[#A47251]/10 rounded-none py-3 pl-4 pr-10 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59] cursor-pointer transition-all"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="custom-cake">Custom Cake Order Inquiry</option>
                        <option value="catering">Catering & Corporate Booking</option>
                        <option value="feedback">Feedback & Suggestions</option>
                      </select>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="absolute right-4 top-3.5 w-4 h-4 text-[#2A1E17]/60 pointer-events-none"
                      >
                        <path strokeLinecap="square" strokeLinejoin="miter" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-[#2A1E17]">
                      Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full bg-[#F0D8A1]/50 border border-[#A47251]/10 rounded-none py-3 px-4 text-sm text-[#2A1E17] placeholder-[#2A1E17]/50 focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59] transition-all resize-none"
                      placeholder="Write your request details here..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full rounded-none bg-[#A47251] text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs hover:shadow-md"
                  >
                    {status === "submitting" ? "Sending inquiry..." : "Send Inquiry"}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
