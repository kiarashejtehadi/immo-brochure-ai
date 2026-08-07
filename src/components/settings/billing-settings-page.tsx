"use client";

import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { SettingsNav } from "@/components/settings/settings-nav";
import { openLemonSqueezyCheckout } from "@/lib/billing/lemon-checkout-client";
import type { BillingPlanKey } from "@/types/billing";
import type { UiLocale } from "@/lib/i18n";
import { getBillingCopy, interpolate, planDisplayNameLocalized } from "@/lib/i18n-billing";
import { readJsonResponse } from "@/lib/http/read-json-response";

export function BillingSettingsPage({ locale }: { locale: string }) {
  const uiLocale = locale as UiLocale;
  const copy = getBillingCopy(uiLocale);
  const { status, loading } = useBillingStatus();
  const [portalLoading, setPortalLoading] = useState(false);
  const [switchLoading, setSwitchLoading] = useState<BillingPlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasSubscription = status?.hasActiveSubscription === true;
  const currentPlan = status?.planId;

  const openPortal = useCallback(async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ locale }),
      });
      const data = await readJsonResponse<{ url?: string; error?: string }>(res);
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? copy.portalError);
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.portalError);
    } finally {
      setPortalLoading(false);
    }
  }, [copy.portalError, locale]);

  const switchPlan = useCallback(
    async (plan: BillingPlanKey) => {
      setSwitchLoading(plan);
      setError(null);
      try {
        const res = await fetch("/api/checkout/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ plan, locale }),
        });
        const data = await readJsonResponse<{ url?: string; error?: string }>(res);
        if (!res.ok || !data.url) {
          throw new Error(data.error ?? copy.checkoutFailed);
        }
        await openLemonSqueezyCheckout(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : copy.checkoutFailed);
      } finally {
        setSwitchLoading(null);
      }
    },
    [copy.checkoutFailed, locale],
  );

  const alternatePlan: BillingPlanKey | null =
    currentPlan === "monthly" ? "yearly" : currentPlan === "yearly" ? "monthly" : null;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/create"
          className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {copy.backToStudio}
        </Link>
      </div>

      <SettingsNav />

      <div className="space-y-8">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {copy.settingsBillingTitle}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {copy.settingsBillingSubtitle}
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500">{copy.loading}</p>
        ) : !hasSubscription ? (
          <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{copy.billingNoSubscription}</p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              {copy.settingsPlansBilling}
            </Link>
          </section>
        ) : (
          <>
            <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {copy.billingCurrentPlan}
              </h2>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                {planDisplayNameLocalized(currentPlan ?? null, uiLocale)}
              </p>
              {status?.currentPeriodEnd ? (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {interpolate(copy.billingRenewsOn, {
                    date: new Date(status.currentPeriodEnd).toLocaleDateString(uiLocale),
                  })}
                </p>
              ) : null}
            </section>

            {alternatePlan ? (
              <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {copy.billingChangePlan}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {copy.billingChangePlanHint}
                </p>
                <button
                  type="button"
                  disabled={switchLoading !== null}
                  onClick={() => void switchPlan(alternatePlan)}
                  className="mt-4 cursor-pointer rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                >
                  {switchLoading === alternatePlan
                    ? copy.openingCheckout
                    : alternatePlan === "yearly"
                      ? copy.billingSwitchToYearly
                      : copy.billingSwitchToMonthly}
                </button>
              </section>
            ) : null}

            <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {copy.billingPortalTitle}
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {copy.billingPortalHint}
              </p>
              <button
                type="button"
                disabled={portalLoading}
                onClick={() => void openPortal()}
                className="mt-4 cursor-pointer rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                {portalLoading ? "…" : copy.manageSubscription}
              </button>
            </section>
          </>
        )}

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </>
  );
}
