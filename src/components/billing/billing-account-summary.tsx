"use client";

import { useBillingStatus } from "@/hooks/use-billing-status";
import { hasBrowserAuthSession } from "@/lib/supabase/client-session";
import { CreditPackUsage, shouldShowCreditPackUsage } from "@/components/billing/credit-pack-usage";
import type { UiLocale } from "@/lib/i18n";
import { getBillingCopy, interpolate, planDisplayNameLocalized } from "@/lib/i18n-billing";
import { useEffect, useState } from "react";

/** Shown on /checkout when the user is signed in — current plan snapshot. */
export function BillingAccountSummary({ locale }: { locale: string }) {
  const uiLocale = locale as UiLocale;
  const copy = getBillingCopy(uiLocale);
  const { status, loading } = useBillingStatus();
  const [browserSignedIn, setBrowserSignedIn] = useState(false);

  useEffect(() => {
    void hasBrowserAuthSession().then(setBrowserSignedIn);
  }, [status?.email]);

  if (loading && !status) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
        {copy.loadingAccount}
      </p>
    );
  }

  if (!status?.billingEnabled) return null;

  const signedIn = Boolean(status.email) || browserSignedIn;

  if (!signedIn) {
    return (
      <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        {copy.signInBeforeCheckout}
      </p>
    );
  }

  if (!status.email) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-900 dark:bg-amber-950/40">
        <h2 className="text-sm font-semibold text-amber-950 dark:text-amber-100">
          {copy.sessionDetectedTitle}
        </h2>
        <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">{copy.sessionDetectedBody}</p>
      </section>
    );
  }

  const planLabel = status.hasActiveSubscription
    ? planDisplayNameLocalized(status.planId, uiLocale)
    : shouldShowCreditPackUsage(status)
      ? copy.payPerUseCreditPack
      : status.remainingCredits > 0
        ? interpolate(copy.creditsRemainingAccess, { count: status.remainingCredits })
        : copy.noActivePlanOrCredits;

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{copy.yourAccount}</h2>
        <dl className="mt-2 grid gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          <div>
            <dt className="inline font-medium text-zinc-800 dark:text-zinc-200">{copy.emailLabel} </dt>
            <dd className="inline">{status.email}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-zinc-800 dark:text-zinc-200">{copy.accessLabel} </dt>
            <dd className="inline">{planLabel}</dd>
          </div>
        </dl>
        {!status.hasActiveSubscription && status.remainingCredits === 0 && !shouldShowCreditPackUsage(status) ? (
          <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">{copy.pickPlanBelow}</p>
        ) : null}
      </section>
      <CreditPackUsage status={status} variant="panel" locale={uiLocale} />
    </div>
  );
}
