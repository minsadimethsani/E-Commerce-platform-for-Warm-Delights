"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: Toast = { id, type, message, title };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast("success", message, title || "Success");
  }, [showToast]);

  const showError = useCallback((message: string, title?: string) => {
    showToast("error", message, title || "Error");
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast("info", message, title || "Notice");
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    showToast("warning", message, title || "Attention");
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, showSuccess, showError, showInfo, showWarning, removeToast }}
    >
      {children}
      {/* Toast Render Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col space-y-3 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 rounded-2xl p-4 shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-top-5 duration-300 ${
              toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/30"
                : toast.type === "error"
                ? "bg-rose-950/90 text-rose-100 border-rose-500/30"
                : toast.type === "warning"
                ? "bg-amber-950/90 text-amber-100 border-amber-500/30"
                : "bg-[#2A1E17]/95 text-[#FDF9F0] border-[#DD9E59]/30"
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}
              {toast.type === "error" && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 border border-rose-400/30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
              )}
              {toast.type === "warning" && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002z" />
                  </svg>
                </div>
              )}
              {toast.type === "info" && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DD9E59]/20 text-[#DD9E59] border border-[#DD9E59]/30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0 pr-2">
              {toast.title && (
                <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs leading-relaxed opacity-90 font-medium">
                {toast.message}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 text-white/50 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
