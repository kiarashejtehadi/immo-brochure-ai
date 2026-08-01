"use client";

import type { BillingStatusResponse } from "@/types/billing";
import type { UiLocale } from "@/lib/i18n";
import { getBillingCopy, interpolate } from "@/lib/i18n-billing";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

export function shouldShowCreditPackUsage(status: BillingStatusResponse | null): boolean {
  if (!status?.billingEnabled || status.hasActiveSubscription) return false;
  return (status.remainingCredits ?? 0) > 0 || (status.creditsUsed ?? 0) > 0;
}

type Variant = "compact" | "panel";

export function CreditPackUsage({
  status,
  variant = "compact",
  locale: localeProp,
  className,
}: {
  status: BillingStatusResponse | null;
  variant?: Variant;
  locale?: UiLocale;
  className?: string;
}) {
  const routeLocale = useLocale() as UiLocale;
  const locale = localeProp ?? routeLocale;
  const copy = getBillingCopy(locale);

  if (!shouldShowCreditPackUsage(status)) return null;

  const used = status!.creditsUsed ?? 0;
  const remaining = status!.remainingCredits ?? 0;
  const total = status!.creditsTotal ?? used + remaining;
  const consumedPct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  if (variant === "compact") {
    const trialSuffix =
      status!.trialCredits > 0
        ? ` ${interpolate(copy.creditPackTrialSuffix, { count: status!.trialCredits })}`
        : "";
    return (
      <span
        className={cn(
          "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100",
          className,
        )}
        title={interpolate(copy.creditPackUsedOf, { used, remaining })}
      >
        {interpolate(copy.creditPackCompact, { used, remaining })}
        {trialSuffix}
      </span>
    );
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30",
        className,
      )}
      aria-label={copy.creditPackPanelTitle}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-emerald-950 dark:text-emerald-50">
          {copy.creditPackPanelTitle}
        </h3>
        <p className="text-sm tabular-nums text-emerald-900 dark:text-emerald-100">
          {interpolate(copy.creditPackUsedOf, { used, remaining })}
          {total > 0 ? (
            <span className="text-emerald-800/80 dark:text-emerald-200/80">
              {" "}
              {interpolate(copy.creditPackOfTotal, { total })}
            </span>
          ) : null}
        </p>
      </div>
      {total > 0 ? (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-200/80 dark:bg-emerald-900">
          <div
            className="h-full rounded-full bg-emerald-600 transition-[width] dark:bg-emerald-400"
            style={{ width: `${consumedPct}%` }}
            role="progressbar"
            aria-valuenow={used}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={interpolate(copy.creditPackUsedOf, { used, remaining })}
          />
        </div>
      ) : null}
      <p className="mt-2 text-xs text-emerald-800 dark:text-emerald-200/90">{copy.creditPackHint}</p>
    </section>
  );
}
