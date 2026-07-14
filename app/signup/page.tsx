"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Field Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time validations
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    setGeneralError("");

    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else {
      // Validate phone (allowing digits, spaces, hyphens, and optional starting +)
      const phoneRegex = /^\+?[0-9\s-]{9,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        newErrors.phone = "Please enter a valid phone number.";
      }
    }

    // Password strength check
    if (!password) {
      newErrors.password = "Password is required.";
    } else {
      if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long.";
      } else {
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
          newErrors.password = "Password must contain uppercase, lowercase, digit, and special character.";
        }
      }
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!termsAccepted) {
      newErrors.terms = "You must agree to the Terms and Conditions.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setGeneralError("");

    try {
      // 1. Create account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Save User Profile in Firestore /users/{uid}
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: email.trim().toLowerCase(),
        displayName: `${firstName.trim()} ${lastName.trim()}`,
        phoneNumber: phone.trim(),
        role: "customer", // Hardcoded role to ensure customer can only signup as customer role
        shippingAddresses: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log("Signup successful. Firestore profile saved.");

      // 3. Redirection logic
      if (redirect) {
        const hasQuery = redirect.includes("?");
        router.replace(`${redirect}${hasQuery ? "&" : "?"}openCheckout=true`);
      } else {
        router.replace("/");
      }
    } catch (error: any) {
      console.warn("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        setErrors((prev) => ({ ...prev, email: "This email address is already in use." }));
      } else if (error.code === "auth/invalid-email") {
        setErrors((prev) => ({ ...prev, email: "The email address is invalid." }));
      } else if (error.code === "auth/configuration-not-found") {
        setGeneralError("Firebase Authentication is not enabled. Please enable the Email/Password sign-in provider in your Firebase Console.");
      } else {
        setGeneralError("Failed to create an account. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white border border-[#A47251]/10 rounded-3xl shadow-2xl p-8 sm:p-10">
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#DD9E59]">Join Warm Delights</span>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2A1E17]">Create Account</h2>
        <p className="text-xs text-[#2A1E17]/60 font-semibold uppercase tracking-wider">Start ordering freshly baked goods</p>
      </div>

      {generalError && (
        <div className="bg-red-50 border border-red-250 text-red-750 p-4 text-xs font-semibold mb-6 flex items-center space-x-2">
          <span className="font-sans px-1 py-0.5 border border-red-300 bg-white text-[9px] uppercase tracking-wider text-red-700">Error</span>
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-5">
        
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className={`w-full bg-[#FDF9F0] border rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
                errors.firstName ? "border-red-500" : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
              }`}
            />
            {errors.firstName && <p className="text-[10px] font-semibold text-red-500">{errors.firstName}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className={`w-full bg-[#FDF9F0] border rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
                errors.lastName ? "border-red-500" : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
              }`}
            />
            {errors.lastName && <p className="text-[10px] font-semibold text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className={`w-full bg-[#FDF9F0] border rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
              errors.email ? "border-red-500" : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
            }`}
          />
          {errors.email && <p className="text-[10px] font-semibold text-red-500">{errors.email}</p>}
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +94 77 123 4567"
            className={`w-full bg-[#FDF9F0] border rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
              errors.phone ? "border-red-500" : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
            }`}
          />
          {errors.phone && <p className="text-[10px] font-semibold text-red-500">{errors.phone}</p>}
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full bg-[#FDF9F0] border rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
                errors.password ? "border-red-500" : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
              }`}
            />
            {errors.password && <p className="text-[10px] font-semibold text-red-500 leading-tight">{errors.password}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Confirm Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full bg-[#FDF9F0] border rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
                errors.confirmPassword ? "border-red-500" : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
              }`}
            />
            {errors.confirmPassword && <p className="text-[10px] font-semibold text-red-500">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Password Requirements hint */}
        <div className="bg-[#F0D8A1]/50 border border-[#A47251]/5 rounded-xl p-3.5 text-[9.5px] leading-relaxed text-[#2A1E17]/70 font-semibold space-y-1">
          <p className="uppercase tracking-wider text-[10px] text-[#2A1E17] font-bold mb-1">Password Requirements:</p>
          <p>• At least 8 characters in length</p>
          <p>• At least 1 uppercase & 1 lowercase letter</p>
          <p>• At least 1 numeric digit & 1 special character</p>
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="flex items-start space-x-2 pt-2">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#A47251]/10 text-[#DD9E59] focus:ring-[#DD9E59]"
          />
          <label htmlFor="terms" className="text-xs text-[#2A1E17]/85 font-semibold cursor-pointer">
            I agree to the <span className="text-[#DD9E59] hover:underline font-bold">Terms &amp; Conditions</span> and privacy policy.
          </label>
        </div>
        {errors.terms && <p className="text-[10px] font-semibold text-red-500">{errors.terms}</p>}

        {/* Signup Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-[#A47251] text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer mt-4"
        >
          {isSubmitting ? (
            <span className="inline-block h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="text-center mt-6 pt-6 border-t border-[#A47251]/5">
        <p className="text-xs text-[#2A1E17]/70 font-semibold">
          Already have an account?{" "}
          <Link
            href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
            className="text-[#DD9E59] hover:underline font-bold"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="bg-[#FDF9F0] min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="w-full max-w-lg bg-white border border-[#A47251]/10 rounded-3xl p-10 flex flex-col items-center justify-center space-y-4">
          <span className="inline-block h-8 w-8 border-4 border-[#DD9E59] border-t-transparent rounded-full animate-spin"></span>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2A1E17]/50 animate-pulse">Loading form...</p>
        </div>
      }>
        <SignupForm />
      </Suspense>
    </div>
  );
}
