"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { seedAdminUser } from "@/lib/auth-seed";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  // Seed the admin user once when the login page mounts
  useEffect(() => {
    seedAdminUser();
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Error States
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Validation
  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (!email.trim()) {
      setEmailError("Email address is required.");
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address.");
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setGeneralError("");

    try {
      // 1. Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Fetch User Profile from Firestore to determine the user role
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const profile = userDocSnap.data();
        const role = profile.role || "customer";

        // 3. Direct roles to correct paths
        if (role === "admin") {
          // Set administrative session cookies (valid for 1 hour)
          document.cookie = "session-active=true; path=/; max-age=3600; SameSite=Lax; Secure";
          document.cookie = `session-role=${role}; path=/; max-age=3600; SameSite=Lax; Secure`;
          router.replace("/admin/dashboard");
        } else {
          // Clear cookies for non-admin
          document.cookie = "session-active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "session-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

          // If a customer attempts to access the admin portal, block them
          if (redirect && redirect.startsWith("/admin")) {
            setGeneralError("Access denied. You do not have administrative privileges.");
            await auth.signOut();
          } else {
            if (redirect) {
              const hasQuery = redirect.includes("?");
              router.replace(`${redirect}${hasQuery ? "&" : "?"}openCheckout=true`);
            } else {
              router.replace("/");
            }
          }
        }
      } else {
        // Fallback for missing profile
        document.cookie = "session-active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "session-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        if (redirect && redirect.startsWith("/admin")) {
          setGeneralError("Access denied. Admin profile document not found.");
          await auth.signOut();
        } else {
          if (redirect) {
            const hasQuery = redirect.includes("?");
            router.replace(`${redirect}${hasQuery ? "&" : "?"}openCheckout=true`);
          } else {
            router.replace("/");
          }
        }
      }
    } catch (error: any) {
      console.warn("Login error:", error);
      // Map error codes to user friendly messages
      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setGeneralError("Incorrect email or password. Please try again.");
          break;
        case "auth/user-disabled":
          setGeneralError("This account has been disabled. Please contact support.");
          break;
        case "auth/too-many-requests":
          setGeneralError("Too many failed attempts. Please try again later.");
          break;
        case "auth/configuration-not-found":
          setGeneralError("Firebase Authentication is not enabled. Please enable the Email/Password sign-in provider in your Firebase Console.");
          break;
        default:
          setGeneralError("Failed to log in. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-[#A47251]/10 rounded-3xl shadow-2xl p-8 sm:p-10">
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#DD9E59]">Welcome Back</span>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2A1E17]">Log In</h2>
        <p className="text-xs text-[#2A1E17]/60 font-semibold uppercase tracking-wider">Indulge in artisanal delicacies</p>
      </div>

      {generalError && (
        <div className="bg-red-50 border border-red-250 text-red-750 p-4 text-xs font-semibold mb-6 flex items-center space-x-2">
          <span className="font-sans px-1 py-0.5 border border-red-300 bg-white text-[9px] uppercase tracking-wider text-red-700">Error</span>
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Address */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            placeholder="customer@example.com"
            className={`w-full bg-[#FDF9F0] border rounded-xl px-4 py-3 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
              emailError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
            }`}
          />
          {emailError && <p className="text-[10.5px] font-semibold text-red-500">{emailError}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2A1E17]/75">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[10px] font-bold uppercase tracking-wider text-[#DD9E59] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="••••••••"
              className={`w-full bg-[#FDF9F0] border rounded-xl pl-4 pr-10 py-3 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
                passwordError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-[#A47251]/10 focus:border-[#DD9E59] focus:ring-[#DD9E59]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2A1E17] focus:outline-none cursor-pointer"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </button>
          </div>
          {passwordError && <p className="text-[10.5px] font-semibold text-red-500">{passwordError}</p>}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-[#A47251] text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-[#DD9E59] hover:text-[#2A1E17] disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer mt-8"
        >
          {isSubmitting ? (
            <span className="inline-block h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Log In"
          )}
        </button>
      </form>

      <div className="text-center mt-6 pt-6 border-t border-[#A47251]/5">
        <p className="text-xs text-[#2A1E17]/70 font-semibold">
          Don&apos;t have an account?{" "}
          <Link
            href={redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : "/signup"}
            className="text-[#DD9E59] hover:underline font-bold"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-[#FDF9F0] min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white border border-[#A47251]/10 rounded-3xl p-10 flex flex-col items-center justify-center space-y-4">
          <span className="inline-block h-8 w-8 border-4 border-[#DD9E59] border-t-transparent rounded-full animate-spin"></span>
          <p className="text-xs font-bold uppercase tracking-widest text-[#2A1E17]/50 animate-pulse">Loading form...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
