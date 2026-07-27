"use client";

import { useState } from "react";
import type { BillingPlanKey } from "@/types/billing";
import { creditsPerPack } from "@/lib/billing/config";
import { AuthEmailModal } from "@/components/billing/auth-email-modal";
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

export function PricingSection({
  locale,
  billingEnabled,
  isSignedIn,
}: {
  locale: string;
  billingEnabled: boolean;
  isSignedIn: boolean;
}) {
  const [loadingPlan, setLoadingPlan] = useState<BillingPlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  async function startCheckout(plan: BillingPlanKey) {
    if (!billingEnabled) {
      setError("Billing is not configured on this server.");
      return;
    }
    if (!isSignedIn) {
      setAuthOpen(true);
      return;
    }

    setLoadingPlan(plan);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, locale }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
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
              disabled={!billingEnabled || loadingPlan === plan.key}
              onClick={() => void startCheckout(plan.key)}
              className={cn(
                "mt-5 w-full rounded-xl py-2.5 text-sm font-semibold transition",
                plan.highlight
                  ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950",
                (!billingEnabled || loadingPlan === plan.key) && "opacity-60",
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
        onSent={() => setAuthOpen(false)}
      />
    </section>
  );
}
