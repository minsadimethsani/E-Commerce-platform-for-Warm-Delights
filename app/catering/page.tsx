"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function CateringPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [guestCount, setGuestCount] = useState("25-50 Guests");
  const [eventType, setEventType] = useState("Wedding");
  const [serviceStyle, setServiceStyle] = useState("Dessert Station & Setup");
  const [budgetRange, setBudgetRange] = useState("LKR 50,000 - 100,000");
  const [specialNotes, setSpecialNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null);

  // Autofill user info if logged in
  useEffect(() => {
    if (user) {
      setFullName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !email.trim() || !eventDate) {
      showError("Please complete all required fields (*)", "Missing Information");
      return;
    }

    setIsSubmitting(true);
    try {
      const { collection, getDocs, doc, setDoc } = await import("firebase/firestore");
      
      const inquiriesRef = collection(db, "catering_inquiries");
      const snapshot = await getDocs(inquiriesRef);
      let maxNum = 0;
      snapshot.forEach((d) => {
        const parsed = parseInt(d.id.replace("cat-inq-", ""), 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      });
      const generatedId = `cat-inq-${maxNum + 1}`;

      const inquiryData = {
        id: generatedId,
        userId: user?.uid || "guest",
        fullName,
        email,
        phone,
        eventDate,
        eventTime,
        guestCount,
        eventType,
        serviceStyle,
        budgetRange,
        specialNotes,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = doc(db, "catering_inquiries", generatedId);
      await setDoc(docRef, inquiryData);

      setSubmittedInquiryId(generatedId);
      showSuccess(`Catering inquiry #${generatedId} submitted! Our event planner will contact you within 24 hours.`, "Inquiry Received");

      // Reset form
      setSpecialNotes("");
    } catch (err) {
      console.error("Error submitting catering inquiry:", err);
      showError("Could not submit catering inquiry. Please try again or call our hotline.", "Submission Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8] text-[#2A1E17] font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0D1B2A] text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 opacity-25">
          <Image
            src="/hero_bakery.png"
            alt="Warm Delights Catering Spread"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#E09F3E]/20 text-[#E09F3E] text-xs font-bold uppercase tracking-widest border border-[#E09F3E]/30">
            Artisan Event Catering & Dessert Tables
          </span>
          
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Elevate Your Celebrations with Handcrafted Warm Delights
          </h1>

          <p className="text-base sm:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed font-light">
            From majestic wedding dessert bars and corporate high teas to intimate family milestones, our master pastry chefs create memorable culinary experiences tailored to your unique taste.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#inquiry-form"
              className="px-8 py-3.5 rounded-xl text-sm font-bold bg-[#E09F3E] text-white hover:bg-[#DD9E59] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
            >
              Request Catering Quote
            </a>
            <a
              href="#packages"
              className="px-8 py-3.5 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all border border-white/20 cursor-pointer"
            >
              Explore Packages
            </a>
          </div>
        </div>
      </section>

      {/* 2. SERVICES OFFERED */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#E09F3E]">What We Cater</h2>
          <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D1B2A]">
            Bespoke Catering for Every Occasion
          </h3>
          <p className="text-sm text-[#2A1E17]/70 leading-relaxed">
            Whether you need a full live station, custom gift boxes, or pre-ordered platter spreads, we bring passion and elegance to every detail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-[#A47251]/15 shadow-sm hover:shadow-md transition-all group">
            <div className="h-12 w-12 rounded-xl bg-[#E09F3E]/10 text-[#E09F3E] flex items-center justify-center mb-5 group-hover:bg-[#E09F3E] group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 01-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M3 21h18M3 10h18a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1v-7a1 1 0 011-1z" />
              </svg>
            </div>
            <h4 className="font-serif text-xl font-bold text-[#0D1B2A] mb-2">Weddings & Receptions</h4>
            <p className="text-xs text-[#2A1E17]/70 leading-relaxed">
              Multi-tiered centerpiece cakes, customized dessert stations, and luxury guest favor boxes tailored to your wedding theme.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-[#A47251]/15 shadow-sm hover:shadow-md transition-all group">
            <div className="h-12 w-12 rounded-xl bg-[#E09F3E]/10 text-[#E09F3E] flex items-center justify-center mb-5 group-hover:bg-[#E09F3E] group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="font-serif text-xl font-bold text-[#0D1B2A] mb-2">Corporate Events</h4>
            <p className="text-xs text-[#2A1E17]/70 leading-relaxed">
              Executive breakfast croissants, high tea platters, branded cupcakes, and coffee break pastries for product launches & meetings.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-[#A47251]/15 shadow-sm hover:shadow-md transition-all group">
            <div className="h-12 w-12 rounded-xl bg-[#E09F3E]/10 text-[#E09F3E] flex items-center justify-center mb-5 group-hover:bg-[#E09F3E] group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h4 className="font-serif text-xl font-bold text-[#0D1B2A] mb-2">Birthdays & Parties</h4>
            <p className="text-xs text-[#2A1E17]/70 leading-relaxed">
              Whimsical theme cakes, macaron towers, dessert cups, and cake pops crafted to light up birthdays and anniversary bashes.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 border border-[#A47251]/15 shadow-sm hover:shadow-md transition-all group">
            <div className="h-12 w-12 rounded-xl bg-[#E09F3E]/10 text-[#E09F3E] flex items-center justify-center mb-5 group-hover:bg-[#E09F3E] group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm0 13C10.832 21 4 20 4 20l1-13h14l1 13s-6.832 1-8 1z" />
              </svg>
            </div>
            <h4 className="font-serif text-xl font-bold text-[#0D1B2A] mb-2">High Tea & Pastries</h4>
            <p className="text-xs text-[#2A1E17]/70 leading-relaxed">
              Freshly baked scones with clotted cream, spinach & feta quiches, gourmet croissants, and artisanal fruit tarts.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CATERING PACKAGES */}
      <section id="packages" className="py-20 bg-[#FDF9F0] border-y border-[#A47251]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#E09F3E]">Curated Experiences</h2>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D1B2A]">Popular Catering Packages</h3>
            <p className="text-sm text-[#2A1E17]/70">
              Select from our pre-designed menu packages or customize items to suit your guest preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Package 1 */}
            <div className="bg-white rounded-3xl p-8 border border-[#A47251]/15 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E09F3E] bg-[#E09F3E]/10 px-3 py-1 rounded-full">
                  Intimate Gatherings
                </span>
                <h4 className="font-serif text-2xl font-bold text-[#0D1B2A] mt-4 mb-2">Sweet Indulgence Box</h4>
                <p className="text-xs text-[#2A1E17]/70 mb-6">Ideal for 15-20 guests (High tea or dessert bar addition)</p>
                
                <div className="text-3xl font-serif font-bold text-[#0D1B2A] mb-6">
                  LKR 32,500 <span className="text-xs font-sans text-[#2A1E17]/60 font-normal">/ package</span>
                </div>

                <ul className="space-y-3 text-xs text-[#2A1E17]/80 mb-8">
                  <li className="flex items-center space-x-2">
                    <span className="text-[#E09F3E] font-bold">&check;</span>
                    <span>15 Mini Gourmet Cupcakes (Assorted flavors)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#E09F3E] font-bold">&check;</span>
                    <span>20 French Macarons (Raspberry & Chocolate)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#E09F3E] font-bold">&check;</span>
                    <span>15 Mini Fruit Tarts with Vanilla Custard</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#E09F3E] font-bold">&check;</span>
                    <span>15 Fudgy Chocolate Brownie Bites</span>
                  </li>
                </ul>
              </div>

              <a
                href="#inquiry-form"
                onClick={() => {
                  setServiceStyle("Sweet Indulgence Package");
                  setBudgetRange("LKR 30,000 - 50,000");
                }}
                className="w-full py-3 rounded-xl text-center text-xs font-bold bg-[#0D1B2A] text-white hover:bg-[#E09F3E] transition-colors block cursor-pointer"
              >
                Select Package
              </a>
            </div>

            {/* Package 2 (Featured) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-[#E09F3E] shadow-xl transition-all flex flex-col justify-between relative transform lg:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E09F3E] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow">
                Most Popular
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E09F3E] bg-[#E09F3E]/10 px-3 py-1 rounded-full">
                  Full Event Spread
                </span>
                <h4 className="font-serif text-2xl font-bold text-[#0D1B2A] mt-4 mb-2">Gourmet Savory & Sweet Feast</h4>
                <p className="text-xs text-[#2A1E17]/70 mb-6">Designed for 25-35 guests (Corporate or Birthday)</p>

                <div className="text-3xl font-serif font-bold text-[#0D1B2A] mb-6">
                  LKR 65,000 <span className="text-xs font-sans text-[#2A1E17]/60 font-normal">/ package</span>
                </div>

                <ul className="space-y-3 text-xs text-[#2A1E17]/80 mb-8">
                  <li className="flex items-center space-x-2">
                    <span className="text-[#E09F3E] font-bold">&check;</span>
                    <span>25 Mini Spinach & Feta Quiches</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#E09F3E] font-bold">&check;</span>
                    <span>25 Almond Butter Croissant Sandwiches</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#E09F3E] font-bold">&check;</span>
                    <span>1 Single-Tier Custom Celebration Cake (1.5kg)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#E09F3E] font-bold">&check;</span>
                    <span>30 Mini Desserts (Tarts, Macarons, Cupcakes)</span>
                  </li>
                </ul>
              </div>

              <a
                href="#inquiry-form"
                onClick={() => {
                  setServiceStyle("Gourmet Savory & Sweet Feast");
                  setBudgetRange("LKR 50,000 - 100,000");
                }}
                className="w-full py-3 rounded-xl text-center text-xs font-bold bg-[#E09F3E] text-white hover:bg-[#DD9E59] transition-colors block cursor-pointer shadow-md"
              >
                Select Package
              </a>
            </div>

            {/* Package 3 */}
            <div className="bg-white rounded-3xl p-8 border border-[#A47251]/15 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E09F3E] bg-[#E09F3E]/10 px-3 py-1 rounded-full">
                  Grand Celebrations
                </span>
                <h4 className="font-serif text-2xl font-bold text-[#0D1B2A] mt-4 mb-2">Grand Delights Experience</h4>
                <p className="text-xs text-[#2A1E17]/70 mb-6">Suitable for 50+ guests (Weddings & Large Galas)</p>

                <div className="text-3xl font-serif font-bold text-[#0D1B2A] mb-6">
                  LKR 125,000+ <span className="text-xs font-sans text-[#2A1E17]/60 font-normal">/ package</span>
                </div>

                <ul className="space-y-3 text-xs text-[#2A1E17]/80 mb-8">
                  <li className="flex items-center space-x-2">
                    <span className="text-[#E09F3E] font-bold">&check;</span>
                    <span>2 or 3-Tier Showstopper Wedding/Event Cake</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#E09F3E] font-bold">&check;</span>
                    <span>Full Dessert Bar Table Setup & Linen Decor</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#E09F3E] font-bold">&check;</span>
                    <span>80+ Assorted Savory Pastries & Mini Canapés</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-[#E09F3E] font-bold">&check;</span>
                    <span>Dedicated On-Site Service Staff & Delivery</span>
                  </li>
                </ul>
              </div>

              <a
                href="#inquiry-form"
                onClick={() => {
                  setServiceStyle("Grand Delights Experience");
                  setBudgetRange("LKR 100,000+");
                }}
                className="w-full py-3 rounded-xl text-center text-xs font-bold bg-[#0D1B2A] text-white hover:bg-[#E09F3E] transition-colors block cursor-pointer"
              >
                Select Package
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 4. INQUIRY FORM SECTION */}
      <section id="inquiry-form" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#A47251]/15 shadow-xl p-8 sm:p-12">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#E09F3E]">Book Your Event</h2>
            <h3 className="font-serif text-3xl font-bold text-[#0D1B2A]">Request a Catering Quote</h3>
            <p className="text-xs text-[#2A1E17]/70">
              Fill out the details below and our master event coordinator will get back to you with custom menu options and pricing.
            </p>
          </div>

          {submittedInquiryId ? (
            <div className="bg-[#FDF9F0] border border-[#E09F3E]/30 rounded-2xl p-8 text-center space-y-4 animate-in fade-in duration-300">
              <div className="h-16 w-16 bg-[#E09F3E] text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#0D1B2A]">Inquiry Submitted Successfully!</h4>
              <p className="text-xs text-[#2A1E17]/80 max-w-md mx-auto">
                Thank you for choosing Warm Delights! Your inquiry reference is <strong className="text-[#E09F3E]">#{submittedInquiryId}</strong>. Our team is preparing your custom proposal.
              </p>
              <div className="pt-4 flex justify-center space-x-4">
                <button
                  onClick={() => setSubmittedInquiryId(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0D1B2A] text-white hover:bg-[#E09F3E] transition-colors"
                >
                  Submit Another Inquiry
                </button>
                <Link
                  href="/menu"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#E09F3E]/10 text-[#E09F3E] hover:bg-[#E09F3E]/20 transition-colors"
                >
                  Browse Storefront
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitInquiry} className="space-y-6">
              
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1B2A] mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amanda Perera"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-[#0D1B2A]/15 bg-[#F9F9F8] px-4 py-3 text-xs text-[#0D1B2A] focus:border-[#E09F3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1B2A] mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="amanda@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#0D1B2A]/15 bg-[#F9F9F8] px-4 py-3 text-xs text-[#0D1B2A] focus:border-[#E09F3E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Phone & Event Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1B2A] mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#0D1B2A]/15 bg-[#F9F9F8] px-4 py-3 text-xs text-[#0D1B2A] focus:border-[#E09F3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1B2A] mb-2">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-xl border border-[#0D1B2A]/15 bg-[#F9F9F8] px-4 py-3 text-xs text-[#0D1B2A] focus:border-[#E09F3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1B2A] mb-2">
                    Estimated Guest Count
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full rounded-xl border border-[#0D1B2A]/15 bg-[#F9F9F8] px-4 py-3 text-xs text-[#0D1B2A] focus:border-[#E09F3E] focus:outline-none"
                  >
                    <option value="Under 20 Guests">Under 20 Guests</option>
                    <option value="25-50 Guests">25-50 Guests</option>
                    <option value="50-100 Guests">50-100 Guests</option>
                    <option value="100+ Guests">100+ Guests</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Event Type & Service Preference */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1B2A] mb-2">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full rounded-xl border border-[#0D1B2A]/15 bg-[#F9F9F8] px-4 py-3 text-xs text-[#0D1B2A] focus:border-[#E09F3E] focus:outline-none"
                  >
                    <option value="Wedding">Wedding / Engagement</option>
                    <option value="Corporate">Corporate Event</option>
                    <option value="Birthday">Birthday Party</option>
                    <option value="HighTea">High Tea & Gathering</option>
                    <option value="Other">Other Celebration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1B2A] mb-2">
                    Package / Service Style
                  </label>
                  <input
                    type="text"
                    value={serviceStyle}
                    onChange={(e) => setServiceStyle(e.target.value)}
                    placeholder="e.g. Dessert Station / Custom Package"
                    className="w-full rounded-xl border border-[#0D1B2A]/15 bg-[#F9F9F8] px-4 py-3 text-xs text-[#0D1B2A] focus:border-[#E09F3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1B2A] mb-2">
                    Estimated Budget
                  </label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full rounded-xl border border-[#0D1B2A]/15 bg-[#F9F9F8] px-4 py-3 text-xs text-[#0D1B2A] focus:border-[#E09F3E] focus:outline-none"
                  >
                    <option value="Under LKR 30,000">Under LKR 30,000</option>
                    <option value="LKR 30,000 - 50,000">LKR 30,000 - 50,000</option>
                    <option value="LKR 50,000 - 100,000">LKR 50,000 - 100,000</option>
                    <option value="LKR 100,000+">LKR 100,000+</option>
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0D1B2A] mb-2">
                  Special Notes or Dietary Requirements
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about color themes, eggless options, specific cake flavors, or setup venue..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#0D1B2A]/15 bg-[#F9F9F8] px-4 py-3 text-xs text-[#0D1B2A] focus:border-[#E09F3E] focus:outline-none"
                />
              </div>

              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#E09F3E] text-white hover:bg-[#DD9E59] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Submitting Inquiry..." : "Submit Catering Inquiry"}
                </button>
              </div>

            </form>
          )}

        </div>
      </section>

    </div>
  );
}
