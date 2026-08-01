"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import type { UiLocale } from "@/lib/i18n";
import { getBillingCopy } from "@/lib/i18n-billing";
import { cn } from "@/lib/utils";

export function BrandingProGate({
  onUpgrade,
  className,
}: {
  onUpgrade: () => void;
  className?: string;
}) {
  const locale = useLocale() as UiLocale;
  const copy = getBillingCopy(locale);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:border-indigo-900 dark:from-indigo-950/50 dark:to-violet-950/30",
        className,
      )}
    >
      <div className="absolute right-4 top-4 rounded-full bg-indigo-600/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
        {copy.proFeatureBadge}
      </div>
      <p className="text-2xl" aria-hidden>
        🎨
      </p>
      <h3 className="mt-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">{copy.proGateTitle}</h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {copy.proGateBody}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onUpgrade}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          {copy.upgradeToPro}
        </button>
        <Link
          href="/pricing"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-white/80 dark:border-zinc-600 dark:hover:bg-zinc-900"
        >
          {copy.comparePlans}
        </Link>
      </div>
    </div>
  );
}
