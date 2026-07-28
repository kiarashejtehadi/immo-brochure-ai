"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { BillingStatusResponse } from "@/types/billing";
import { planDisplayName } from "@/lib/billing/config";
import { AuthEmailModal } from "@/components/billing/auth-email-modal";

export function AccountBar({ locale }: { locale: string }) {
  const [status, setStatus] = useState<BillingStatusResponse | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/status", { cache: "no-store" });
      if (!res.ok) return;
      setStatus((await res.json()) as BillingStatusResponse);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  if (!status?.billingEnabled) {
    return null;
  }

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    await refresh();
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  const planLabel = status.hasActiveSubscription
    ? planDisplayName(status.planId)
    : status.remainingCredits > 0
      ? `${status.remainingCredits} credits`
      : "No plan";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {status.email ? (
          <>
            <span className="hidden text-zinc-500 sm:inline">{status.email}</span>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
              {planLabel}
            </span>
            <button
              type="button"
              onClick={() => void handlePortal()}
              disabled={portalLoading || !status.hasActiveSubscription}
              className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {portalLoading ? "…" : "Manage subscription"}
            </button>
            <Link
              href="/checkout"
              className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Pricing
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="text-xs text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Sign in
            </button>
            <Link href="/checkout" className="text-xs font-medium underline">
              View pricing
            </Link>
          </>
        )}
      </div>
      <AuthEmailModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSent={() => {
          setAuthOpen(false);
          void refresh();
        }}
      />
    </>
  );
}
