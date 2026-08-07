"use client";

import { cn } from "@/lib/utils";

export type FormStepperStep = {
  id: number;
  label: string;
  shortLabel?: string;
};

export function FormStepper({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: FormStepperStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}) {
  return (
    <nav aria-label="Form progress" className="w-full">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className={cn("flex min-w-0 flex-1 items-center", isLast && "flex-none")}>
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={!onStepClick || step.id > currentStep}
                className={cn(
                  "group flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center transition",
                  onStepClick && step.id <= currentStep
                    ? "cursor-pointer"
                    : "cursor-default",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
                    isCurrent &&
                      "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:bg-indigo-500 dark:ring-indigo-950/60",
                    isComplete &&
                      "bg-emerald-600 text-white dark:bg-emerald-500",
                    !isCurrent &&
                      !isComplete &&
                      "border-2 border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
                  )}
                >
                  {isComplete ? "✓" : step.id}
                </span>
                <span
                  className={cn(
                    "hidden w-full truncate text-[11px] font-medium leading-tight sm:block sm:text-xs",
                    isCurrent
                      ? "text-indigo-700 dark:text-indigo-300"
                      : isComplete
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-zinc-500 dark:text-zinc-400",
                  )}
                >
                  {step.label}
                </span>
                <span
                  className={cn(
                    "w-full truncate text-[10px] font-medium leading-tight sm:hidden",
                    isCurrent ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-500",
                  )}
                >
                  {step.shortLabel ?? step.label}
                </span>
              </button>
              {!isLast ? (
                <div
                  aria-hidden
                  className={cn(
                    "mx-1 hidden h-0.5 flex-1 rounded-full sm:block sm:min-w-[1.5rem]",
                    isComplete ? "bg-emerald-400 dark:bg-emerald-600" : "bg-zinc-200 dark:bg-zinc-700",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function FormStepPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FormStepNav({
  onBack,
  onNext,
  backLabel,
  nextLabel,
  showBack,
  showNext,
  nextDisabled,
  backDisabled,
}: {
  onBack?: () => void;
  onNext?: () => void;
  backLabel: string;
  nextLabel: string;
  showBack: boolean;
  showNext: boolean;
  nextDisabled?: boolean;
  backDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          {backLabel}
        </button>
      ) : (
        <span className="hidden sm:block" />
      )}
      {showNext ? (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          {nextLabel}
        </button>
      ) : null}
    </div>
  );
}
