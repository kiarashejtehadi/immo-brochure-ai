"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BillingPlanKey } from "@/types/billing";
import { AuthEmailModal } from "@/components/billing/auth-email-modal";
import { PricingLegalNotice } from "@/components/billing/pricing-legal-notice";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { openLemonSqueezyCheckout } from "@/lib/billing/lemon-checkout-client";
import { getPlanCardDefinitions, type PlanFeature } from "@/lib/billing/plan-display";
import {
  hasBrowserAuthSession,
  refreshBrowserAuthSession,
} from "@/lib/supabase/client-session";
import { readJsonResponse } from "@/lib/http/read-json-response";
import type { UiLocale } from "@/lib/i18n";
import { getBillingCopy, interpolate } from "@/lib/i18n-billing";
import { cn } from "@/lib/utils";

async function postCheckout(plan: BillingPlanKey, locale: string) {
  return fetch("/api/checkout/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ plan, locale }),
  });
}

function PlanFeatureRow({ feature }: { feature: PlanFeature }) {
  const Icon = feature.included ? Check : X;
  return (
    <li className="flex items-start gap-2 text-sm leading-snug">
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          feature.included
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-zinc-400 dark:text-zinc-500",
        )}
        aria-hidden
      />
      <span
        className={cn(
          feature.included
            ? "text-zinc-700 dark:text-zinc-300"
            : "text-zinc-500 dark:text-zinc-500",
        )}
      >
        {feature.text}
      </span>
    </li>
  );
}

export function PricingSection({
  locale,
  billingEnabled,
  compact,
  subscriptionOnly,
}: {
  locale: string;
  billingEnabled: boolean;
  compact?: boolean;
  subscriptionOnly?: boolean;
}) {
  const uiLocale = locale as UiLocale;
  const copy = getBillingCopy(uiLocale);
  const router = useRouter();
  const { status, loading: statusLoading, refresh, isSignedIn } = useBillingStatus();
  const [loadingPlan, setLoadingPlan] = useState<BillingPlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const plans = getPlanCardDefinitions(uiLocale).filter(
    (plan) => !subscriptionOnly || plan.key !== "credits_pack",
  );

  async function startCheckout(plan: BillingPlanKey) {
    if (!billingEnabled) {
      setError(copy.billingNotConfiguredServer);
      return;
    }

    setLoadingPlan(plan);
    setError(null);
    try {
      let res = await postCheckout(plan, locale);

      if (res.status === 401 && (await hasBrowserAuthSession())) {
        await refreshBrowserAuthSession();
        router.refresh();
        res = await postCheckout(plan, locale);
      }

      if (res.status === 401) {
        setAuthOpen(true);
        return;
      }

      const data = await readJsonResponse<{ url?: string; error?: string }>(res);
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? copy.checkoutFailed);
      }
      await openLemonSqueezyCheckout(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.checkoutFailed);
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <section className="space-y-6">
      {!compact ? (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {copy.pricingTitle}
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{copy.pricingSubtitle}</p>
          {isSignedIn && status?.email ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {interpolate(copy.signedInAs, { email: status.email })}
            </p>
          ) : !statusLoading && billingEnabled ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{copy.signInWhenPrompted}</p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className={cn("grid gap-4", subscriptionOnly ? "md:grid-cols-2" : "md:grid-cols-3")}>
        {plans.map((plan) => (
          <article
            key={plan.key}
            className={cn(
              "relative flex flex-col rounded-2xl border p-5 shadow-sm",
              plan.highlight
                ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/20 dark:border-indigo-400 dark:bg-indigo-950/30"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
            )}
          >
            {plan.badge ? (
              <span
                className={cn(
                  "absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
                  plan.highlight
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
                )}
              >
                {plan.badge}
              </span>
            ) : null}

            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{plan.title}</h3>
            <p className="mt-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {plan.priceLabel}
            </p>

            <ul className="mt-4 flex-1 space-y-2.5">
              {plan.features.map((feature) => (
                <PlanFeatureRow key={feature.text} feature={feature} />
              ))}
            </ul>

            <button
              type="button"
              disabled={!billingEnabled || loadingPlan === plan.key || statusLoading}
              onClick={() => void startCheckout(plan.key)}
              className={cn(
                "mt-5 w-full rounded-xl py-2.5 text-sm font-semibold transition",
                plan.highlight
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "border border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:hover:bg-zinc-900",
                (!billingEnabled || loadingPlan === plan.key || statusLoading) && "opacity-60",
              )}
            >
              {loadingPlan === plan.key ? copy.openingCheckout : plan.cta}
            </button>
            <PricingLegalNotice variant="inline" className="mt-3" />
          </article>
        ))}
      </div>

      <PricingLegalNotice variant="panel" />

      <AuthEmailModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSent={() => {
          setAuthOpen(false);
          void refresh();
        }}
      />
    </section>
  );
}
