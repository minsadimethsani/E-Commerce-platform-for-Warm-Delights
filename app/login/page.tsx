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
          router.replace("/admin");
        } else {
          // If it's a customer and they have a redirect URL, send them back
          if (redirect) {
            const hasQuery = redirect.includes("?");
            router.replace(`${redirect}${hasQuery ? "&" : "?"}openCheckout=true`);
          } else {
            router.replace("/");
          }
        }
      } else {
        // Fallback profile if profile document is missing (should not happen normally)
        if (redirect) {
          const hasQuery = redirect.includes("?");
          router.replace(`${redirect}${hasQuery ? "&" : "?"}openCheckout=true`);
        } else {
          router.replace("/");
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
    <div className="w-full max-w-md bg-white border border-[#2A1E17]/10 rounded-3xl shadow-2xl p-8 sm:p-10">
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">Welcome Back</span>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2A1E17]">Log In</h2>
        <p className="text-xs text-[#3A2E2B]/60 font-semibold uppercase tracking-wider">Indulge in artisanal delicacies</p>
      </div>

      {generalError && (
        <div className="bg-red-50 border border-red-250 text-red-750 rounded-2xl p-4 text-xs font-semibold mb-6 flex items-center space-x-2">
          <span>⚠️</span>
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Address */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            placeholder="mmethsani@gmil.com"
            className={`w-full bg-[#FBFBF9] border rounded-xl px-4 py-3 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
              emailError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-[#2A1E17]/10 focus:border-[#C5A880] focus:ring-[#C5A880]"
            }`}
          />
          {emailError && <p className="text-[10.5px] font-semibold text-red-500">{emailError}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] hover:underline"
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
              className={`w-full bg-[#FBFBF9] border rounded-xl pl-4 pr-10 py-3 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
                passwordError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-[#2A1E17]/10 focus:border-[#C5A880] focus:ring-[#C5A880]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2A1E17] focus:outline-none text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {passwordError && <p className="text-[10.5px] font-semibold text-red-500">{passwordError}</p>}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-[#2A1E17] text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2A1E17] disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer mt-8"
        >
          {isSubmitting ? (
            <span className="inline-block h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Log In"
          )}
        </button>
      </form>

      <div className="text-center mt-6 pt-6 border-t border-[#2A1E17]/5">
        <p className="text-xs text-[#3A2E2B]/70 font-semibold">
          Don&apos;t have an account?{" "}
          <Link
            href={redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : "/signup"}
            className="text-[#C5A880] hover:underline font-bold"
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
    <div className="bg-[#FBFBF9] min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white border border-[#2A1E17]/10 rounded-3xl p-10 flex flex-col items-center justify-center space-y-4">
          <span className="inline-block h-8 w-8 border-4 border-[#C5A880] border-t-transparent rounded-full animate-spin"></span>
          <p className="text-xs font-bold uppercase tracking-widest text-[#3A2E2B]/50 animate-pulse">Loading form...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
