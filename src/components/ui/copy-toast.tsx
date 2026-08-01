"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CopyToastContextValue = {
  showToast: (message: string) => void;
};

const CopyToastContext = createContext<CopyToastContextValue | null>(null);

export function CopyToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2200);
  }, []);

  return (
    <CopyToastContext.Provider value={{ showToast }}>
      {children}
      {message ? (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2",
            "rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900 shadow-lg",
            "dark:border-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-100",
          )}
        >
          {message}
        </div>
      ) : null}
    </CopyToastContext.Provider>
  );
}

export function useCopyToast() {
  const ctx = useContext(CopyToastContext);
  if (!ctx) {
    throw new Error("useCopyToast must be used within CopyToastProvider");
  }
  return ctx;
}
