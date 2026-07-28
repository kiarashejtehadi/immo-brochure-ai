"use client";

import { useCallback, useEffect, useState } from "react";
import type { BillingStatusResponse } from "@/types/billing";
import { readJsonResponse } from "@/lib/http/read-json-response";

export const BILLING_REFRESH_EVENT = "immo:billing-refresh";

export function useBillingStatus(initial?: BillingStatusResponse | null) {
  const [status, setStatus] = useState<BillingStatusResponse | null>(initial ?? null);
  const [loading, setLoading] = useState(!initial);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/status", { cache: "no-store", credentials: "same-origin" });
      if (!res.ok) return;
      setStatus(await readJsonResponse<BillingStatusResponse>(res));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    const onBillingRefresh = () => void refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener(BILLING_REFRESH_EVENT, onBillingRefresh);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener(BILLING_REFRESH_EVENT, onBillingRefresh);
    };
  }, [refresh]);

  return { status, loading, refresh, isSignedIn: Boolean(status?.email) };
}
