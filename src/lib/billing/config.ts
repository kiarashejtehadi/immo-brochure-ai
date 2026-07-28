import type { BillingPlanKey } from "@/types/billing";
import { isBillingEnvComplete } from "@/lib/supabase/env";

export function isBillingEnabled(): boolean {
  return isBillingEnvComplete();
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function checkoutSuccessUrl(locale: string): string {
  const loc = locale.trim() || "en";
  return `${getAppUrl()}/${loc}/checkout?checkout=success`;
}

export function checkoutCancelUrl(locale: string): string {
  const loc = locale.trim() || "en";
  return `${getAppUrl()}/${loc}/checkout?checkout=canceled`;
}

export function billingPortalReturnUrl(locale: string): string {
  const loc = locale.trim() || "en";
  return `${getAppUrl()}/${loc}`;
}

export function getLemonSqueezyWebhookSecret(): string | undefined {
  return process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim();
}

export function getLemonSqueezyStoreId(): string {
  const id = process.env.LEMONSQUEEZY_STORE_ID?.trim();
  if (!id) throw new Error("LEMONSQUEEZY_STORE_ID is not configured.");
  return id;
}

export function isLemonSqueezyConfigured(): boolean {
  return Boolean(
    process.env.LEMONSQUEEZY_API_KEY?.trim() &&
      process.env.LEMONSQUEEZY_STORE_ID?.trim(),
  );
}

export function creditsPerPack(): number {
  const raw =
    process.env.LEMONSQUEEZY_CREDITS_PACK_SIZE ??
    process.env.STRIPE_CREDITS_PACK_SIZE ??
    "5";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 5;
}

export type PlanConfig = {
  key: BillingPlanKey;
  variantId: string;
  mode: "payment" | "subscription";
  creditsToGrant?: number;
};

export function getPlanConfig(plan: BillingPlanKey): PlanConfig | null {
  const map: Record<BillingPlanKey, string | undefined> = {
    credits_pack: process.env.LEMONSQUEEZY_VARIANT_CREDITS_PACK,
    monthly: process.env.LEMONSQUEEZY_VARIANT_MONTHLY,
    yearly: process.env.LEMONSQUEEZY_VARIANT_YEARLY,
  };
  const variantId = map[plan]?.trim();
  if (!variantId || !/^\d+$/.test(variantId)) return null;

  if (plan === "credits_pack") {
    return {
      key: plan,
      variantId,
      mode: "payment",
      creditsToGrant: creditsPerPack(),
    };
  }
  return {
    key: plan,
    variantId,
    mode: "subscription",
  };
}

export function planDisplayName(planId: string | null): string {
  switch (planId) {
    case "credits_pack":
      return "Credit pack";
    case "monthly":
      return "Monthly plan";
    case "yearly":
      return "Yearly plan";
    default:
      return planId ?? "Free";
  }
}
