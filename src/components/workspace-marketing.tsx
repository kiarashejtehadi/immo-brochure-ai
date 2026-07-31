"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { ComparisonSection } from "@/components/comparison-section";
import type { MarketingCopy } from "@/lib/i18n-marketing";
import { cn } from "@/lib/utils";

export function WorkspaceMarketing({
  copy,
  isSignedIn,
  visible,
}: {
  copy: MarketingCopy;
  isSignedIn: boolean;
  visible: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!visible) return null;

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <HeroSection copy={copy} />
        <HowItWorks copy={copy} />
        <ComparisonSection copy={copy} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pt-4">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        <span>Show product overview &amp; comparison</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-zinc-500 transition-transform", expanded && "rotate-180")}
          aria-hidden
        />
      </button>
      {expanded ? (
        <div className="mt-6 space-y-10">
          <HeroSection copy={copy} />
          <ComparisonSection copy={copy} />
        </div>
      ) : null}
    </div>
  );
}
