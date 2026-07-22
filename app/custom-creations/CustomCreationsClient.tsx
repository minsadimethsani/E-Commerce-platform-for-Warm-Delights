"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { useToast } from "@/context/ToastContext";

export default function CustomCreationsClient() {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const router = useRouter();

  // Custom Order States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [pickupBranch, setPickupBranch] = useState("Main Bakery - Colombo 07");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [requiredTime, setRequiredTime] = useState("");
  const [cakeSize, setCakeSize] = useState("1kg");
  const [cakeFlavor, setCakeFlavor] = useState("Signature Chocolate");
  const [cakeIcing, setCakeIcing] = useState("Buttercream");
  const [instructions, setInstructions] = useState("");
  const [customSampleImage, setCustomSampleImage] = useState<string | null>(null);
  
  const [isCustomSubmitting, setIsCustomSubmitting] = useState(false);
  const [customSuccessId, setCustomSuccessId] = useState<string | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  // Available options
  const [availableSizes, setAvailableSizes] = useState<string[]>(["1kg", "2kg", "3kg", "Custom Size"]);
  const [availableFlavors, setAvailableFlavors] = useState<string[]>(["Signature Chocolate", "Vanilla Bean", "Red Velvet", "Ribbon Cake"]);
  const [availableIcings, setAvailableIcings] = useState<string[]>(["Buttercream", "Fondant", "Chocolate Ganache", "Fresh Cream"]);

  // Custom Creations Gallery State
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);

  // Sync profile details
  useEffect(() => {
    if (user) {
      if (user.displayName) setFullName(user.displayName);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  // Load custom creations products and options
  useEffect(() => {
    const loadData = async () => {
      setIsGalleryLoading(true);
      try {
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);
        const list: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.category === "Custom") {
            list.push({
              id: docSnap.id,
              name: data.name,
              description: data.description || "",
              price: data.price || 0,
              image: data.image || "/category_custom.png",
              category: data.category,
              rating: data.rating || 5.0,
              reviewsCount: data.reviewsCount || 0,
            } as Product);
          }
        });
        setCustomProducts(list);

        // Fetch dynamic variation options from database if custom template product exists
        const customTemplate = list.find((p) => p.name.toLowerCase().includes("custom"));
        if (customTemplate) {
          const docData = snapshot.docs.find((d) => d.id === customTemplate.id)?.data();
          const rawSizes = docData?.sizes || [];
          const rawFlavors = docData?.flavors || [];
          const rawIcings = docData?.icings || [];

          const finalSizes = rawSizes.map((s: any) => (typeof s === "string" ? s : s.name));
          const finalFlavors = rawFlavors.map((f: any) => (typeof f === "string" ? f : f.name));
          const finalIcings = rawIcings.map((ic: any) => (typeof ic === "string" ? ic : ic.name));

          if (finalSizes.length > 0) {
            setAvailableSizes(finalSizes);
            setCakeSize(finalSizes[0]);
          }
          if (finalFlavors.length > 0) {
            setAvailableFlavors(finalFlavors);
            setCakeFlavor(finalFlavors[0]);
          }
          if (finalIcings.length > 0) {
            setAvailableIcings(finalIcings);
            setCakeIcing(finalIcings[0]);
          }
        }
      } catch (error) {
        console.error("Error loading products and variations:", error);
      } finally {
        setIsGalleryLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showWarning("Sample reference image exceeds 5MB limit.", "Image Too Large");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomSampleImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceCustomOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!customSampleImage) {
      const msg = "Please upload a sample reference image for your custom cake.";
      setCustomError(msg);
      showWarning(msg, "Sample Image Required");
      return;
    }

    setIsCustomSubmitting(true);
    setCustomError(null);

    try {
      const ordersRef = collection(db, "orders");
      const ordersSnapshot = await getDocs(ordersRef);
      let maxNum = 0;
      ordersSnapshot.forEach((docSnap) => {
        const docId = docSnap.id;
        const numPart = docId.replace("order-", "");
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      });
      const nextNum = maxNum + 1;
      const generatedOrderId = `order-${nextNum}`;

      const orderData = {
        id: generatedOrderId,
        userId: user.uid,
        isCustomOrder: true,
        customSampleImage: customSampleImage,
        items: [
          {
            productId: "custom-creation",
            name: `Custom Creation Cake`,
            price: 0.00,
            quantity: 1,
            image: "/category_custom.png"
          }
        ],
        subtotal: 0.00,
        tax: 0.00,
        deliveryFee: deliveryType === "delivery" ? 350 : 0,
        total: 0.00,
        status: "pending",
        shippingAddress: {
          id: `addr-${Date.now()}`,
          street: deliveryType === "pickup" ? `PICKUP: ${pickupBranch}` : deliveryAddress,
          city: deliveryType === "pickup" ? "Store Pickup" : deliveryCity,
          state: deliveryType === "pickup" ? "N/A" : "Delivery Province",
          postalCode: "N/A",
          country: "Sri Lanka",
          isDefault: false
        },
        paymentDetails: {
          method: "cod",
          status: "unpaid"
        },
        billingDetails: {
          firstName: fullName.split(" ")[0] || "Customer",
          lastName: fullName.split(" ").slice(1).join(" ") || "",
          country: "Sri Lanka",
          zipCode: "",
          phone: phone,
          email: email
        },
        fulfillment: {
          type: deliveryType,
          pickupDetails: deliveryType === "pickup" ? {
            branch: pickupBranch,
            date: requiredDate,
            time: requiredTime
          } : null,
          deliveryDetails: deliveryType === "delivery" ? {
            firstName: fullName.split(" ")[0] || "Customer",
            lastName: fullName.split(" ").slice(1).join(" ") || "",
            address: deliveryAddress,
            city: deliveryCity,
            phone: phone,
            recipientPhone: phone
          } : null
        },
        orderNote: `[CUSTOM DESIGN DETAILS]\nSize: ${cakeSize}\nFlavor: ${cakeFlavor}\nIcing: ${cakeIcing}\nInstructions: ${instructions}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const orderDocRef = doc(db, "orders", generatedOrderId);
      await setDoc(orderDocRef, orderData);

      setCustomSuccessId(generatedOrderId);
      showSuccess(`Custom Cake Request Order #${generatedOrderId} submitted!`, "Order Request Sent");
      
      // Reset form
      setPhone("");
      setDeliveryAddress("");
      setDeliveryCity("");
      setRequiredDate("");
      setRequiredTime("");
      setInstructions("");
      setCustomSampleImage(null);
    } catch (err) {
      console.error("Error creating custom order:", err);
      const errMsg = "Failed to submit custom cake order. Please check your information.";
      setCustomError(errMsg);
      showError(errMsg, "Submission Failed");
    } finally {
      setIsCustomSubmitting(false);
    }
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
              <span className="text-[#2A1E17]">Custom Creations</span>
            </li>
          </ol>
        </nav>

        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#DD9E59]">
            Bespoke Confections
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2A1E17]">
            Custom Creations
          </h1>
          <div className="h-1 w-16 bg-[#DD9E59] mx-auto rounded-none" />
          <p className="text-sm sm:text-base text-[#2A1E17]/80 leading-relaxed max-w-2xl mx-auto">
            Design and order your dream cake for weddings, birthdays, and milestones.
            Work directly with our master bakers to craft a centerpiece that tastes as spectacular as it looks.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Process & Gallery */}
          <div className="lg:col-span-6 space-y-12">
            
            {/* The Process */}
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#2A1E17]">The Design Journey</h2>
              <div className="h-0.5 w-10 bg-[#DD9E59]" />
              
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-none border border-[#DD9E59] bg-[#F0D8A1]/20 flex items-center justify-center font-bold text-sm text-[#DD9E59]">1</div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wide text-[#2A1E17]">Tell Us Your Vision</h3>
                    <p className="text-xs text-[#2A1E17]/75 mt-1 leading-relaxed">
                      Fill out the form on the right with your desired size, flavor, and icing. Upload a sketch, Pinterest reference, or color palette.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-none border border-[#DD9E59] bg-[#F0D8A1]/20 flex items-center justify-center font-bold text-sm text-[#DD9E59]">2</div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wide text-[#2A1E17]">Chef Consultation</h3>
                    <p className="text-xs text-[#2A1E17]/75 mt-1 leading-relaxed">
                      Our pastry chefs review your details and reference images. We will contact you via email or phone within 24 hours to finalize details.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-none border border-[#DD9E59] bg-[#F0D8A1]/20 flex items-center justify-center font-bold text-sm text-[#DD9E59]">3</div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wide text-[#2A1E17]">Quotation & Approval</h3>
                    <p className="text-xs text-[#2A1E17]/75 mt-1 leading-relaxed">
                      We send a customized design mockup and price quotation. Once approved and deposit paid, your order is officially placed.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-none border border-[#DD9E59] bg-[#F0D8A1]/20 flex items-center justify-center font-bold text-sm text-[#DD9E59]">4</div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wide text-[#2A1E17]">Creation & Delivery</h3>
                    <p className="text-xs text-[#2A1E17]/75 mt-1 leading-relaxed">
                      Our artisans bake and handcraft your cake using only fresh ingredients. Collect it at your preferred branch, or have it delivered to your venue.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspiration Gallery */}
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#2A1E17]">Inspiration Gallery</h2>
              <div className="h-0.5 w-10 bg-[#DD9E59]" />

              {isGalleryLoading ? (
                <div className="grid grid-cols-2 gap-4 animate-pulse">
                  <div className="aspect-square bg-gray-200/50 rounded-none" />
                  <div className="aspect-square bg-gray-200/50 rounded-none" />
                </div>
              ) : customProducts.length === 0 ? (
                <p className="text-xs text-[#2A1E17]/70">Explore our signature offerings on the menu page for ideas.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {customProducts.slice(0, 4).map((item) => (
                    <div key={item.id} className="relative aspect-square border border-[#A47251]/10 bg-white group overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-103"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        quality={65}
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0YwRDhBMSIvPjwvc3ZnPg=="
                      />
                      <div className="absolute inset-0 bg-[#2A1E17]/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#DD9E59]">Custom Cake</span>
                        <h4 className="font-serif text-sm font-bold text-white leading-snug line-clamp-1">{item.name}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Custom Request Form */}
          <div className="lg:col-span-6">
            
            {customSuccessId ? (
              <div className="bg-[#F0D8A1]/20 border-2 border-[#A47251]/20 p-8 sm:p-12 text-center space-y-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#DCF0C3] text-[#2A1E17] border border-[#DCF0C3]">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1E17]">Request Logged!</h3>
                  <div className="h-0.5 w-12 bg-[#DD9E59] mx-auto" />
                </div>
                <p className="text-xs sm:text-sm text-[#2A1E17]/80 leading-relaxed max-w-md mx-auto">
                  Your custom design request has been submitted successfully as Order ID: <strong className="font-mono">{customSuccessId}</strong>. 
                  Our bakers will review your reference image and request details and reach out within 24 hours with a custom quote.
                </p>
                <button
                  type="button"
                  onClick={() => setCustomSuccessId(null)}
                  className="rounded-none bg-[#A47251] text-white py-3 px-8 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer min-w-32"
                >
                  Submit Another Design
                </button>
              </div>
            ) : (
              <div className="bg-[#F0D8A1]/25 border border-[#A47251]/15 p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#2A1E17] tracking-tight">Request a Custom Quote</h2>
                  <p className="text-xs text-[#2A1E17]/70 mt-1">Provide your cake design ideas and schedule requirements below.</p>
                  <div className="h-0.5 w-12 bg-[#DD9E59] mt-3" />
                </div>

                {!user ? (
                  <div className="text-center py-10 space-y-4">
                    <p className="text-xs sm:text-sm text-[#2A1E17]/80">
                      You must be logged in to submit a custom design request.
                    </p>
                    <Link
                      href={`/login?redirect=${encodeURIComponent("/custom-creations")}`}
                      className="inline-block rounded-none bg-[#A47251] text-white px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all"
                    >
                      Login / Create Account
                    </Link>
                  </div>
                ) : (
                  <>
                    {customError && (
                      <div className="bg-red-50 border border-red-250 text-red-750 p-3.5 text-xs font-semibold">
                        {customError}
                      </div>
                    )}

                    <form onSubmit={handlePlaceCustomOrder} className="space-y-6">
                      {/* Customer Info */}
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]/60 border-b border-[#A47251]/10 pb-1">
                          1. Contact Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full bg-white border border-[#A47251]/15 rounded-none px-3.5 py-2.5 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] transition-colors"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Email Address *</label>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-white border border-[#A47251]/15 rounded-none px-3.5 py-2.5 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +94 77 123 4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white border border-[#A47251]/15 rounded-none px-3.5 py-2.5 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]/60 border-b border-[#A47251]/10 pb-1">
                          2. Cake Specifications
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Size / Weight *</label>
                            <select
                              value={cakeSize}
                              onChange={(e) => setCakeSize(e.target.value)}
                              className="w-full bg-white border border-[#A47251]/15 rounded-none px-2 py-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer"
                            >
                              {availableSizes.map((size) => (
                                <option key={size} value={size}>{size}</option>
                              ))}
                              <option value="Custom / Multi-tier">Custom / Multi-tier</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Flavor *</label>
                            <select
                              value={cakeFlavor}
                              onChange={(e) => setCakeFlavor(e.target.value)}
                              className="w-full bg-white border border-[#A47251]/15 rounded-none px-2 py-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer"
                            >
                              {availableFlavors.map((flavor) => (
                                <option key={flavor} value={flavor}>{flavor}</option>
                              ))}
                              <option value="Custom Flavor">Custom Flavor (specify below)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Icing *</label>
                            <select
                              value={cakeIcing}
                              onChange={(e) => setCakeIcing(e.target.value)}
                              className="w-full bg-white border border-[#A47251]/15 rounded-none px-2 py-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer"
                            >
                              {availableIcings.map((icing) => (
                                <option key={icing} value={icing}>{icing}</option>
                              ))}
                              <option value="Custom Cream">Custom / Other (specify below)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Design Upload */}
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]/60 border-b border-[#A47251]/10 pb-1">
                          3. Reference Image
                        </h4>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                            Upload Reference Design *
                          </label>
                          <input
                            type="file"
                            required
                            accept="image/*"
                            onChange={handleCustomImageUpload}
                            className="w-full text-xs text-[#2A1E17]/70 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-none file:border file:border-[#A47251]/15 file:text-[10px] file:font-bold file:bg-white file:text-[#2A1E17] file:hover:bg-[#DD9E59] hover:file:text-[#2A1E17] transition-colors cursor-pointer"
                          />
                          {customSampleImage && (
                            <div className="relative h-24 w-24 border border-[#A47251]/15 bg-white mt-2">
                              <img src={customSampleImage} alt="Reference preview" className="h-full w-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery & Schedule */}
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]/60 border-b border-[#A47251]/10 pb-1">
                          4. Delivery & Schedule
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-6">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="radio"
                                checked={deliveryType === "pickup"}
                                onChange={() => setDeliveryType("pickup")}
                                className="h-4 w-4 border-[#A47251]/20 text-[#DD9E59] focus:ring-[#DD9E59] accent-[#DD9E59]"
                              />
                              <span className="ml-2 text-xs font-bold uppercase tracking-wider text-[#2A1E17]">Store Pickup</span>
                            </label>
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="radio"
                                checked={deliveryType === "delivery"}
                                onChange={() => setDeliveryType("delivery")}
                                className="h-4 w-4 border-[#A47251]/20 text-[#DD9E59] focus:ring-[#DD9E59] accent-[#DD9E59]"
                              />
                              <span className="ml-2 text-xs font-bold uppercase tracking-wider text-[#2A1E17]">Home Delivery</span>
                            </label>
                          </div>

                          {deliveryType === "pickup" ? (
                            <div className="space-y-3 p-4 bg-white border border-[#A47251]/10 rounded-none">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Select Branch *</label>
                                <select
                                  value={pickupBranch}
                                  onChange={(e) => setPickupBranch(e.target.value)}
                                  className="w-full bg-white border border-[#A47251]/15 rounded-none px-3.5 py-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] cursor-pointer"
                                >
                                  <option value="Main Bakery - Colombo 07">Main Bakery - Colombo 07</option>
                                  <option value="City Outlet - Kandy">City Outlet - Kandy</option>
                                  <option value="Coastal Hub - Galle">Coastal Hub - Galle</option>
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white border border-[#A47251]/10 rounded-none">
                              <div className="space-y-1 sm:col-span-2">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Delivery Address *</label>
                                <textarea
                                  required
                                  rows={2}
                                  value={deliveryAddress}
                                  onChange={(e) => setDeliveryAddress(e.target.value)}
                                  className="w-full bg-[#FDF9F0] border border-[#A47251]/15 rounded-none px-3.5 py-2 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] resize-none"
                                />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">City *</label>
                                <input
                                  type="text"
                                  required
                                  value={deliveryCity}
                                  onChange={(e) => setDeliveryCity(e.target.value)}
                                  className="w-full bg-[#FDF9F0] border border-[#A47251]/15 rounded-none px-3.5 py-2.5 text-xs sm:text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59]"
                                />
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Required Date *</label>
                              <input
                                type="date"
                                required
                                min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                                value={requiredDate}
                                onChange={(e) => setRequiredDate(e.target.value)}
                                className="w-full bg-[#FDF9F0] border border-[#A47251]/15 rounded-none px-3.5 py-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59]"
                              />
                              <span className="text-[9px] text-[#2A1E17]/55 font-semibold block mt-0.5">Minimum 3 days notice required</span>
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Required Time *</label>
                              <input
                                type="time"
                                required
                                value={requiredTime}
                                onChange={(e) => setRequiredTime(e.target.value)}
                                className="w-full bg-[#FDF9F0] border border-[#A47251]/15 rounded-none px-3.5 py-2.5 text-xs text-[#2A1E17] focus:outline-none focus:border-[#DD9E59]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Design details instructions */}
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#2A1E17]/60 border-b border-[#A47251]/10 pb-1">
                          5. Special Instructions & Theme
                        </h4>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Customization notes *</label>
                          <textarea
                            required
                            rows={4}
                            placeholder="Describe your design vision, message on cake, theme colors, flavor details, etc."
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="w-full bg-white border border-[#A47251]/15 rounded-none p-3.5 text-xs sm:text-sm text-[#2A1E17] placeholder-[#2A1E17]/35 focus:outline-none focus:border-[#DD9E59] resize-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isCustomSubmitting}
                        className="w-full rounded-none bg-[#A47251] text-white py-3.5 px-6 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all disabled:opacity-50 cursor-pointer text-center"
                      >
                        {isCustomSubmitting ? "Submitting Request..." : "Submit Request & Get Quote"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
