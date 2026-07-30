"use client";

import type { ReactNode } from "react";
import type { MarketingCopy } from "@/lib/i18n-marketing";
import { scrollToListingForm } from "@/lib/i18n-marketing";
import { cn } from "@/lib/utils";

function Badge({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/80 px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur",
        "dark:border-zinc-700/80 dark:bg-zinc-900/70 dark:text-zinc-200",
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
        {icon}
      </span>
      {label}
    </span>
  );
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.5 0-8 3-8 7a6 6 0 0 0 6 6c.8 0 1.5-.2 2.1-.5.6-.3 1.2-.5 1.9-.5 2.2 0 4 1.8 4 4h1a9 9 0 0 0 0-18c-3.3 0-6.2 1.5-8 4z" />
      <circle cx="8.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M3 12h18M12 3c2.5 2.8 4 6.2 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6.2-4 9s1.5 6.2 4 9" />
    </svg>
  );
}

export function HeroSection({ copy }: { copy: MarketingCopy }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white via-zinc-50 to-violet-50/40 px-6 py-10 shadow-sm sm:px-10 sm:py-14 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-violet-950/20">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-900/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-zinc-200/40 blur-3xl dark:bg-zinc-800/30"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="mb-3 inline-flex items-center rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/50 dark:text-violet-200">
          Immo Brochure AI
        </p>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.65rem] lg:leading-tight dark:text-zinc-50">
          {copy.heroHeadline}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
          {copy.heroSubheadline}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={scrollToListingForm}
            className="rounded-xl bg-zinc-900 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-800 hover:shadow-lg dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {copy.heroCta}
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Badge icon={<ZapIcon />} label={copy.heroBadgePdf} />
            <Badge icon={<PaletteIcon />} label={copy.heroBadgeBranding} />
            <Badge icon={<GlobeIcon />} label={copy.heroBadgeLanguages} />
          </div>
        </div>
      </div>
    </section>
  );
}
