"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    setEmailError("");
    setGeneralError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setEmailError("Email address is required.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("If an account exists with this email address, a password reset link has been dispatched.");
        setEmail("");
      } else {
        setGeneralError(data.error || "Failed to process password reset. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setGeneralError("An error occurred. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FBFBF9] min-h-[75vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white border border-[#2A1E17]/10 rounded-3xl shadow-2xl p-8 sm:p-10">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">Trouble Logging In?</span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2A1E17]">Reset Password</h2>
          <p className="text-xs text-[#3A2E2B]/60 font-semibold uppercase tracking-wider">Recover your account details</p>
        </div>

        {successMessage ? (
          <div className="space-y-6 text-center animate-fade-in py-6">
            <div className="mx-auto h-16 w-16 bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-8 h-8 text-emerald-800">
                <rect x="3" y="5" width="18" height="14" strokeLinecap="square" strokeLinejoin="miter" />
                <polygon points="3,5 12,13 21,5" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </div>
            <p className="text-sm text-[#3A2E2B]/85 leading-relaxed">
              {successMessage}
            </p>
            <Link
              href="/login"
              className="inline-block w-full rounded-full bg-[#2A1E17] text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2A1E17] transition-all text-center cursor-pointer"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {generalError && (
              <div className="bg-red-50 border border-red-250 text-red-750 p-4 text-xs font-semibold flex items-center space-x-2">
                <span className="font-sans px-1 py-0.5 border border-red-300 bg-white text-[9px] uppercase tracking-wider text-red-700">Error</span>
                <span>{generalError}</span>
              </div>

            )}

            <p className="text-xs leading-relaxed text-[#3A2E2B]/75 font-semibold">
              Enter your registered email address and we will mail you a link to reset your account credentials.
            </p>

            {/* Email Field */}
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
                placeholder="john@example.com"
                className={`w-full bg-[#FBFBF9] border rounded-xl px-4 py-3 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
                  emailError
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-[#2A1E17]/10 focus:border-[#C5A880] focus:ring-[#C5A880]"
                }`}
              />
              {emailError && <p className="text-[10.5px] font-semibold text-red-500">{emailError}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#2A1E17] text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2A1E17] disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer mt-8"
            >
              {isSubmitting ? (
                <span className="inline-block h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center mt-6 pt-4 border-t border-[#2A1E17]/5">
              <Link
                href="/login"
                className="text-xs text-[#C5A880] hover:underline font-bold uppercase tracking-wider"
              >
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
