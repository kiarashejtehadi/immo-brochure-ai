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

export function getPlanCardDefinitions(): PlanCardDefinition[] {
  const packSize = creditsPerPack();
  const prices = getPlanDisplayPrices();

  return [
    {
      key: "credits_pack",
      title: "Credit Pack",
      priceLabel: `${prices.creditsPack} / ${packSize} Credits`,
      features: [
        { text: `${packSize} High-res PDF Exports`, included: true },
        { text: "Watermark-Free PDF Exports (Watermark removed)", included: true },
        { text: "AI Exposé Copy & Social Captions", included: true },
        {
          text: "Custom Logo & Agency Branding (Pro Subscriptions Only)",
          included: false,
        },
      ],
      cta: "Buy credits",
    },
    {
      key: "monthly",
      title: "Monthly Subscription",
      priceLabel: `${prices.monthly} / month`,
      badge: "Popular for Agents",
      highlight: true,
      features: [
        { text: "Unlimited / High-volume Generations", included: true },
        { text: "Full Custom Agency Logo & Brand Colors", included: true },
        { text: "Watermark-Free PDF Exports", included: true },
        { text: "Priority AI Generation Speed", included: true },
      ],
      cta: "Subscribe monthly",
    },
    {
      key: "yearly",
      title: "Yearly Subscription",
      priceLabel: `${prices.yearly} / year (Save ~23%)`,
      badge: "Best Value",
      features: [
        { text: "Unlimited / High-volume Generations", included: true },
        { text: "Full Custom Agency Logo & Brand Colors", included: true },
        { text: "Watermark-Free PDF Exports", included: true },
        { text: "Priority AI Generation Speed", included: true },
        { text: "Discounted Annual Rate (€10/mo equivalent)", included: true },
      ],
      cta: "Subscribe yearly",
    },
  ];
}
