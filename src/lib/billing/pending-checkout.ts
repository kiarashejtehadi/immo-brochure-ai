import type { BillingPlanKey } from "@/types/billing";

export const PENDING_CHECKOUT_PLAN_KEY = "immo_pending_checkout_plan";

const VALID_PLANS: BillingPlanKey[] = ["credits_pack", "monthly", "yearly"];

export function isBillingPlanKey(value: string | null | undefined): value is BillingPlanKey {
  return Boolean(value && VALID_PLANS.includes(value as BillingPlanKey));
}

export function savePendingCheckoutPlan(plan: BillingPlanKey): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_CHECKOUT_PLAN_KEY, plan);
}

export function consumePendingCheckoutPlan(): BillingPlanKey | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(PENDING_CHECKOUT_PLAN_KEY);
  localStorage.removeItem(PENDING_CHECKOUT_PLAN_KEY);
  return isBillingPlanKey(stored) ? stored : null;
}

export function checkoutPathWithPlan(locale: string, plan: BillingPlanKey): string {
  return `/${locale}/checkout?plan=${plan}`;
}
