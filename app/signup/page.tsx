"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { sendWelcomeEmail } from "@/app/actions";

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

  // Field Errors & Touched States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);

  // Real-time live validations
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Validate First Name
    if (touched.firstName) {
      if (!firstName.trim()) {
        newErrors.firstName = "First name is required.";
      } else if (!/^[A-Za-z\s]+$/.test(firstName.trim())) {
        newErrors.firstName = "First name should only contain letters.";
      }
    }

    // Validate Last Name
    if (touched.lastName) {
      if (!lastName.trim()) {
        newErrors.lastName = "Last name is required.";
      } else if (!/^[A-Za-z\s]+$/.test(lastName.trim())) {
        newErrors.lastName = "Last name should only contain letters.";
      }
    }

    // Validate Email
    if (touched.email) {
      if (!email.trim()) {
        newErrors.email = "Email address is required.";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          newErrors.email = "Please enter a valid email address.";
        }
      }
    }

    // Validate Phone Number
    if (touched.phone) {
      if (!phone.trim()) {
        newErrors.phone = "Phone number is required.";
      } else {
        const phoneRegex = /^\+?[0-9\s-]{9,15}$/;
        if (!phoneRegex.test(phone.trim())) {
          newErrors.phone = "Please enter a valid phone number (9 to 15 digits).";
        }
      }
    }

    // Validate Password
    if (touched.password) {
      if (!password) {
        newErrors.password = "Password is required.";
      } else if (password.length < 8) {
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

    // Validate Confirm Password
    if (touched.confirmPassword) {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Confirm password is required.";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    // Validate Terms Agreement
    if (touched.terms) {
      if (!termsAccepted) {
        newErrors.terms = "You must agree to the Terms and Conditions.";
      }
    }

    setErrors(newErrors);
  }, [firstName, lastName, email, phone, password, confirmPassword, termsAccepted, touched]);

  const validateForm = (): boolean => {
    // Mark all as touched for submission
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    // We rely on the errors state populated by the effect, 
    // but we can check if it has errors here
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!email.trim()) newErrors.email = "Email address is required.";
    if (!phone.trim()) newErrors.phone = "Phone number is required.";
    if (!password) newErrors.password = "Password is required.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!termsAccepted) newErrors.terms = "You must agree to the Terms and Conditions.";

    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setGeneralError("");

    try {
      const usersRef = collection(db, "users");

      // Check if email already has an account
      const qEmail = query(usersRef, where("email", "==", email.trim().toLowerCase()));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        setGeneralError("Account already exists for this email or phone number. Please log in.");
        setIsSubmitting(false);
        return;
      }

      // Check if phone number already has an account
      const qPhone = query(usersRef, where("phoneNumber", "==", phone.trim()));
      const snapPhone = await getDocs(qPhone);
      if (!snapPhone.empty) {
        setGeneralError("Account already exists for this email or phone number. Please log in.");
        setIsSubmitting(false);
        return;
      }

      // 1. Create account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Save User Profile in Firestore /users/{uid}
      const userDocRef = doc(db, "users", user.uid);
      const displayNameValue = `${firstName.trim()} ${lastName.trim()}`;
      await setDoc(userDocRef, {
        uid: user.uid,
        email: email.trim().toLowerCase(),
        displayName: displayNameValue,
        phoneNumber: phone.trim(),
        role: "customer", // Hardcoded role to ensure customer can only signup as customer role
        shippingAddresses: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log("Signup successful. Firestore profile saved.");

      // 3. Trigger Welcome Email via Firestore trigger email extension
      try {
        await sendWelcomeEmail(email.trim(), displayNameValue);
      } catch (emailErr) {
        console.error("Failed to trigger welcome email:", emailErr);
      }

      // 4. Show success screen
      setIsSignupSuccess(true);

      // 5. Redirection logic with delay
      setTimeout(() => {
        if (redirect) {
          const hasQuery = redirect.includes("?");
          router.replace(`${redirect}${hasQuery ? "&" : "?"}openCheckout=true`);
        } else {
          router.replace("/");
        }
      }, 3000);
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

  if (isSignupSuccess) {
    return (
      <div className="w-full max-w-lg bg-white border border-[#A47251]/10 rounded-3xl shadow-2xl p-8 sm:p-10 text-center space-y-6 animate-in fade-in duration-300">
        <div className="mx-auto h-20 w-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 shadow-lg shadow-green-150/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-10 h-10 animate-bounce"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-green-600 font-bold">Success</span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2A1E17]">Account Created!</h2>
          <p className="text-xs text-[#2A1E17]/60 font-semibold uppercase tracking-wider">Welcome to Warm Delights</p>
        </div>
        <div className="text-sm text-[#2A1E17]/75 space-y-2 pt-2 border-t border-[#A47251]/5">
          <p>Your account has been registered successfully.</p>
          <p className="font-semibold text-[#DD9E59]">A confirmation email has been sent to your inbox.</p>
        </div>
        <div className="flex flex-col items-center justify-center pt-4">
          <div className="w-6 h-6 border-2 border-[#DD9E59]/20 border-t-[#DD9E59] rounded-full animate-spin"></div>
          <p className="text-[10px] text-[#2A1E17]/40 uppercase tracking-widest font-bold mt-2">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-white border border-[#A47251]/10 rounded-3xl shadow-2xl p-8 sm:p-10">
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#DD9E59]">Join Warm Delights</span>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2A1E17]">Create Account</h2>
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
              onChange={(e) => {
                setFirstName(e.target.value);
                setTouched((prev) => ({ ...prev, firstName: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, firstName: true }))}
              placeholder="John"
              className={`w-full bg-[#FDF9F0] border rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${errors.firstName ? "border-red-500" : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
                }`}
            />
            {errors.firstName && <p className="text-[10px] font-semibold text-red-500">{errors.firstName}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setTouched((prev) => ({ ...prev, lastName: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, lastName: true }))}
              placeholder="Doe"
              className={`w-full bg-[#FDF9F0] border rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${errors.lastName ? "border-red-500" : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
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
            onChange={(e) => {
              setEmail(e.target.value);
              setTouched((prev) => ({ ...prev, email: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            placeholder="john@example.com"
            className={`w-full bg-[#FDF9F0] border rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${errors.email ? "border-red-500" : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
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
            onChange={(e) => {
              setPhone(e.target.value);
              setTouched((prev) => ({ ...prev, phone: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
            placeholder="e.g. +94 77 123 4567"
            className={`w-full bg-[#FDF9F0] border rounded-xl px-4 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${errors.phone ? "border-red-500" : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
              }`}
          />
          {errors.phone && <p className="text-[10px] font-semibold text-red-500">{errors.phone}</p>}
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setTouched((prev) => ({ ...prev, password: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                placeholder="••••••••"
                className={`w-full bg-[#FDF9F0] border rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${errors.password ? "border-red-500" : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2A1E17] focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4.5 h-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4.5 h-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-[10px] font-semibold text-red-500 leading-tight">{errors.password}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setTouched((prev) => ({ ...prev, confirmPassword: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                placeholder="••••••••"
                className={`w-full bg-[#FDF9F0] border rounded-xl pl-4 pr-10 py-2.5 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${errors.confirmPassword ? "border-red-500" : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2A1E17] focus:outline-none cursor-pointer"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4.5 h-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4.5 h-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
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
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              setTouched((prev) => ({ ...prev, terms: true }));
            }}
            className="mt-1 h-4 w-4 rounded border-[#A47251]/10 text-[#DD9E59] focus:ring-[#DD9E59]"
          />
          <label htmlFor="terms" className="text-xs text-[#2A1E17]/85 font-semibold cursor-pointer">
            I agree to the{" "}
            <Link
              href="/terms-and-conditions"
              onClick={(e) => e.stopPropagation()}
              className="text-[#DD9E59] hover:underline font-bold"
            >
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              onClick={(e) => e.stopPropagation()}
              className="text-[#DD9E59] hover:underline font-bold"
            >
              privacy policy
            </Link>
            .
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
