"use client";

import { useBillingStatus } from "@/hooks/use-billing-status";
import { hasBrowserAuthSession } from "@/lib/supabase/client-session";
import { planDisplayName } from "@/lib/billing/config";
import { CreditPackUsage, shouldShowCreditPackUsage } from "@/components/billing/credit-pack-usage";
import { useEffect, useState } from "react";

/** Shown on /checkout when the user is signed in — current plan snapshot. */
export function BillingAccountSummary() {
  const { status, loading } = useBillingStatus();
  const [browserSignedIn, setBrowserSignedIn] = useState(false);

  useEffect(() => {
    void hasBrowserAuthSession().then(setBrowserSignedIn);
  }, [status?.email]);

  if (loading && !status) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
        Loading account…
      </p>
    );
  }

  if (!status?.billingEnabled) return null;

  const signedIn = Boolean(status.email) || browserSignedIn;

  if (!signedIn) {
    return (
      <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        Use <span className="font-medium">Account</span> (top right) to sign in before checkout.
      </p>
    );
  }

  if (!status.email) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-900 dark:bg-amber-950/40">
        <h2 className="text-sm font-semibold text-amber-950 dark:text-amber-100">Session detected</h2>
        <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
          You appear signed in in this browser. Click a plan below — we will sync your session automatically.
          If checkout still asks you to sign in, use <span className="font-medium">Sign out</span> above and
          open a fresh magic link.
        </p>
      </section>
    );
  }

  const planLabel = status.hasActiveSubscription
    ? planDisplayName(status.planId)
    : shouldShowCreditPackUsage(status)
      ? "Pay-per-use (credit pack)"
      : status.remainingCredits > 0
        ? `${status.remainingCredits} credits remaining`
        : "No active plan or credits";

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Your account</h2>
        <dl className="mt-2 grid gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          <div>
            <dt className="inline font-medium text-zinc-800 dark:text-zinc-200">Email: </dt>
            <dd className="inline">{status.email}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-zinc-800 dark:text-zinc-200">Access: </dt>
            <dd className="inline">{planLabel}</dd>
          </div>
        </dl>
        {!status.hasActiveSubscription && status.remainingCredits === 0 && !shouldShowCreditPackUsage(status) ? (
          <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
            Pick a plan below to generate exposés.
          </p>
        ) : null}
      </section>
      <CreditPackUsage status={status} variant="panel" />
    </div>
  );
}
