import type { BillingStatusResponse } from "@/types/billing";
import { hasCreditPackEntitlements, isTrialOnlyCredits } from "@/lib/billing/tier";

export { isTrialOnlyCredits, hasCreditPackEntitlements } from "@/lib/billing/tier";

/** True when the user has a subscription or purchased credits (not trial-only). */
export function hasPurchasedBillingAccess(
  status: BillingStatusResponse | null | undefined,
): boolean {
  if (!status?.billingEnabled || !status.email) return false;
  if (status.hasActiveSubscription) return true;
  return hasCreditPackEntitlements(
    status.remainingCredits ?? 0,
    status.trialCredits ?? 0,
    status.creditsTotal ?? 0,
  );
}

/** Pay-per-use credit pack without an active Pro subscription. */
export function isCreditPackPlan(
  status: BillingStatusResponse | null | undefined,
): boolean {
  if (!status?.billingEnabled || !status.email) return false;
  if (status.hasActiveSubscription) return false;
  return hasPurchasedBillingAccess(status);
}

/** Watermark-free video reel export (Pro subscription or credit pack purchase). */
export function hasProReelAccess(
  status: BillingStatusResponse | null | undefined,
): boolean {
  if (status && status.billingEnabled === false) return true;
  if (!status?.billingEnabled || !status.email) return false;
  if (
    status.hasActiveSubscription &&
    status.isPro &&
    (status.planId === "monthly" || status.planId === "yearly")
  ) {
    return true;
  }
  return hasCreditPackEntitlements(
    status.remainingCredits ?? 0,
    status.trialCredits ?? 0,
    status.creditsTotal ?? 0,
  );
}
