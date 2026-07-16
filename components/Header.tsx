"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { getCart, removeFromCart, updateCartQuantity, CartItem, clearCart } from "@/lib/cart";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, userProfile, logout } = useAuth();
  
  // Profile dropdown menu states
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Click outside profile menu logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Interactive States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Refresh router on pathname change to pull latest Firestore data on storefront
  useEffect(() => {
    router.refresh();
  }, [pathname, router]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // Checkout Modal States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

  // Billing Fields
  const [billingFirstName, setBillingFirstName] = useState("");
  const [billingLastName, setBillingLastName] = useState("");
  const [billingCountry, setBillingCountry] = useState("Sri Lanka");
  const [billingZipCode, setBillingZipCode] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [billingEmail, setBillingEmail] = useState("");

  // Fulfillment Fields
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");

  // Pickup specific
  const [pickupBranch, setPickupBranch] = useState("Colombo Downtown Branch (No. 45, Galle Road, Colombo 03)");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [pickupNote, setPickupNote] = useState("");

  // Delivery specific
  const [deliveryDetails, setDeliveryDetails] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    phone: "",
    recipientPhone: "",
  });

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "bank_deposit">("cod");
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false);
  const [deliverySlipUrl, setDeliverySlipUrl] = useState("");
  const [bankSlipUrl, setBankSlipUrl] = useState("");

  const handleDeliverySlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setDeliverySlipUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBankSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setBankSlipUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCartItems(getCart());
      setMounted(true);
    }, 0);

    const handleCartUpdate = () => {
      setCartItems(getCart());
    };

    const handleOpenCart = () => {
      setIsCartOpen(true);
    };

    const handleOpenCheckout = () => {
      setIsCheckoutOpen(true);
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("open-cart", handleOpenCart);
    window.addEventListener("open-checkout", handleOpenCheckout);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("open-cart", handleOpenCart);
      window.removeEventListener("open-checkout", handleOpenCheckout);
      clearTimeout(timer);
    };
  }, []);

  // Listen to openCheckout query param from successful login redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("openCheckout") === "true") {
      if (user) {
        setIsCheckoutOpen(true);
        const newUrl = window.location.pathname + window.location.search.replace(/[?&]openCheckout=true/, "");
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [user]);

  const cartCount = mounted ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const totalAmount = cartItems.reduce(
    (acc, item) => {
      const itemPrice = item.calculatedPrice !== undefined
        ? item.calculatedPrice
        : (item.selectedVariant ? item.selectedVariant.price : item.product.price);
      return acc + itemPrice * item.quantity;
    },
    0
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim() !== "") {
      router.push(`/menu?search=${encodeURIComponent(searchValue.trim())}`);
      setIsSearchOpen(false);
      setSearchValue("");
      setIsOpen(false); // Close mobile menu if open
    }
  };

  const handleCartNext = () => {
    if (!user) {
      setIsCartOpen(false);
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const copyBillingToDelivery = () => {
    setDeliveryDetails({
      firstName: billingFirstName,
      lastName: billingLastName,
      address: deliveryDetails.address,
      city: deliveryDetails.city,
      phone: billingPhone,
      recipientPhone: billingPhone,
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrderSubmitting(true);

    try {
      const { collection, getDocs, doc, setDoc } = await import("firebase/firestore");
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

      const subtotal = totalAmount;
      const tax = subtotal * 0.08;
      const deliveryFee = deliveryType === "delivery" ? 350 : 0;
      const total = subtotal + tax + deliveryFee;

      const orderItems = cartItems.map((item) => {
        const itemPrice = item.calculatedPrice !== undefined
          ? item.calculatedPrice
          : (item.selectedVariant ? item.selectedVariant.price : item.product.price);
        
        let variantInfo = "";
        if (item.selectedVariant) {
          variantInfo = ` (${item.selectedVariant.name})`;
        } else {
          const detailList = [];
          if (item.selectedSize) detailList.push(item.selectedSize);
          if (item.selectedFlavor) detailList.push(item.selectedFlavor);
          if (item.selectedIcing) detailList.push(item.selectedIcing);
          if (item.selectedAddOns && item.selectedAddOns.length > 0) {
            detailList.push(item.selectedAddOns.join(", "));
          }
          if (detailList.length > 0) {
            variantInfo = ` (${detailList.join(" | ")})`;
          }
        }

        return {
          productId: item.product.id,
          name: item.product.name + variantInfo,
          price: itemPrice,
          quantity: item.quantity,
          image: item.product.image
        };
      });

      const shippingAddress = {
        id: `addr-${Date.now()}`,
        street: deliveryType === "pickup" 
          ? `PICKUP: ${pickupBranch}` 
          : deliveryDetails.address,
        city: deliveryType === "pickup" 
          ? "Store Pickup" 
          : deliveryDetails.city,
        state: deliveryType === "pickup" 
          ? "N/A" 
          : "Delivery Province",
        postalCode: billingZipCode || "N/A",
        country: billingCountry,
        isDefault: false
      };

      const orderData = {
        id: generatedOrderId,
        userId: "guest",
        items: orderItems,
        subtotal: subtotal,
        tax: tax,
        shippingFee: deliveryFee,
        total: total,
        status: "pending",
        shippingAddress: shippingAddress,
        paymentDetails: {
          method: paymentMethod,
          status: paymentMethod === "card" ? "paid" : "unpaid",
          deliverySlipUrl: paymentMethod === "cod" && deliveryType === "delivery" ? (deliverySlipUrl || null) : null,
          bankSlipUrl: paymentMethod === "bank_deposit" ? (bankSlipUrl || null) : null
        },
        billingDetails: {
          firstName: billingFirstName,
          lastName: billingLastName,
          country: billingCountry,
          zipCode: billingZipCode || "",
          phone: billingPhone,
          email: billingEmail
        },
        fulfillment: {
          type: deliveryType,
          pickupDetails: deliveryType === "pickup" ? {
            branch: pickupBranch,
            date: pickupDate,
            time: pickupTime
          } : null,
          deliveryDetails: deliveryType === "delivery" ? {
            firstName: deliveryDetails.firstName,
            lastName: deliveryDetails.lastName,
            address: deliveryDetails.address,
            city: deliveryDetails.city,
            phone: deliveryDetails.phone,
            recipientPhone: deliveryDetails.recipientPhone
          } : null
        },
        orderNote: deliveryType === "pickup" ? pickupNote : "",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const orderDocRef = doc(db, "orders", generatedOrderId);
      await setDoc(orderDocRef, orderData);

      setCreatedOrderId(generatedOrderId);
      setIsOrderSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Error creating order: ", error);
      alert("Failed to place order. Please check your network or try again.");
    } finally {
      setIsOrderSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsCheckoutOpen(false);
    setIsOrderSuccess(false);
    setAgreeToPrivacy(false);
    setDeliverySlipUrl("");
    setBankSlipUrl("");
  };

  // Hide public storefront header on admin portal pages
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#0D1B2A]/8 bg-[#F9F9F8]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Left: Mobile Hamburger & Logo */}
          <div className="flex items-center space-x-3">
            {/* Hamburger Button (Mobile Only, top left corner) */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-[#0D1B2A] hover:bg-[#0D1B2A]/5 hover:text-[#E09F3E] focus:outline-none cursor-pointer"
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>

            {/* Logo / Brand Name */}
            <Link href="/" className="group flex items-center space-x-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#0D1B2A] transition-colors group-hover:text-[#E09F3E]">
                Warm Delights
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-10">
            <Link
              href="/"
              className="font-sans text-sm font-medium tracking-wide text-[#0D1B2A]/85 transition-colors hover:text-[#E09F3E]"
            >
              Home
            </Link>
            <Link
              href="/menu"
              className="font-sans text-sm font-medium tracking-wide text-[#0D1B2A]/85 transition-colors hover:text-[#E09F3E]"
            >
              Menu
            </Link>
            <Link
              href="/about"
              className="font-sans text-sm font-medium tracking-wide text-[#0D1B2A]/85 transition-colors hover:text-[#E09F3E]"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="font-sans text-sm font-medium tracking-wide text-[#0D1B2A]/85 transition-colors hover:text-[#E09F3E]"
            >
              Contact
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4 md:space-x-6 text-[#0D1B2A]/90">
            {/* Search Container (Desktop Only) */}
            <div className="hidden md:flex items-center">
              {isSearchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-[#EAE8E4] border border-[#0D1B2A]/10 rounded-full px-3 py-1.5 w-64 animate-fade-in"
                >
                  <input
                    type="text"
                    placeholder="Search treats..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent border-none text-sm text-[#0D1B2A] placeholder-[#0D1B2A]/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-0.5 rounded-full hover:bg-[#0D1B2A]/10 text-[#0D1B2A]/60 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                /* Search Button */
                <button
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search"
                  className="p-1.5 rounded-full transition-colors hover:bg-[#0D1B2A]/5 hover:text-[#E09F3E] cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-5.5 h-5.5"
                  >
                    <path
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Profile Button (Desktop Only) */}
            <div className="hidden md:block relative" ref={profileMenuRef}>
              <button
                onClick={() => {
                  if (user) {
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                  } else {
                    router.push("/login");
                  }
                }}
                title={user ? `My Account (${userProfile?.displayName || user.email})` : "Login / Sign Up"}
                aria-label={user ? "Toggle Account Menu" : "Login"}
                className="p-1.5 rounded-full transition-colors hover:bg-[#0D1B2A]/5 hover:text-[#E09F3E] cursor-pointer flex items-center space-x-1 text-[#0D1B2A] focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5.5 h-5.5"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                {user && (
                  <span className="text-[10px] font-bold text-[#0D1B2A]/70 uppercase tracking-wider hidden lg:inline max-w-[80px] truncate">
                    {userProfile?.displayName?.split(" ")[0] || "User"}
                  </span>
                )}
              </button>

              {/* Profile Dropdown Mega Menu */}
              {user && isProfileMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-72 rounded-2xl bg-white border border-[#A47251]/10 shadow-2xl py-4 text-[#2A1E17] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Profile Summary */}
                  <div className="px-5 py-3 border-b border-[#0D1B2A]/5 flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#E09F3E] text-white flex items-center justify-center font-serif text-lg font-bold">
                      {userProfile?.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#2A1E17] truncate leading-tight">
                        {userProfile?.displayName || "Warm Delights Guest"}
                      </p>
                      <p className="text-xs text-[#2A1E17]/60 truncate leading-tight mt-0.5">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-[#E09F3E]/10 text-[#E09F3E]">
                        {userProfile?.role || "customer"}
                      </span>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="px-2 py-2.5 space-y-0.5">
                    <Link
                      href="/profile?tab=details"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-[#0D1B2A]/5 text-[#2A1E17] hover:text-[#E09F3E]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="w-4.5 h-4.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                      </svg>
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/profile?tab=orders"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-[#0D1B2A]/5 text-[#2A1E17] hover:text-[#E09F3E]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="w-4.5 h-4.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/profile?tab=addresses"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-[#0D1B2A]/5 text-[#2A1E17] hover:text-[#E09F3E]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="w-4.5 h-4.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                        />
                      </svg>
                      <span>Shipping Addresses</span>
                    </Link>

                    {userProfile?.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium bg-[#E09F3E]/5 border border-[#E09F3E]/10 transition-colors hover:bg-[#E09F3E]/10 text-[#E09F3E]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.8}
                          stroke="currentColor"
                          className="w-4.5 h-4.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                          />
                        </svg>
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div className="px-4 pt-2 pb-1 border-t border-[#0D1B2A]/5 mt-2">
                    <button
                      onClick={async () => {
                        setIsProfileMenuOpen(false);
                        if (confirm("Are you sure you want to log out?")) {
                          await logout();
                          router.push("/");
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer shadow-md shadow-red-600/10"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="w-4.5 h-4.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                        />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button (Mobile & Desktop) */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Cart"
              className="relative p-1.5 rounded-full transition-colors hover:bg-[#0D1B2A]/5 hover:text-[#E09F3E] cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5.5 h-5.5"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {/* Badge */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E09F3E] text-[9.5px] font-bold text-white ring-2 ring-[#F9F9F8]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-[#0D1B2A]/8 bg-[#F9F9F8]" id="mobile-menu">
          <div className="space-y-1 px-4 py-4 sm:px-6">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-[#0D1B2A] hover:bg-[#EAE8E4] hover:text-[#E09F3E]"
            >
              Home
            </Link>
            <Link
              href="/menu"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-[#0D1B2A]/85 hover:bg-[#EAE8E4] hover:text-[#E09F3E]"
            >
              Menu
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-[#0D1B2A]/85 hover:bg-[#EAE8E4] hover:text-[#E09F3E]"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2.5 text-base font-medium text-[#0D1B2A]/85 hover:bg-[#EAE8E4] hover:text-[#E09F3E]"
            >
              Contact
            </Link>

            {/* Mobile Search input inline */}
            <div className="mt-6 border-t border-[#0D1B2A]/5 pt-4 px-3">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#EAE8E4] border border-[#0D1B2A]/10 rounded-full px-3 py-2 w-full">
                <div className="mr-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-[#0D1B2A]/50">
                    <rect x="3" y="3" width="12" height="12" strokeLinecap="square" strokeLinejoin="miter" />
                    <line x1="13" y1="13" x2="20" y2="20" strokeLinecap="square" strokeLinejoin="miter" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search treats..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full bg-transparent border-none text-sm text-[#0D1B2A] placeholder-[#0D1B2A]/50 focus:outline-none"
                />
              </form>

            </div>

            <div className="mt-4 border-t border-[#0D1B2A]/5 pt-4 flex items-center justify-around text-[#0D1B2A]">
              {/* Profile Button Mobile */}
              <Link
                href={user ? "/profile" : "/login"}
                onClick={() => setIsOpen(false)}
                aria-label={user ? "My Profile" : "Login"}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-[#0D1B2A]/5 cursor-pointer text-[#0D1B2A]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5.5 h-5.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  {user ? "Profile" : "Login"}
                </span>
              </Link>

              {/* Cart Button Mobile */}
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  setIsOpen(false);
                }}
                aria-label="Shopping Cart"
                className="relative flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-[#0D1B2A]/5 cursor-pointer"
              >
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-5.5 h-5.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E09F3E] text-[8.5px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">Cart</span>
              </button>

              {/* Logout Button Mobile (Only when logged in) */}
              {user && (
                <button
                  onClick={async () => {
                    setIsOpen(false);
                    if (confirm("Are you sure you want to log out?")) {
                      await logout();
                      router.push("/");
                    }
                  }}
                  aria-label="Logout"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-[#0D1B2A]/5 cursor-pointer text-red-600 font-medium focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-5.5 h-5.5 text-red-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                    />
                  </svg>
                  <span className="text-sm">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}



      </header>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop overlay */}
            <div
              className="absolute inset-0 bg-[#0D1B2A]/40 backdrop-blur-xs transition-opacity"
              onClick={() => {
                setIsCartOpen(false);
                setIsOrderPlaced(false);
              }}
            />

            {/* Slide-over panel */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md bg-[#F9F9F8] shadow-2xl flex flex-col h-screen transform transition-all duration-300">
                
                {/* Header */}
                <div className="px-6 py-6 border-b border-[#0D1B2A]/5 flex items-center justify-between">
                  <h2 className="font-serif text-lg font-bold text-[#0D1B2A]">Your Shopping Bag</h2>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsOrderPlaced(false);
                    }}
                    className="p-1 text-[#0D1B2A]/60 hover:text-[#E09F3E] cursor-pointer"
                  >
                    <span className="sr-only">Close panel</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {isOrderPlaced ? (
                    /* Checkout Success view */
                    <div className="text-center py-16 space-y-4">
                      <div className="mx-auto w-12 h-12 border border-[#DCF0C3] bg-white flex items-center justify-center font-bold text-[#2A1E17] text-lg">
                        OK
                      </div>
                      <h3 className="font-serif font-bold text-xl text-[#2A1E17]">Order Placed!</h3>
                      <p className="text-sm text-[#0D1B2A]/75 max-w-xs mx-auto">
                        Your fresh delights order has been received. Thank you for baking with Warm Delights!
                      </p>
                      <button
                        onClick={() => {
                          setIsOrderPlaced(false);
                          setIsCartOpen(false);
                        }}
                        className="rounded-none bg-[#A47251] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#A47251] cursor-pointer"
                      >
                        Keep Browsing
                      </button>
                    </div>
                  ) : cartItems.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-16 space-y-4">
                      <div className="mx-auto w-10 h-10 border border-[#0D1B2A]/20 bg-white flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-[#0D1B2A]/60">
                          <rect x="5" y="8" width="14" height="12" strokeLinecap="square" strokeLinejoin="miter" />
                          <path d="M9,8 V5 H15 V8" strokeLinecap="square" strokeLinejoin="miter" />
                        </svg>
                      </div>
                      <p className="text-sm text-[#0D1B2A]/60">Your shopping bag is empty.</p>
                      <Link
                        href="/menu"
                        onClick={() => setIsCartOpen(false)}
                        className="inline-block rounded-none bg-[#0D1B2A] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#E09F3E] hover:text-[#0D1B2A]"
                      >
                        Explore Our Menu
                      </Link>
                    </div>
                  ) : (
                    /* Items List */
                    <div className="space-y-4">
                      {cartItems.map((item) => {
                        const itemKey = `${item.product.id}-${item.selectedVariant?.name || "base"}-${item.selectedSize || ""}-${item.selectedFlavor || ""}-${item.selectedIcing || ""}`;
                        const itemPrice = item.calculatedPrice !== undefined
                          ? item.calculatedPrice
                          : (item.selectedVariant ? item.selectedVariant.price : item.product.price);
                        return (
                          <div key={itemKey} className="flex items-center space-x-4 p-3 bg-white rounded-none border border-[#0D1B2A]/5">
                            {/* Image */}
                            <div className="relative h-16 w-16 overflow-hidden rounded-none bg-[#0D1B2A]/5 flex-shrink-0">
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-serif text-sm font-bold text-[#0D1B2A] truncate">{item.product.name}</h4>
                              
                              {/* Display Custom Multi-variants */}
                              <div className="flex flex-wrap gap-1 mt-0.5 mb-1">
                                {item.selectedVariant && (
                                  <span className="inline-block px-1.5 py-0.5 bg-[#EAE8E4] rounded-none text-[9px] font-bold text-[#0D1B2A]/70 uppercase tracking-wide">
                                    {item.selectedVariant.name}
                                  </span>
                                )}
                                {item.selectedSize && (
                                  <span className="inline-block px-1.5 py-0.5 bg-[#DD9E59]/15 rounded-none text-[9px] font-bold text-[#DD9E59] uppercase tracking-wide">
                                    {item.selectedSize}
                                  </span>
                                )}
                                {item.selectedFlavor && (
                                  <span className="inline-block px-1.5 py-0.5 bg-rose-50 rounded-none text-[9px] font-bold text-rose-700 uppercase tracking-wide border border-rose-100">
                                    {item.selectedFlavor}
                                  </span>
                                )}
                                {item.selectedIcing && (
                                  <span className="inline-block px-1.5 py-0.5 bg-sky-50 rounded-none text-[9px] font-bold text-sky-700 uppercase tracking-wide border border-sky-100">
                                    {item.selectedIcing}
                                  </span>
                                )}
                                {item.selectedAddOns && item.selectedAddOns.map((addon) => (
                                  <span key={addon} className="inline-block px-1.5 py-0.5 bg-[#DCF0C3] rounded-none text-[9px] font-bold text-[#2A1E17] uppercase tracking-wide border border-[#DCF0C3]">
                                    +{addon}
                                  </span>
                                ))}
                              </div>

                              <span className="text-[10px] text-[#E09F3E] font-bold uppercase tracking-wider block mb-1">
                                {item.product.category}
                              </span>
                              <span className="text-xs font-medium text-[#0D1B2A]/60 block">
                                Rs. {itemPrice.toFixed(2)} each
                              </span>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col items-end space-y-2">
                              <div className="flex items-center space-x-2 bg-[#EAE8E4]/50 border border-[#0D1B2A]/10 rounded-none px-1.5 py-0.5 scale-90">
                                <button
                                  onClick={() => updateCartQuantity(item.product.id, item.selectedVariant?.name, item.quantity - 1, item.selectedSize, item.selectedFlavor, item.selectedIcing)}
                                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#0D1B2A]/5 font-bold cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="text-xs font-semibold text-[#0D1B2A] w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(item.product.id, item.selectedVariant?.name, item.quantity + 1, item.selectedSize, item.selectedFlavor, item.selectedIcing)}
                                  className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#0D1B2A]/5 font-bold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                              
                              <button
                                onClick={() => removeFromCart(item.product.id, item.selectedVariant?.name, item.selectedSize, item.selectedFlavor, item.selectedIcing)}
                                className="text-[10px] text-red-650 hover:underline font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && !isOrderPlaced && (
                  <div className="px-6 py-6 border-t border-[#0D1B2A]/5 bg-white space-y-4">
                    <div className="flex items-center justify-between text-base font-serif font-bold text-[#0D1B2A]">
                      <span>Subtotal</span>
                      <span>Rs. {totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-[#0D1B2A]/60 font-sans leading-relaxed">
                      Shipping, taxes, and promotional discounts are calculated at final checkout page.
                    </p>
                    <button
                      onClick={handleCartNext}
                      className="w-full rounded-none bg-[#0D1B2A] text-white py-3.5 text-xs font-bold uppercase tracking-wider text-center hover:bg-[#E09F3E] hover:text-[#0D1B2A] transition-all cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Buy Now / Cart Checkout Popup Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#A47251]/65 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
          <div className="relative w-full max-w-4xl bg-[#FDF9F0] border border-[#A47251]/10 rounded-none shadow-2xl flex flex-col my-4 sm:my-8">
            
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-[#A47251]/5 flex items-center justify-between bg-[#F0D8A1]/50">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2A1E17]">Checkout details</h3>
                <p className="text-[10px] text-[#2A1E17]/60 uppercase tracking-widest font-semibold mt-0.5">Place your artisanal treats order</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="h-8 w-8 rounded-none hover:bg-[#A47251]/5 text-[#2A1E17]/70 hover:text-[#2A1E17] flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-6 sm:p-8 md:p-10">
              {isOrderSuccess ? (
                /* Success View */
                <div className="py-16 text-center space-y-6 max-w-md mx-auto animate-fade-in">
                  <div className="mx-auto h-20 w-20 bg-[#DCF0C3] border border-[#DCF0C3] flex items-center justify-center">
                    <span className="font-sans px-2 py-1 border border-[#DCF0C3] bg-white text-xs uppercase tracking-wider text-[#2A1E17] font-bold">Success</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-2xl font-bold text-[#2A1E17]">Order Placed!</h4>
                    <p className="text-sm text-[#2A1E17]/85">
                      Your bakery order has been successfully sent to the kitchen.
                    </p>
                    <div className="bg-[#F0D8A1]/60 border border-[#A47251]/5 rounded-2xl p-4 text-xs font-mono text-[#2A1E17] tracking-wider mt-4">
                      Order ID: {createdOrderId}
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="w-full rounded-none bg-[#A47251] text-white py-3 px-8 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] transition-all cursor-pointer"
                  >
                    Back to Shop
                  </button>
                </div>
              ) : (
                /* Form View */
                <form onSubmit={handlePlaceOrder} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* Left Column: Billing Details */}
                    <div className="space-y-4">
                      <div className="border-b border-[#A47251]/10 pb-2 mb-2">
                        <h4 className="font-serif text-base font-bold text-[#2A1E17]">Billing Details</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/70">First Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="John"
                            value={billingFirstName}
                            onChange={(e) => setBillingFirstName(e.target.value)}
                            className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/70">Last Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Doe"
                            value={billingLastName}
                            onChange={(e) => setBillingLastName(e.target.value)}
                            className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/70">Country *</label>
                        <select
                          value={billingCountry}
                          onChange={(e) => setBillingCountry(e.target.value)}
                          className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                        >
                          <option value="Sri Lanka">Sri Lanka</option>
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="Singapore">Singapore</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/70">Zip / Postal Code (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 10115"
                          value={billingZipCode}
                          onChange={(e) => setBillingZipCode(e.target.value)}
                          className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/70">Phone *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 077 123 4567"
                          value={billingPhone}
                          onChange={(e) => setBillingPhone(e.target.value)}
                          className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/70">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={billingEmail}
                          onChange={(e) => setBillingEmail(e.target.value)}
                          className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                        />
                      </div>
                    </div>

                    {/* Right Column: Fulfillment Details */}
                    <div className="space-y-6">
                      <div className="border-b border-[#A47251]/10 pb-2 flex items-center justify-between">
                        <h4 className="font-serif text-base font-bold text-[#2A1E17]">Fulfillment Details</h4>
                      </div>

                      {/* Delivery Type Selector Buttons */}
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setDeliveryType("pickup")}
                          className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 border cursor-pointer flex items-center justify-center space-x-2 ${
                            deliveryType === "pickup"
                              ? "bg-[#A47251] text-white border-[#A47251] shadow-sm"
                              : "bg-white text-[#2A1E17] border-[#A47251]/10 hover:border-[#DD9E59]"
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                            <rect x="3" y="3" width="18" height="18" strokeLinecap="square" strokeLinejoin="miter" />
                            <line x1="3" y1="9" x2="21" y2="9" strokeLinecap="square" strokeLinejoin="miter" />
                            <line x1="9" y1="9" x2="9" y2="21" strokeLinecap="square" strokeLinejoin="miter" />
                            <line x1="15" y1="9" x2="15" y2="21" strokeLinecap="square" strokeLinejoin="miter" />
                          </svg>
                          <span>Store Pickup</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryType("delivery")}
                          className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 border cursor-pointer flex items-center justify-center space-x-2 ${
                            deliveryType === "delivery"
                              ? "bg-[#A47251] text-white border-[#A47251] shadow-sm"
                              : "bg-white text-[#2A1E17] border-[#A47251]/10 hover:border-[#DD9E59]"
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                            <rect x="2" y="7" width="12" height="11" strokeLinecap="square" strokeLinejoin="miter" />
                            <polygon points="14,9 20,9 22,12 22,18 14,18" strokeLinecap="square" strokeLinejoin="miter" />
                            <rect x="4" y="16" width="2" height="2" />
                            <rect x="16" y="16" width="2" height="2" />
                          </svg>
                          <span>Home Delivery</span>
                        </button>
                      </div>

                      {/* Pickup Fields */}
                      {deliveryType === "pickup" && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/70">Pickup Location Branch *</label>
                            <select
                              value={pickupBranch}
                              onChange={(e) => setPickupBranch(e.target.value)}
                              className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                            >
                              <option value="Colombo Downtown Branch (No. 45, Galle Road, Colombo 03)">Colombo Downtown Branch (No. 45, Galle Road, Colombo 03)</option>
                              <option value="Kandy Lake Round Bakery (No. 12, Temple Road, Kandy)">Kandy Lake Round Bakery (No. 12, Temple Road, Kandy)</option>
                              <option value="Galle Fort Cafe (No. 8, Pedlar Street, Galle Fort, Galle)">Galle Fort Cafe (No. 8, Pedlar Street, Galle Fort, Galle)</option>
                              <option value="Negombo Beachside Hub (No. 202, Lewis Place, Negombo)">Negombo Beachside Hub (No. 202, Lewis Place, Negombo)</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/70">Pickup Date *</label>
                              <input
                                type="date"
                                required
                                min={new Date().toISOString().split("T")[0]}
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/70">Pickup Time *</label>
                              <input
                                type="time"
                                required
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/70">Order Note (Optional)</label>
                            <textarea
                              rows={3}
                              placeholder="e.g. Please pack carefully, write 'Happy Birthday John' on it..."
                              value={pickupNote}
                              onChange={(e) => setPickupNote(e.target.value)}
                              className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59] resize-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Delivery Fields */}
                      {deliveryType === "delivery" && (
                        <div className="space-y-4 animate-fade-in">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/70">Recipient Details *</span>
                            <button
                              type="button"
                              onClick={copyBillingToDelivery}
                              className="text-[10px] font-bold uppercase tracking-wide text-[#DD9E59] hover:underline cursor-pointer"
                            >
                              Same as Billing Details
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/50">First Name *</label>
                              <input
                                type="text"
                                required
                                placeholder="First Name"
                                value={deliveryDetails.firstName}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, firstName: e.target.value })}
                                className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/50">Last Name *</label>
                              <input
                                type="text"
                                required
                                placeholder="Last Name"
                                value={deliveryDetails.lastName}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, lastName: e.target.value })}
                                className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/50">Delivery Address *</label>
                            <input
                              type="text"
                              required
                              placeholder="No. / Street Address"
                              value={deliveryDetails.address}
                              onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                              className="w-full bg-white border border-[#A47251]/10 rounded-none px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/50">City *</label>
                            <input
                              type="text"
                              required
                              placeholder="City"
                              value={deliveryDetails.city}
                              onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                              className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/50">Phone *</label>
                              <input
                                type="tel"
                                required
                                placeholder="Your Phone"
                                value={deliveryDetails.phone}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                                className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/50">Recipient Phone *</label>
                              <input
                                type="tel"
                                required
                                placeholder="Recipient's Phone"
                                value={deliveryDetails.recipientPhone}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, recipientPhone: e.target.value })}
                                className="w-full bg-white border border-[#A47251]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#DD9E59] focus:ring-1 focus:ring-[#DD9E59]"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Order Summary & Payment */}
                  <div className="border-t border-[#A47251]/10 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* Order Details Summary */}
                    <div className="space-y-3">
                      <h4 className="font-serif text-base font-bold text-[#2A1E17]">Order Summary</h4>
                      <div className="bg-[#F0D8A1]/50 rounded-none p-5 border border-[#A47251]/5 space-y-3">
                        <div className="max-h-48 overflow-y-auto pr-2 space-y-3">
                          {cartItems.map((item) => {
                            const itemPrice = item.calculatedPrice !== undefined
                              ? item.calculatedPrice
                              : (item.selectedVariant ? item.selectedVariant.price : item.product.price);
                            const itemKey = `${item.product.id}-${item.selectedVariant?.name || "base"}-${item.selectedSize || ""}-${item.selectedFlavor || ""}-${item.selectedIcing || ""}`;
                            return (
                              <div key={itemKey} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-3">
                                  <div className="relative h-10 w-10 overflow-hidden rounded-none bg-white border border-[#A47251]/5 flex-shrink-0">
                                    <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="40px" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-[#2A1E17] leading-tight text-xs">{item.product.name}</p>
                                    
                                    {/* Display custom variations */}
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {item.selectedVariant && (
                                        <span className="inline-block px-1 py-0.5 bg-[#A47251]/5 rounded-none text-[8px] font-bold text-[#2A1E17]/70 uppercase tracking-wide">
                                          {item.selectedVariant.name}
                                        </span>
                                      )}
                                      {item.selectedSize && (
                                        <span className="inline-block px-1 py-0.5 bg-[#DD9E59]/10 rounded-none text-[8px] font-bold text-[#DD9E59] uppercase tracking-wide">
                                          {item.selectedSize}
                                        </span>
                                      )}
                                      {item.selectedFlavor && (
                                        <span className="inline-block px-1 py-0.5 bg-rose-50 rounded-none text-[8px] font-bold text-rose-700 uppercase tracking-wide">
                                          {item.selectedFlavor}
                                        </span>
                                      )}
                                      {item.selectedIcing && (
                                        <span className="inline-block px-1 py-0.5 bg-sky-50 rounded-none text-[8px] font-bold text-sky-700 uppercase tracking-wide">
                                          {item.selectedIcing}
                                        </span>
                                      )}
                                      {item.selectedAddOns && item.selectedAddOns.map((addon) => (
                                        <span key={addon} className="inline-block px-1 py-0.5 bg-[#DCF0C3] rounded-none text-[8px] font-bold text-[#2A1E17] uppercase tracking-wide">
                                          +{addon}
                                        </span>
                                      ))}
                                    </div>
                                    
                                    <p className="text-[10px] text-[#2A1E17]/60 mt-1">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <span className="font-bold text-[#2A1E17] text-xs">Rs. {(itemPrice * item.quantity).toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="border-t border-[#A47251]/5 pt-3 space-y-1.5 text-xs text-[#2A1E17]/80 font-sans">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>Rs. {totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax (8%)</span>
                            <span>Rs. {(totalAmount * 0.08).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fulfillment ({deliveryType === "pickup" ? "Pickup" : "Delivery"})</span>
                            <span>{deliveryType === "pickup" ? "Free" : `Rs. ${(350).toFixed(2)}`}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-[#2A1E17] pt-2 border-t border-dashed border-[#A47251]/5">
                            <span>Total</span>
                            <span>Rs. {(totalAmount + (totalAmount * 0.08) + (deliveryType === "delivery" ? 350 : 0)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Selector */}
                    <div className="space-y-3">
                      <h4 className="font-serif text-base font-bold text-[#2A1E17]">Payment Method</h4>
                      <div className="space-y-3">
                        <label className={`flex items-center p-3.5 rounded-none border cursor-pointer transition-all duration-200 bg-white ${
                          paymentMethod === "cod"
                            ? "border-[#A47251] ring-1 ring-[#2A1E17]"
                            : "border-[#A47251]/10 hover:border-[#DD9E59]"
                        }`}>
                          <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="sr-only" />
                          <div className="border border-[#A47251]/10 p-1.5 bg-white flex items-center justify-center mr-3 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-[#2A1E17]">
                              <rect x="3" y="6" width="18" height="12" strokeLinecap="square" strokeLinejoin="miter" />
                              <rect x="9" y="10" width="6" height="4" strokeLinecap="square" strokeLinejoin="miter" />
                            </svg>
                          </div>
                          <div>
                            <span className="block font-bold text-xs text-[#2A1E17]">Cash on Delivery</span>
                            <span className="block text-[10px] text-[#2A1E17]/60">Pay cash when you pick up or receive delivery</span>
                          </div>
                        </label>

                        <label className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition-all duration-200 bg-white ${
                          paymentMethod === "card"
                            ? "border-[#A47251] ring-1 ring-[#2A1E17]"
                            : "border-[#A47251]/10 hover:border-[#DD9E59]"
                        }`}>
                          <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="sr-only" />
                          <div className="border border-[#A47251]/10 p-1.5 bg-white flex items-center justify-center mr-3 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-[#2A1E17]">
                              <rect x="3" y="5" width="18" height="14" strokeLinecap="square" strokeLinejoin="miter" />
                              <line x1="3" y1="9" x2="21" y2="9" strokeLinecap="square" strokeLinejoin="miter" />
                              <rect x="6" y="13" width="4" height="2" strokeLinecap="square" strokeLinejoin="miter" />
                            </svg>
                          </div>
                          <div>
                            <span className="block font-bold text-xs text-[#2A1E17]">Card Payment</span>
                            <span className="block text-[10px] text-[#2A1E17]/60">Pay online with Visa / MasterCard / Amex</span>
                          </div>
                        </label>

                        <label className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition-all duration-200 bg-white ${
                          paymentMethod === "bank_deposit"
                            ? "border-[#A47251] ring-1 ring-[#2A1E17]"
                            : "border-[#A47251]/10 hover:border-[#DD9E59]"
                        }`}>
                          <input type="radio" name="payment" value="bank_deposit" checked={paymentMethod === "bank_deposit"} onChange={() => setPaymentMethod("bank_deposit")} className="sr-only" />
                          <div className="border border-[#A47251]/10 p-1.5 bg-white flex items-center justify-center mr-3 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-[#2A1E17]">
                              <polygon points="12,3 3,9 21,9" strokeLinecap="square" strokeLinejoin="miter" />
                              <rect x="5" y="10" width="2" height="8" strokeLinecap="square" strokeLinejoin="miter" />
                              <rect x="11" y="10" width="2" height="8" strokeLinecap="square" strokeLinejoin="miter" />
                              <rect x="17" y="10" width="2" height="8" strokeLinecap="square" strokeLinejoin="miter" />
                              <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="square" strokeLinejoin="miter" />
                            </svg>
                          </div>
                          <div>
                            <span className="block font-bold text-xs text-[#2A1E17]">Bank Deposit</span>
                            <span className="block text-[10px] text-[#2A1E17]/60">Direct bank transfer to our corporate account</span>
                          </div>
                        </label>
                      </div>

                      {/* Payment Method Specific Instructions */}
                      {paymentMethod === "cod" && (() => {
                        const taxAmount = totalAmount * 0.08;
                        const deliveryFee = deliveryType === "delivery" ? 350 : 0;
                        const grandTotal = totalAmount + taxAmount + deliveryFee;
                        const remainingCodAmount = totalAmount + taxAmount; // Total minus delivery fee

                        return (
                          <div className="bg-[#F0D8A1]/50 border border-[#A47251]/10 p-4 rounded-none text-xs text-[#2A1E17]/90 space-y-4 animate-fade-in">
                            <div className="space-y-2">
                              <span className="font-bold uppercase tracking-wider block text-[10px]">COD Instructions</span>
                              {deliveryType === "delivery" ? (
                                <p className="leading-relaxed">
                                  For Home Delivery, please deposit the delivery fee of <strong>Rs. 350.00</strong> beforehand to our corporate bank account (Warm Delights Bank PLC, Acc: 0987-6543-2101) and upload the payment slip below. The remaining product amount of <strong>Rs. {remainingCodAmount.toFixed(2)}</strong> is payable in cash to our dispatch rider upon delivery.
                                </p>
                              ) : (
                                <p className="leading-relaxed">
                                  For Store Pickup, there is no delivery fee! You do not need to pay in advance or upload a slip. The total amount of <strong>Rs. {grandTotal.toFixed(2)}</strong> is payable at the counter when you pick up your order.
                                </p>
                              )}
                            </div>

                            {deliveryType === "delivery" && (
                              <div className="space-y-2 pt-2 border-t border-[#A47251]/5">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                                  Upload Delivery Fee Slip *
                                </label>
                                <input
                                  type="file"
                                  required
                                  accept="image/*"
                                  onChange={handleDeliverySlipUpload}
                                  className="w-full text-[11px] text-[#2A1E17]/70 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-none file:border file:border-[#A47251]/10 file:text-[10px] file:font-bold file:bg-white file:text-[#2A1E17] file:hover:bg-[#DD9E59] hover:file:text-[#2A1E17] transition-colors cursor-pointer"
                                />
                                {deliverySlipUrl && (
                                  <div className="relative h-16 w-16 rounded-none overflow-hidden border border-[#A47251]/10 bg-white mt-2">
                                    <img src={deliverySlipUrl} alt="Delivery fee slip preview" className="h-full w-full object-cover" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {paymentMethod === "card" && (
                        <div className="bg-[#F0D8A1]/50 border border-[#A47251]/10 p-4 rounded-none text-xs text-[#2A1E17]/90 space-y-2 animate-fade-in">
                          <span className="font-bold uppercase tracking-wider block text-[10px]">Card Payment Instructions</span>
                          <p className="leading-relaxed">
                            You will be redirected to our secure payment gateway to complete your card transaction. Please ensure your card has online payments enabled. Your order status will automatically update to <strong>Paid</strong> upon successful authorization.
                          </p>
                        </div>
                      )}

                      {paymentMethod === "bank_deposit" && (
                        <div className="bg-[#F0D8A1]/50 border border-[#A47251]/10 p-4 rounded-none text-xs text-[#2A1E17]/90 space-y-3.5 animate-fade-in">
                          <span className="font-bold uppercase tracking-wider block text-[10px]">Bank Deposit Instructions</span>
                          <div className="space-y-1 bg-white p-3 border border-[#A47251]/5 font-mono text-[10.5px]">
                            <p><strong>Bank:</strong> Warm Delights Bank PLC</p>
                            <p><strong>Account Name:</strong> Warm Delights (Pvt) Ltd</p>
                            <p><strong>Account Number:</strong> 0987-6543-2101</p>
                            <p><strong>Branch:</strong> Colombo Corporate Branch</p>
                          </div>
                          <p className="leading-relaxed text-[11px]">
                            Please transfer the total amount of <strong>Rs. {(totalAmount + (totalAmount * 0.08) + (deliveryType === "delivery" ? 350 : 0)).toFixed(2)}</strong> to the account above, and upload your deposit slip below. Baking will commence once the deposit slip is uploaded and verified.
                          </p>
                          <div className="space-y-2 pt-2 border-t border-[#A47251]/5">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
                              Upload Bank Deposit Slip *
                            </label>
                            <input
                              type="file"
                              required
                              accept="image/*"
                              onChange={handleBankSlipUpload}
                              className="w-full text-[11px] text-[#2A1E17]/70 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-none file:border file:border-[#A47251]/10 file:text-[10px] file:font-bold file:bg-white file:text-[#2A1E17] file:hover:bg-[#DD9E59] hover:file:text-[#2A1E17] transition-colors cursor-pointer"
                            />
                            {bankSlipUrl && (
                              <div className="relative h-16 w-16 rounded-none overflow-hidden border border-[#A47251]/10 bg-white mt-2">
                                <img src={bankSlipUrl} alt="Bank deposit slip preview" className="h-full w-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Privacy Policy Checkbox */}
                  <div className="flex items-start space-x-2.5 pt-2 pb-2">
                    <input
                      type="checkbox"
                      id="privacyAgreement"
                      required
                      checked={agreeToPrivacy}
                      onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                      className="h-4 w-4 rounded-none border-[#A47251]/20 text-[#DD9E59] focus:ring-[#DD9E59] cursor-pointer accent-[#DD9E59] mt-0.5 shrink-0"
                    />
                    <label htmlFor="privacyAgreement" className="text-xs text-[#2A1E17]/85 cursor-pointer select-none leading-relaxed">
                      I agree to the <Link href="/privacy-policy" className="text-[#DD9E59] font-bold hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</Link> and data processing terms. *
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-[#A47251]/5 flex items-center justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-3 rounded-none text-xs font-bold uppercase tracking-wider text-[#2A1E17] hover:bg-[#F0D8A1]/50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isOrderSubmitting}
                      className="rounded-none bg-[#A47251] text-white py-3 px-8 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] disabled:opacity-50 transition-all cursor-pointer min-w-40 flex items-center justify-center"
                    >
                      {isOrderSubmitting ? (
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        "Place Fresh Order"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
