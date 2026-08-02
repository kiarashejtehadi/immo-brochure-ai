import type { UiLocale } from "@/lib/i18n";
import { getBillingCopy, interpolate } from "@/lib/i18n-billing";
import type { BillingPlanKey } from "@/types/billing";
import { creditsPerPack, getPlanDisplayPrices } from "@/lib/billing/config";

export type PlanFeature = {
  text: string;
  included: boolean;
};

export type PlanCardDefinition = {
  key: BillingPlanKey;
  title: string;
  priceLabel: string;
  badge?: string;
  features: PlanFeature[];
  cta: string;
  highlight?: boolean;
};

export function getFreeTrialCardDefinition(locale: UiLocale): PlanCardDefinition {
  const copy = getBillingCopy(locale);
  return {
    key: "credits_pack",
    title: copy.freeTrialCardTitle,
    priceLabel: copy.freeTrialPriceLabel,
    features: [
      { text: copy.freeTrialFeaturePdfCredits, included: true },
      { text: copy.featureAudioDictationTrial, included: true },
      { text: copy.featureGeocodedLocation, included: true },
    ],
    cta: copy.freeTrialCta,
  };
}

export function getPlanCardDefinitions(locale: UiLocale): PlanCardDefinition[] {
  const copy = getBillingCopy(locale);
  const packSize = creditsPerPack();
  const prices = getPlanDisplayPrices();

  return [
    {
      key: "credits_pack",
      title: copy.creditPackTitle,
      priceLabel: `${prices.creditsPack}${interpolate(copy.perCredits, { count: packSize })}`,
      features: [
        {
          text: interpolate(copy.featureHighResExports, { count: packSize }),
          included: true,
        },
        { text: copy.featureWatermarkFree, included: true },
        { text: copy.featureAiCopy, included: true },
        { text: copy.featureGeocodedLocation, included: true },
        { text: copy.featureCustomBrandingExcluded, included: false },
        { text: copy.featureVideoReelsDemo, included: true },
      ],
      cta: copy.ctaBuyCredits,
    },
    {
      key: "monthly",
      title: copy.monthlyTitle,
      priceLabel: `${prices.monthly}${copy.perMonth}`,
      badge: copy.badgePopular,
      highlight: true,
      features: [
        { text: copy.featureUnlimitedGenerations, included: true },
        { text: copy.featureUnlimitedVoice, included: true },
        { text: copy.featureAutomatedLocationPoi, included: true },
        { text: copy.featureFullBranding, included: true },
        { text: copy.featureWatermarkFree, included: true },
        { text: copy.featureAiVision, included: true },
        { text: copy.featureVideoReelsPro, included: true },
        { text: copy.featurePrioritySpeed, included: true },
      ],
      cta: copy.ctaSubscribeMonthly,
    },
    {
      key: "yearly",
      title: copy.yearlyTitle,
      priceLabel: `${prices.yearly}${copy.perYearSave}`,
      badge: copy.badgeBestValue,
      features: [
        { text: copy.featureUnlimitedGenerations, included: true },
        { text: copy.featureUnlimitedVoice, included: true },
        { text: copy.featureAutomatedLocationPoi, included: true },
        { text: copy.featureFullBranding, included: true },
        { text: copy.featureWatermarkFree, included: true },
        { text: copy.featureAiVision, included: true },
        { text: copy.featureVideoReelsPro, included: true },
        { text: copy.featurePrioritySpeed, included: true },
        { text: copy.featureAnnualDiscount, included: true },
      ],
      cta: copy.ctaSubscribeYearly,
    },
  ];
}
