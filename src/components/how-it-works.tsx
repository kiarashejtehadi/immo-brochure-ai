"use client";

import type { ReactNode } from "react";
import type { MarketingCopy } from "@/lib/i18n-marketing";
import { cn } from "@/lib/utils";

function StepIcon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l.8 2.5L8 18l-2.2.7L5 21l-.8-2.3L2 18l2.2-.7L5 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l.6 1.8L21 16l-1.4.4L19 18l-.6-1.6L17 16l1.4-.4L19 14z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" />
    </svg>
  );
}

const STEPS = [
  { key: "step1", Icon: FileTextIcon, titleKey: "step1Title", descKey: "step1Description" },
  { key: "step2", Icon: SparklesIcon, titleKey: "step2Title", descKey: "step2Description" },
  { key: "step3", Icon: DownloadIcon, titleKey: "step3Title", descKey: "step3Description" },
] as const;

export function HowItWorks({ copy }: { copy: MarketingCopy }) {
  return (
    <section className="mt-8 sm:mt-10" aria-labelledby="how-it-works-title">
      <div className="mb-6 text-center sm:mb-8">
        <h2
          id="how-it-works-title"
          className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50"
        >
          {copy.howItWorksTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
          {copy.howItWorksSubtitle}
        </p>
      </div>

      <ol className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {STEPS.map(({ key, Icon, titleKey, descKey }, index) => (
          <li
            key={key}
            className="relative flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-700"
          >
            {index < STEPS.length - 1 ? (
              <span
                className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-5 translate-x-full bg-gradient-to-r from-zinc-300 to-transparent sm:block dark:from-zinc-600"
                aria-hidden
              />
            ) : null}
            <StepIcon>
              <Icon />
            </StepIcon>
            <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {copy[titleKey]}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {copy[descKey]}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
