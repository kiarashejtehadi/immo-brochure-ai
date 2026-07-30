"use client";

import { Check, X } from "lucide-react";
import type { MarketingCopy } from "@/lib/i18n-marketing";
import { cn } from "@/lib/utils";

function ComparisonList({
  items,
  variant,
}: {
  items: readonly string[];
  variant: "negative" | "positive";
}) {
  const Icon = variant === "negative" ? X : Check;
  const iconClass =
    variant === "negative"
      ? "text-red-400 dark:text-red-400"
      : "text-emerald-500 dark:text-emerald-400";
  const rowClass =
    variant === "negative"
      ? "border-zinc-200/80 dark:border-zinc-700/80"
      : "border-blue-100/80 dark:border-indigo-900/50";

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex gap-3 rounded-lg border bg-white/50 px-3 py-2.5 text-sm leading-snug dark:bg-zinc-950/30",
            rowClass,
            variant === "negative"
              ? "text-zinc-600 dark:text-zinc-400"
              : "text-zinc-800 dark:text-zinc-200",
          )}
        >
          <Icon
            className={cn("mt-0.5 h-4 w-4 shrink-0", iconClass)}
            strokeWidth={2.5}
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ComparisonSection({ copy }: { copy: MarketingCopy }) {
  return (
    <section
      className="animate-fade-in-up mt-10 sm:mt-12"
      aria-labelledby="comparison-title"
    >
      <div className="mb-6 text-center sm:mb-8">
        <h2
          id="comparison-title"
          className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50"
        >
          {copy.comparisonTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
          {copy.comparisonSubtitle}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        {/* Generic AI column */}
        <article
          className={cn(
            "rounded-2xl border border-zinc-200 bg-zinc-100/80 p-5 shadow-sm sm:p-6",
            "dark:border-zinc-800 dark:bg-zinc-900/60",
          )}
        >
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {copy.comparisonGenericTitle}
          </h3>
          <ComparisonList items={copy.comparisonGenericItems} variant="negative" />
        </article>

        {/* ImmoCaption AI column — highlighted */}
        <article
          className={cn(
            "relative rounded-2xl border-2 border-blue-500 bg-white p-5 shadow-xl ring-4 ring-blue-500/10 sm:p-6",
            "dark:border-indigo-500 dark:bg-zinc-900 dark:ring-indigo-500/15",
          )}
        >
          <span
            className={cn(
              "absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800 shadow-sm",
              "dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
            )}
          >
            {copy.comparisonImmoBadge}
          </span>

          <h3 className="mb-4 pt-2 text-center text-base font-bold text-zinc-900 dark:text-zinc-50">
            {copy.comparisonImmoTitle}
          </h3>
          <ComparisonList items={copy.comparisonImmoItems} variant="positive" />
        </article>
      </div>
    </section>
  );
}
