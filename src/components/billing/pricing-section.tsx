"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BillingPlanKey } from "@/types/billing";
import { creditsPerPack } from "@/lib/billing/config";
import { AuthEmailModal } from "@/components/billing/auth-email-modal";
import { useBillingStatus } from "@/hooks/use-billing-status";
import {
  hasBrowserAuthSession,
  refreshBrowserAuthSession,
} from "@/lib/supabase/client-session";
import { readJsonResponse } from "@/lib/http/read-json-response";
import { cn } from "@/lib/utils";

type PlanCard = {
  key: BillingPlanKey;
  title: string;
  price: string;
  description: string;
  cta: string;
  highlight?: boolean;
};

const PLANS: PlanCard[] = [
  {
    key: "credits_pack",
    title: "Pay-per-use",
    price: "Credit pack",
    description: `${creditsPerPack()} AI exposé generations — no subscription.`,
    cta: "Buy credits",
  },
  {
    key: "monthly",
    title: "Monthly",
    price: "Unlimited / high volume",
    description: "Best for active agents with steady listing volume.",
    cta: "Subscribe monthly",
    highlight: true,
  },
  {
    key: "yearly",
    title: "Yearly",
    price: "Discounted annual",
    description: "Same benefits as monthly, billed once per year.",
    cta: "Subscribe yearly",
  },
];

async function postCheckout(plan: BillingPlanKey, locale: string) {
  return fetch("/api/checkout/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ plan, locale }),
  });
}

export function PricingSection({
  locale,
  billingEnabled,
}: {
  locale: string;
  billingEnabled: boolean;
}) {
  const router = useRouter();
  const { status, loading: statusLoading, refresh, isSignedIn } = useBillingStatus();
  const [loadingPlan, setLoadingPlan] = useState<BillingPlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  async function startCheckout(plan: BillingPlanKey) {
    if (!billingEnabled) {
      setError("Billing is not configured on this server.");
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
        throw new Error(data.error ?? "Checkout failed.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pricing
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Choose credits for occasional use or subscribe for unlimited/high-volume generation.
        </p>
        {isSignedIn && status?.email ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as <span className="font-medium text-zinc-800 dark:text-zinc-200">{status.email}</span>
            {" — "}
            purchases apply to this account.
          </p>
        ) : !statusLoading && billingEnabled ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in when prompted, or use the account menu above.
          </p>
        ) : null}
      </div>

      {!billingEnabled ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Set <code className="text-xs">BILLING_ENABLED=true</code> with Supabase and Lemon Squeezy keys to
          enable checkout.
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            key={plan.key}
            className={cn(
              "flex flex-col rounded-2xl border p-5 shadow-sm",
              plan.highlight
                ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/60"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
            )}
          >
            <h3 className="text-lg font-semibold">{plan.title}</h3>
            <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{plan.price}</p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {plan.description}
            </p>
            <button
              type="button"
              disabled={!billingEnabled || loadingPlan === plan.key || statusLoading}
              onClick={() => void startCheckout(plan.key)}
              className={cn(
                "mt-5 w-full rounded-xl py-2.5 text-sm font-semibold transition",
                plan.highlight
                  ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950",
                (!billingEnabled || loadingPlan === plan.key || statusLoading) && "opacity-60",
              )}
            >
              {loadingPlan === plan.key ? "Redirecting…" : plan.cta}
            </button>
          </article>
        ))}
      </div>

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
