"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Address, Order } from "@/types/database";
import Link from "next/link";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading, logout } = useAuth();

  // Selected tab
  const [activeTab, setActiveTab] = useState<"details" | "addresses" | "orders">("details");

  // Account Details form states
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");

  // Address states
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Orders states
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Sync tab with query parameters
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "details" || tabParam === "addresses" || tabParam === "orders") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Sync profile details form values when profile loads
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "");
      setPhoneNumber(userProfile.phoneNumber || "");
    }
  }, [userProfile]);

  // Query orders when user is authenticated
  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      setIsLoadingOrders(true);
      try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const list: Order[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            ...data,
          } as Order);
        });

        // Sort orders descending in memory by createdAt
        list.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt as any).getTime();
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt as any).getTime();
          return dateB - dateA;
        });

        setOrders(list);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoadingOrders(false);
      }
    }

    fetchOrders();
  }, [user]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=/profile`);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-[#FDF9F0]">
        <div className="w-12 h-12 border-4 border-[#E09F3E]/20 border-t-[#E09F3E] rounded-full animate-spin"></div>
        <p className="mt-4 font-serif text-[#2A1E17] font-semibold">Loading profile details...</p>
      </div>
    );
  }

  // Update account info
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccessMsg("");
    setProfileErrorMsg("");

    if (!displayName.trim()) {
      setProfileErrorMsg("Display name is required.");
      setIsUpdatingProfile(false);
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        updatedAt: new Date(),
      });
      setProfileSuccessMsg("Profile details updated successfully!");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setProfileErrorMsg("Failed to update profile details. Please try again.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Add/Edit shipping address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingAddress(true);
    setAddressError("");

    if (!street.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setAddressError("Please fill out all address fields.");
      setIsUpdatingAddress(false);
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const currentAddresses = userProfile?.shippingAddresses || [];
      let updatedAddresses: Address[] = [];

      if (editingAddressId) {
        // Edit mode
        updatedAddresses = currentAddresses.map((addr) => {
          if (addr.id === editingAddressId) {
            return {
              id: addr.id,
              street: street.trim(),
              city: city.trim(),
              state: state.trim(),
              postalCode: postalCode.trim(),
              country: country.trim(),
              isDefault: isDefaultAddress,
            };
          }
          return isDefaultAddress ? { ...addr, isDefault: false } : addr;
        });
      } else {
        // Add mode
        const newAddress: Address = {
          id: Date.now().toString(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          isDefault: isDefaultAddress || currentAddresses.length === 0, // auto default if first address
        };

        if (newAddress.isDefault) {
          updatedAddresses = currentAddresses.map((addr) => ({ ...addr, isDefault: false }));
          updatedAddresses.push(newAddress);
        } else {
          updatedAddresses = [...currentAddresses, newAddress];
        }
      }

      await updateDoc(userRef, {
        shippingAddresses: updatedAddresses,
        updatedAt: new Date(),
      });

      // Clear address form and close
      resetAddressForm();
    } catch (err: any) {
      console.error("Error saving address:", err);
      setAddressError("Failed to save address. Please try again.");
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  // Set Address as Default
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const currentAddresses = userProfile?.shippingAddresses || [];
      const updatedAddresses = currentAddresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));

      await updateDoc(userRef, {
        shippingAddresses: updatedAddresses,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Error setting default address:", err);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this shipping address?")) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const currentAddresses = userProfile?.shippingAddresses || [];
      let updatedAddresses = currentAddresses.filter((addr) => addr.id !== addressId);

      // If we deleted the default address, and we have addresses left, make the first one default
      const wasDefault = currentAddresses.find((addr) => addr.id === addressId)?.isDefault;
      if (wasDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      await updateDoc(userRef, {
        shippingAddresses: updatedAddresses,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
    setIsDefaultAddress(addr.isDefault);
    setIsAddressFormOpen(true);
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setStreet("");
    setCity("");
    setState("");
    setPostalCode("");
    setCountry("Sri Lanka");
    setIsDefaultAddress(false);
    setIsAddressFormOpen(false);
    setAddressError("");
  };

  // Date Formatting Helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    let dateObj: Date;
    if (timestamp.toDate) {
      dateObj = timestamp.toDate();
    } else if (timestamp.seconds) {
      dateObj = new Date(timestamp.seconds * 1000);
    } else {
      dateObj = new Date(timestamp);
    }
    return dateObj.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Status Color Mapper
  const getStatusStyles = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "baked":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "out-for-delivery":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex-1 w-full bg-[#FDF9F0] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <div className="mb-8 space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E09F3E]">Warm Delights Member</span>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#2A1E17]">My Account</h1>
          <p className="text-sm text-[#2A1E17]/60">Manage your profile, shipping details, and order receipts.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Meta Card */}
            <div className="bg-white border border-[#A47251]/10 rounded-2xl p-6 shadow-md flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-[#E09F3E] text-white flex items-center justify-center font-serif text-3xl font-bold shadow-md shadow-[#E09F3E]/20">
                {userProfile?.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <h2 className="mt-4 font-serif text-xl font-bold text-[#2A1E17] truncate max-w-full">
                {userProfile?.displayName || "Warm Delights Member"}
              </h2>
              <p className="text-xs text-[#2A1E17]/60 truncate max-w-full font-semibold">{user.email}</p>
              <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E09F3E]/10 text-[#E09F3E] uppercase tracking-wider">
                {userProfile?.role || "customer"}
              </div>
              <p className="mt-4 text-[10px] text-[#2A1E17]/40 uppercase tracking-widest font-bold">
                Member Since: {userProfile?.createdAt ? formatDate(userProfile.createdAt) : "Recently"}
              </p>
            </div>

            {/* Sidebar Navigation Tabs */}
            <nav className="bg-white border border-[#A47251]/10 rounded-2xl p-2.5 shadow-md flex flex-row lg:flex-col space-x-1 lg:space-x-0 lg:space-y-1 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab("details");
                  router.push("/profile?tab=details");
                }}
                className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors focus:outline-none whitespace-nowrap ${
                  activeTab === "details"
                    ? "bg-[#E09F3E] text-white"
                    : "text-[#2A1E17] hover:bg-[#0D1B2A]/5 hover:text-[#E09F3E]"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span>Account Details</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("addresses");
                  router.push("/profile?tab=addresses");
                }}
                className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors focus:outline-none whitespace-nowrap ${
                  activeTab === "addresses"
                    ? "bg-[#E09F3E] text-white"
                    : "text-[#2A1E17] hover:bg-[#0D1B2A]/5 hover:text-[#E09F3E]"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span>Addresses</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("orders");
                  router.push("/profile?tab=orders");
                }}
                className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors focus:outline-none whitespace-nowrap ${
                  activeTab === "orders"
                    ? "bg-[#E09F3E] text-white"
                    : "text-[#2A1E17] hover:bg-[#0D1B2A]/5 hover:text-[#E09F3E]"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span>Order History</span>
              </button>
            </nav>

            {/* Logout button */}
            <button
              onClick={async () => {
                if (confirm("Are you sure you want to log out?")) {
                  await logout();
                  router.push("/");
                }
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md shadow-red-600/10 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
              <span>Sign Out Account</span>
            </button>
          </div>

          {/* Right Column: Tab Panel Content */}
          <div className="lg:col-span-3">
            {/* Tab: Account Details */}
            {activeTab === "details" && (
              <div className="bg-white border border-[#A47251]/10 rounded-2xl p-6 sm:p-8 shadow-md">
                <h3 className="font-serif text-2xl font-bold text-[#2A1E17] mb-6">Account Details</h3>
                
                {profileSuccessMsg && (
                  <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-800 border border-green-200 text-sm font-medium">
                    {profileSuccessMsg}
                  </div>
                )}
                {profileErrorMsg && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 text-sm font-medium">
                    {profileErrorMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="email-disabled" className="text-xs font-bold text-[#2A1E17]/60 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        id="email-disabled"
                        value={user.email || ""}
                        disabled
                        className="w-full bg-[#EAE8E4]/40 border border-[#0D1B2A]/10 rounded-xl px-4 py-3 text-sm text-[#2A1E17]/70 cursor-not-allowed focus:outline-none"
                      />
                      <span className="text-[10px] text-[#2A1E17]/40">Your login email cannot be modified.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="displayName" className="text-xs font-bold text-[#2A1E17]/60 uppercase tracking-wider">Display Name</label>
                      <input
                        type="text"
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#FDF9F0]/20 border border-[#0D1B2A]/10 rounded-xl px-4 py-3 text-sm text-[#2A1E17] focus:outline-none focus:border-[#E09F3E] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="phoneNumber" className="text-xs font-bold text-[#2A1E17]/60 uppercase tracking-wider">Phone Number</label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+94 77 123 4567"
                        className="w-full bg-[#FDF9F0]/20 border border-[#0D1B2A]/10 rounded-xl px-4 py-3 text-sm text-[#2A1E17] focus:outline-none focus:border-[#E09F3E] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2A1E17]/60 uppercase tracking-wider">Account Role</label>
                      <input
                        type="text"
                        value={userProfile?.role || "Customer"}
                        disabled
                        className="w-full bg-[#EAE8E4]/40 border border-[#0D1B2A]/10 rounded-xl px-4 py-3 text-sm text-[#2A1E17]/70 capitalize cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#0D1B2A]/5 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#0D1B2A] hover:bg-[#E09F3E] transition-colors cursor-pointer shadow-md shadow-[#0D1B2A]/10 disabled:opacity-50"
                    >
                      {isUpdatingProfile ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <span>Save Account Settings</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab: Addresses */}
            {activeTab === "addresses" && (
              <div className="bg-white border border-[#A47251]/10 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#0D1B2A]/5 pb-5">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#2A1E17]">Shipping Addresses</h3>
                    <p className="text-xs text-[#2A1E17]/60">Manage addresses where your cakes and pastries will be delivered.</p>
                  </div>
                  {!isAddressFormOpen && (
                    <button
                      onClick={() => {
                        resetAddressForm();
                        setIsAddressFormOpen(true);
                      }}
                      className="inline-flex items-center justify-center space-x-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#E09F3E] hover:bg-[#0D1B2A] transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span>Add New Address</span>
                    </button>
                  )}
                </div>

                {/* Add/Edit Address Form */}
                {isAddressFormOpen && (
                  <div className="p-5 border border-[#E09F3E]/20 rounded-2xl bg-[#FDF9F0]/30 space-y-4">
                    <h4 className="font-serif text-lg font-bold text-[#2A1E17]">
                      {editingAddressId ? "Modify Shipping Address" : "Register New Address"}
                    </h4>
                    
                    {addressError && (
                      <div className="p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-semibold">
                        {addressError}
                      </div>
                    )}

                    <form onSubmit={handleSaveAddress} className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="street" className="text-xs font-bold text-[#2A1E17]/60 uppercase tracking-wider">Street Address</label>
                        <input
                          type="text"
                          id="street"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="No 123, Temple Road"
                          className="w-full bg-white border border-[#0D1B2A]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#E09F3E]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="city" className="text-xs font-bold text-[#2A1E17]/60 uppercase tracking-wider">City</label>
                          <input
                            type="text"
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Colombo"
                            className="w-full bg-white border border-[#0D1B2A]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#E09F3E]"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="state" className="text-xs font-bold text-[#2A1E17]/60 uppercase tracking-wider">State / Province</label>
                          <input
                            type="text"
                            id="state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="Western"
                            className="w-full bg-white border border-[#0D1B2A]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#E09F3E]"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="postalCode" className="text-xs font-bold text-[#2A1E17]/60 uppercase tracking-wider">Postal / ZIP Code</label>
                          <input
                            type="text"
                            id="postalCode"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder="00300"
                            className="w-full bg-white border border-[#0D1B2A]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#E09F3E]"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="country" className="text-xs font-bold text-[#2A1E17]/60 uppercase tracking-wider">Country</label>
                          <input
                            type="text"
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full bg-white border border-[#0D1B2A]/10 rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:border-[#E09F3E]"
                            required
                          />
                        </div>

                        <div className="flex items-center h-full pt-6">
                          <label className="relative flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isDefaultAddress}
                              onChange={(e) => setIsDefaultAddress(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E09F3E]"></div>
                            <span className="ml-3 text-xs font-bold text-[#2A1E17]">Set as default shipping address</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={resetAddressForm}
                          className="px-4 py-2 rounded-xl text-xs font-bold border border-[#0D1B2A]/10 text-[#2A1E17]/70 hover:bg-[#0D1B2A]/5 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUpdatingAddress}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0D1B2A] hover:bg-[#E09F3E] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isUpdatingAddress ? "Saving..." : "Save Address"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Addresses List */}
                {(!userProfile?.shippingAddresses || userProfile.shippingAddresses.length === 0) ? (
                  <div className="text-center py-10 border-2 border-dashed border-[#A47251]/10 rounded-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-12 h-12 text-[#2A1E17]/30 mx-auto">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    <h4 className="mt-3 font-serif text-base font-bold text-[#2A1E17]">No Shipping Addresses Registered</h4>
                    <p className="text-xs text-[#2A1E17]/50 mt-1">Please register a shipping address to speed up your checkout process.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProfile.shippingAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          addr.isDefault
                            ? "bg-white border-[#E09F3E] shadow-[#E09F3E]/5 shadow-lg"
                            : "bg-white border-[#0D1B2A]/10 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block text-[10px] font-bold text-[#2A1E17]/40 uppercase tracking-widest">
                            Destination Address
                          </span>
                          {addr.isDefault && (
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#E09F3E]/10 text-[#E09F3E]">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-[#2A1E17] leading-relaxed">{addr.street}</p>
                        <p className="text-xs text-[#2A1E17]/80 mt-1">
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p className="text-xs text-[#2A1E17]/60 font-semibold uppercase mt-0.5">{addr.country}</p>

                        <div className="mt-4 pt-3.5 border-t border-[#0D1B2A]/5 flex items-center justify-between">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => openEditAddress(addr)}
                              className="text-xs font-bold text-[#2A1E17]/60 hover:text-[#E09F3E] cursor-pointer"
                            >
                              Modify
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-xs font-bold text-red-600/70 hover:text-red-700 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-xs font-extrabold text-[#E09F3E] hover:text-[#0D1B2A] cursor-pointer"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Order History */}
            {activeTab === "orders" && (
              <div className="bg-white border border-[#A47251]/10 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#2A1E17]">My Orders</h3>
                  <p className="text-xs text-[#2A1E17]/60">Track and inspect details of your past and present orders.</p>
                </div>

                {isLoadingOrders ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-3 border-[#E09F3E]/20 border-t-[#E09F3E] rounded-full animate-spin"></div>
                    <p className="text-xs text-[#2A1E17]/60 mt-3 font-semibold">Retrieving your order receipts...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-[#A47251]/10 rounded-2xl bg-[#FDF9F0]/10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-14 h-14 text-[#2A1E17]/30 mx-auto">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <h4 className="mt-4 font-serif text-lg font-bold text-[#2A1E17]">No Orders Placed Yet</h4>
                    <p className="text-xs text-[#2A1E17]/60 max-w-sm mx-auto mt-1">Indulge in our exquisite, handcrafted bakery goods. Browse our collection and treat yourself today.</p>
                    <Link
                      href="/menu"
                      className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0D1B2A] hover:bg-[#E09F3E] transition-colors shadow-md shadow-[#0D1B2A]/10"
                    >
                      Explore Menu & Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-[#0D1B2A]/10 rounded-2xl overflow-hidden bg-[#FDF9F0]/5">
                        {/* Order Header Summary */}
                        <div className="bg-[#EAE8E4]/40 px-5 py-4 border-b border-[#0D1B2A]/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[#2A1E17]">
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
                            <div>
                              <p className="font-bold text-[#2A1E17]/50 uppercase tracking-widest text-[9px]">Order Placed</p>
                              <p className="font-bold mt-0.5">{order.createdAt ? formatDate(order.createdAt) : "Recently"}</p>
                            </div>
                            <div>
                              <p className="font-bold text-[#2A1E17]/50 uppercase tracking-widest text-[9px]">Receipt ID</p>
                              <p className="font-mono mt-0.5">{order.id}</p>
                            </div>
                            <div>
                              <p className="font-bold text-[#2A1E17]/50 uppercase tracking-widest text-[9px]">Fulfillment</p>
                              <p className="font-bold mt-0.5 capitalize">{order.fulfillment?.type || "Delivery"}</p>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-[#0D1B2A]/5 pt-2.5 sm:pt-0">
                            <div>
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getStatusStyles(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <span className="sm:mt-1.5 font-serif text-sm font-black text-[#0D1B2A]">
                              LKR {(order.total || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-5 space-y-4">
                          <div className="divide-y divide-[#0D1B2A]/5">
                            {order.items?.map((item) => (
                              <div key={item.productId} className="py-3.5 first:pt-0 last:pb-0 flex items-center space-x-4">
                                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-50 border border-[#0D1B2A]/10 flex-shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.image || "/images/placeholder.jpg"}
                                    alt={item.name}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-sm font-bold text-[#2A1E17] truncate">{item.name}</h5>
                                  <p className="text-xs text-[#2A1E17]/60 mt-0.5">
                                    Qty: {item.quantity} × LKR {item.price.toLocaleString()}
                                  </p>
                                </div>
                                <span className="text-sm font-bold text-[#2A1E17]">
                                  LKR {(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Fulfillment / Delivery Summary Details */}
                          <div className="border-t border-[#0D1B2A]/5 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#2A1E17]/85">
                            <div>
                              <h6 className="font-bold text-[#2A1E17]/50 uppercase tracking-widest text-[9.5px] mb-1">
                                Shipping Destination
                              </h6>
                              {order.fulfillment?.type === "pickup" ? (
                                <div className="space-y-0.5">
                                  <p className="font-bold text-[#0D1B2A]">Store Pickup: {order.fulfillment.pickupDetails?.branch}</p>
                                  <p>Date: {order.fulfillment.pickupDetails?.date ? formatDate(order.fulfillment.pickupDetails.date) : "N/A"}</p>
                                  <p>Scheduled Time: {order.fulfillment.pickupDetails?.time || "N/A"}</p>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <p className="font-bold text-[#2A1E17]">
                                    {order.shippingAddress?.street || order.fulfillment?.deliveryDetails?.address}
                                  </p>
                                  <p>
                                    {order.shippingAddress?.city || order.fulfillment?.deliveryDetails?.city},{" "}
                                    {order.shippingAddress?.state || "Western"} {order.shippingAddress?.postalCode || ""}
                                  </p>
                                  <p>Recipient Phone: {order.fulfillment?.deliveryDetails?.recipientPhone || order.fulfillment?.deliveryDetails?.phone || "N/A"}</p>
                                </div>
                              )}
                            </div>

                            <div className="md:text-right flex flex-col justify-end">
                              <p className="space-x-2">
                                <span className="text-[#2A1E17]/60">Payment Method:</span>
                                <span className="font-semibold uppercase text-xs">
                                  {order.paymentDetails?.method === "cod" ? "Cash on Delivery" : order.paymentDetails?.method === "bank_deposit" ? "Bank Deposit" : "Credit Card / Stripe"}
                                </span>
                              </p>
                              <p className="space-x-2 mt-0.5">
                                <span className="text-[#2A1E17]/60">Payment Status:</span>
                                <span className={`font-semibold capitalize text-xs ${order.paymentDetails?.status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                                  {order.paymentDetails?.status || "unpaid"}
                                </span>
                              </p>
                              {order.orderNote && (
                                <p className="mt-2 text-left md:text-right italic text-[#2A1E17]/60">
                                  Note: "{order.orderNote}"
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-[#FDF9F0]">
          <div className="w-12 h-12 border-4 border-[#E09F3E]/20 border-t-[#E09F3E] rounded-full animate-spin"></div>
          <p className="mt-4 font-serif text-[#2A1E17] font-semibold">Loading profile...</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
