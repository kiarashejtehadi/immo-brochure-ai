"use client";

import { Check } from "lucide-react";
import type { MarketingCopy } from "@/lib/i18n-marketing";
import { scrollToListingForm } from "@/lib/i18n-marketing";
import { btnPrimary } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

function TrustBadge({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/90 px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur",
        "dark:border-emerald-900/50 dark:bg-zinc-900/80 dark:text-zinc-200",
      )}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
        <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.5} aria-hidden />
      </span>
      {label}
    </span>
  );
}

export function HeroSection({ copy }: { copy: MarketingCopy }) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-blue-100/80 px-6 py-10 shadow-sm sm:px-10 sm:py-14",
        "bg-gradient-to-b from-blue-50/70 via-white to-transparent",
        "dark:border-indigo-950/60 dark:from-indigo-950/40 dark:via-zinc-950 dark:to-transparent",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/30 via-transparent to-transparent dark:from-indigo-900/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-indigo-600/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl dark:bg-blue-900/20"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <p
          className={cn(
            "animate-fade-in-up mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-800",
            "dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-200",
          )}
        >
          {copy.heroPillTag}
        </p>

        <h1
          className={cn(
            "animate-fade-in-up animate-fade-in-up-delay-1 text-balance text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.65rem] lg:leading-tight dark:text-zinc-50",
          )}
        >
          {copy.heroHeadline}
        </h1>
        <p
          className={cn(
            "animate-fade-in-up animate-fade-in-up-delay-2 mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400",
          )}
        >
          {copy.heroSubheadline}
        </p>

        <div className="animate-fade-in-up animate-fade-in-up-delay-3 mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={scrollToListingForm}
            className={cn(btnPrimary, "animate-pulse-glow px-8")}
          >
            {copy.heroCta}
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <TrustBadge label={copy.heroBadgePdf} />
            <TrustBadge label={copy.heroBadgeBranding} />
            <TrustBadge label={copy.heroBadgeLanguages} />
            <TrustBadge label={copy.heroBadgeVision} />
            <TrustBadge label={copy.heroBadgeVideoReels} />
          </div>
        </div>
      </div>
    </section>
  );
}
