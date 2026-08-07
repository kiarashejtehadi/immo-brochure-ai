"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BILLING_REFRESH_EVENT } from "@/hooks/use-billing-status";
import { readJsonResponse } from "@/lib/http/read-json-response";

type AuthSessionContextValue = {
  email: string | null;
  userId: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

const supabaseConfigured = Boolean(
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  const refresh = useCallback(async () => {
    if (!supabaseConfigured) {
      setEmail(null);
      setUserId(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) {
        setEmail(null);
        setUserId(null);
        return;
      }
      const data = await readJsonResponse<{ email?: string | null; userId?: string | null }>(res);
      setEmail(data.email ?? null);
      setUserId(data.userId ?? null);
      window.dispatchEvent(new Event(BILLING_REFRESH_EVENT));
    } catch {
      setEmail(null);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return;

    void refresh();

    const supabase = createSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({
      email,
      userId,
      loading,
      refresh,
    }),
    [email, userId, loading, refresh],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return ctx;
}

export function useOptionalAuthSession() {
  return useContext(AuthSessionContext);
}
