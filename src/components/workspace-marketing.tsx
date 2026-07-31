"use client";

import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { ComparisonSection } from "@/components/comparison-section";
import type { MarketingCopy } from "@/lib/i18n-marketing";

/** Marketing blocks for visitors only — signed-in users land directly on the workspace. */
export function WorkspaceMarketing({
  copy,
  isSignedIn,
  visible,
}: {
  copy: MarketingCopy;
  isSignedIn: boolean;
  visible: boolean;
}) {
  if (!visible || isSignedIn) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-8">
      <HeroSection copy={copy} />
      <HowItWorks copy={copy} />
      <ComparisonSection copy={copy} />
    </div>
  );
}
