"use client";

import type { LucideIcon } from "lucide-react";
import { FileDown, FileEdit, Sparkles } from "lucide-react";
import type { MarketingCopy } from "@/lib/i18n-marketing";
import { cn } from "@/lib/utils";

const STEPS: {
  key: string;
  Icon: LucideIcon;
  titleKey: keyof MarketingCopy;
  descKey: keyof MarketingCopy;
  iconWrap: string;
  delayClass: string;
}[] = [
  {
    key: "step1",
    Icon: FileEdit,
    titleKey: "step1Title",
    descKey: "step1Description",
    iconWrap: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
    delayClass: "animate-fade-in-up-delay-2",
  },
  {
    key: "step2",
    Icon: Sparkles,
    titleKey: "step2Title",
    descKey: "step2Description",
    iconWrap: "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
    delayClass: "animate-fade-in-up-delay-3",
  },
  {
    key: "step3",
    Icon: FileDown,
    titleKey: "step3Title",
    descKey: "step3Description",
    iconWrap: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    delayClass: "animate-fade-in-up-delay-4",
  },
];

export function HowItWorks({ copy }: { copy: MarketingCopy }) {
  return (
    <section className="mt-8 sm:mt-10" aria-labelledby="how-it-works-title">
      <div className="animate-fade-in-up animate-fade-in-up-delay-1 mb-6 text-center sm:mb-8">
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
        {STEPS.map(({ key, Icon, titleKey, descKey, iconWrap, delayClass }, index) => (
          <li
            key={key}
            className={cn(
              "animate-fade-in-up relative flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm",
              "transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg",
              "dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-indigo-800",
              delayClass,
            )}
          >
            {index < STEPS.length - 1 ? (
              <span
                className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-5 translate-x-full bg-gradient-to-r from-blue-200 to-transparent sm:block dark:from-indigo-800"
                aria-hidden
              />
            ) : null}
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                iconWrap,
              )}
            >
              <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>
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
