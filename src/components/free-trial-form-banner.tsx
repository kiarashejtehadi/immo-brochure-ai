"use client";

import { Sparkles } from "lucide-react";
import type { MarketingCopy } from "@/lib/i18n-marketing";
import { btnPrimary } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function FreeTrialFormBanner({
  copy,
  onSignUp,
}: {
  copy: Pick<MarketingCopy, "freeTrialBannerTitle" | "freeTrialBannerCta">;
  onSignUp: () => void;
}) {
  return (
    <div
      className={cn(
        "mb-5 overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-4 shadow-sm",
        "dark:border-indigo-900/60 dark:from-indigo-950/50 dark:via-zinc-950 dark:to-indigo-950/30",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
            {copy.freeTrialBannerTitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onSignUp}
          className={cn(btnPrimary, "w-full shrink-0 px-5 py-2.5 text-sm sm:w-auto")}
        >
          {copy.freeTrialBannerCta}
        </button>
      </div>
    </div>
  );
}
