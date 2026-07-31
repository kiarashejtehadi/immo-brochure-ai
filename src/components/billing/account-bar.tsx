"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Lock } from "lucide-react";
import { planDisplayName } from "@/lib/billing/config";
import { isCreditPackPlan } from "@/lib/billing/client-access";
import { AuthEmailModal } from "@/components/billing/auth-email-modal";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { getBrowserAuthEmail } from "@/lib/supabase/client-session";
import { readJsonResponse } from "@/lib/http/read-json-response";
import { CreditPackUsage, shouldShowCreditPackUsage } from "@/components/billing/credit-pack-usage";

const supabaseConfigured = Boolean(
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
);

export function AccountBar({ locale }: { locale: string }) {
  const { status, loading, refresh } = useBillingStatus();
  const [browserEmail, setBrowserEmail] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getBrowserAuthEmail().then((email) => {
      if (!cancelled) {
        setBrowserEmail(email);
        setSessionChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [status?.email]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST", credentials: "same-origin" });
      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      window.location.href = `/${locale}`;
    } finally {
      setSigningOut(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ locale }),
      });
      const data = await readJsonResponse<{ url?: string; error?: string }>(res);
      if (!res.ok || !data.url) {
        setPortalError(data.error ?? "Could not open subscription portal.");
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : "Could not open subscription portal.");
    } finally {
      setPortalLoading(false);
    }
  }

  if (!supabaseConfigured) {
    return null;
  }

  const email = status?.email ?? browserEmail;
  const billingEnabled = status?.billingEnabled === true;
  const ready = sessionChecked && !loading;

  const planLabel =
    email && billingEnabled
      ? status?.hasActiveSubscription
        ? planDisplayName(status.planId)
        : shouldShowCreditPackUsage(status)
          ? null
          : (status?.remainingCredits ?? 0) > 0
            ? `${status.remainingCredits} credits`
            : "No plan"
      : null;

  const needsPlan =
    billingEnabled &&
    Boolean(email) &&
    !status?.hasActiveSubscription &&
    (status?.remainingCredits ?? 0) === 0;

  const brandingLocked = isCreditPackPlan(status);

  return (
    <>
      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Account</p>
        <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
          {!ready && !email ? (
            <span className="text-xs text-zinc-400">Loading…</span>
          ) : email ? (
            <>
              <span className="max-w-[14rem] truncate text-xs text-zinc-600 dark:text-zinc-400">
                {email}
              </span>
              {billingEnabled && planLabel ? (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                  {planLabel}
                </span>
              ) : null}
              {billingEnabled ? <CreditPackUsage status={status} variant="compact" /> : null}
              {billingEnabled ? (
                needsPlan ? (
                  <Link
                    href="/checkout"
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Choose plan
                  </Link>
                ) : (
                  <Link
                    href="/pricing"
                    className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Pricing
                  </Link>
                )
              ) : null}
              {billingEnabled && status?.hasActiveSubscription ? (
                <>
                  <button
                    type="button"
                    onClick={() => void handlePortal()}
                    disabled={portalLoading}
                    className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    {portalLoading ? "…" : "Manage subscription"}
                  </button>
                  {portalError ? (
                    <p className="w-full text-right text-xs text-red-600 dark:text-red-400" role="alert">
                      {portalError}
                    </p>
                  ) : null}
                </>
              ) : null}
              <Link
                href="/settings"
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Branding
                {brandingLocked ? (
                  <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400" aria-hidden />
                ) : null}
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
                className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {signingOut ? "…" : "Sign out"}
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
              {billingEnabled ? (
                <Link href="/checkout" className="text-xs font-medium underline">
                  View pricing
                </Link>
              ) : null}
            </>
          )}
        </div>
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
