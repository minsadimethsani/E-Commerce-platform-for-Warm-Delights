"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    setPasswordError("");
    setConfirmPasswordError("");
    setGeneralError("");
    setSuccessMessage("");

    if (!token) {
      setGeneralError("Invalid password reset request (missing validation token).");
      return false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      return false;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return false;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      setPasswordError("Password must contain uppercase, lowercase, digit, and special character.");
      return false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Your password has been successfully reset. You can now log in with your new credentials.");
        setPassword("");
        setConfirmPassword("");
      } else {
        setGeneralError(data.error || "Failed to reset password. The link may have expired or is invalid.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setGeneralError("An error occurred. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-[#2A1E17]/10 rounded-3xl shadow-2xl p-8 sm:p-10">
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880]">Security Update</span>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2A1E17]">New Password</h2>
        <p className="text-xs text-[#3A2E2B]/60 font-semibold uppercase tracking-wider">Update your account credentials</p>
      </div>

      {!token && (
        <div className="bg-red-50 border border-red-250 text-red-750 p-4 text-xs font-semibold mb-6 flex items-center space-x-2">
          <span className="font-sans px-1 py-0.5 border border-red-300 bg-white text-[9px] uppercase tracking-wider text-red-700">Error</span>
          <span>Access Denied: Missing password reset token. Please check your email link or request a new reset link.</span>
        </div>
      )}


      {successMessage ? (
        <div className="space-y-6 text-center animate-fade-in py-6">
          <div className="mx-auto h-16 w-16 bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 text-2xl font-bold">
            OK
          </div>
          <p className="text-sm text-[#3A2E2B]/85 leading-relaxed font-semibold">
            {successMessage}
          </p>
          <Link
            href="/login"
            className="inline-block w-full rounded-full bg-[#2A1E17] text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2A1E17] transition-all text-center cursor-pointer"
          >
            Go to Login
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

          {/* New Password */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="••••••••"
              disabled={!token}
              className={`w-full bg-[#FBFBF9] border rounded-xl px-4 py-3 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
                passwordError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-[#2A1E17]/10 focus:border-[#C5A880] focus:ring-[#C5A880]"
              }`}
            />
            {passwordError && <p className="text-[10.5px] font-semibold text-red-500 leading-tight">{passwordError}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3A2E2B]/75">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError("");
              }}
              placeholder="••••••••"
              disabled={!token}
              className={`w-full bg-[#FBFBF9] border rounded-xl px-4 py-3 text-sm text-[#2A1E17] focus:outline-none focus:ring-1 ${
                confirmPasswordError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-[#2A1E17]/10 focus:border-[#C5A880] focus:ring-[#C5A880]"
              }`}
            />
            {confirmPasswordError && <p className="text-[10.5px] font-semibold text-red-500">{confirmPasswordError}</p>}
          </div>

          {/* Password Requirements hint */}
          <div className="bg-[#EFEFEA]/50 border border-[#2A1E17]/5 rounded-xl p-3.5 text-[9.5px] leading-relaxed text-[#3A2E2B]/70 font-semibold space-y-1">
            <p className="uppercase tracking-wider text-[10px] text-[#2A1E17] font-bold mb-1">Password Requirements:</p>
            <p>• At least 8 characters in length</p>
            <p>• At least 1 uppercase & 1 lowercase letter</p>
            <p>• At least 1 numeric digit & 1 special character</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="w-full rounded-full bg-[#2A1E17] text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A880] hover:text-[#2A1E17] disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer mt-8"
          >
            {isSubmitting ? (
              <span className="inline-block h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-[#FBFBF9] min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white border border-[#2A1E17]/10 rounded-3xl p-10 flex flex-col items-center justify-center space-y-4">
          <span className="inline-block h-8 w-8 border-4 border-[#C5A880] border-t-transparent rounded-full animate-spin"></span>
          <p className="text-xs font-bold uppercase tracking-widest text-[#3A2E2B]/50 animate-pulse">Loading form...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
