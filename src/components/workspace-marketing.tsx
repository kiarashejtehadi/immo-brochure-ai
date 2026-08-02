"use client";

import { HeroSection } from "@/components/hero-section";
import { HowItWorks } from "@/components/how-it-works";
import { ComparisonSection } from "@/components/comparison-section";
import { PricingSection } from "@/components/billing/pricing-section";
import type { MarketingCopy } from "@/lib/i18n-marketing";
import { getBillingCopy } from "@/lib/i18n-billing";
import type { UiLocale } from "@/lib/i18n";

/** Marketing blocks for visitors only — signed-in users land directly on the workspace. */
export function WorkspaceMarketing({
  copy,
  isSignedIn,
  visible,
  locale,
  billingEnabled,
  onSeeSample,
}: {
  copy: MarketingCopy;
  isSignedIn: boolean;
  visible: boolean;
  locale: UiLocale;
  billingEnabled: boolean;
  onSeeSample?: () => void;
}) {
  if (!visible || isSignedIn) return null;

  const billingCopy = getBillingCopy(locale);

  return (
    <div className="mx-auto max-w-6xl px-6 pt-8">
      <HeroSection copy={copy} />
      <HowItWorks copy={copy} onSeeSample={onSeeSample} />
      <ComparisonSection copy={copy} />
      <section
        id="pricing"
        className="scroll-mt-24 pt-10 sm:pt-12"
        aria-labelledby="landing-pricing-title"
      >
        <div className="mb-6 text-center">
          <h2
            id="landing-pricing-title"
            className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50"
          >
            {billingCopy.pricingTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
            {billingCopy.pricingSubtitle}
          </p>
        </div>
        <PricingSection
          locale={locale}
          billingEnabled={billingEnabled}
          compact
        />
      </section>
    </div>
  );
}
