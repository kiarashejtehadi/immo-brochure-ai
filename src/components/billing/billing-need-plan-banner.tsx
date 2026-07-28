"use client";

import { Link } from "@/i18n/navigation";
import { useBillingStatus } from "@/hooks/use-billing-status";

export function BillingNeedPlanBanner() {
  const { status } = useBillingStatus();

  if (!status?.billingEnabled || !status.email) return null;

  const hasAccess =
    status.hasActiveSubscription || (status.remainingCredits ?? 0) > 0;
  if (hasAccess) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-4">
      <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950/40">
        <p className="text-sm text-amber-950 dark:text-amber-100">
          Signed in as <span className="font-medium">{status.email}</span> — choose a
          subscription or credit pack to generate exposés.
        </p>
        <Link
          href="/checkout"
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          View plans & pricing
        </Link>
      </div>
    </div>
  );
}
