"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function inputClassName() {
  return "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950";
}

export function labelClassName() {
  return "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
}

export function FormAccordionCard({
  step,
  title,
  description,
  isOpen,
  onToggle,
  children,
  className,
}: {
  step: number;
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const headingId = `form-step-${step}-heading`;

  return (
    <section
      className={cn(
        "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80",
        isOpen ? "p-5" : "px-5 py-3",
        className,
      )}
    >
      <button
        type="button"
        id={headingId}
        aria-expanded={isOpen}
        aria-controls={`form-step-${step}-panel`}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {step}. {title}
          </span>
          {description && !isOpen ? (
            <span className="mt-0.5 block truncate text-xs text-zinc-500 dark:text-zinc-400">
              {description}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {isOpen ? (
        <div
          id={`form-step-${step}-panel`}
          role="region"
          aria-labelledby={headingId}
          className="mt-4 space-y-4 border-t border-indigo-100/80 pt-4 dark:border-indigo-950/60"
        >
          {description ? (
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          ) : null}
          {children}
        </div>
      ) : null}
    </section>
  );
}

export function FormGrid({
  children,
  cols = 2,
}: {
  children: React.ReactNode;
  cols?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      {children}
    </div>
  );
}
