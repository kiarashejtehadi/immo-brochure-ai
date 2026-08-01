import type { BillingStatusResponse } from "@/types/billing";

/** True when remaining credits are trial-only (no purchased pack balance). */
export function isTrialOnlyCredits(
  remainingCredits: number,
  trialCredits: number,
): boolean {
  return remainingCredits <= trialCredits;
}

/** True when the user has a subscription or purchased credits (not trial-only). */
export function hasPurchasedBillingAccess(
  status: BillingStatusResponse | null | undefined,
): boolean {
  if (!status?.billingEnabled || !status.email) return false;
  if (status.hasActiveSubscription) return true;
  return !isTrialOnlyCredits(status.remainingCredits ?? 0, status.trialCredits ?? 0);
}

/** Pay-per-use credit pack without an active Pro subscription. */
export function isCreditPackPlan(
  status: BillingStatusResponse | null | undefined,
): boolean {
  if (!status?.billingEnabled || !status.email) return false;
  if (status.hasActiveSubscription) return false;
  return hasPurchasedBillingAccess(status);
}

/** Active Monthly or Yearly Pro subscription — watermark-free branded video reels. */
export function hasProReelAccess(
  status: BillingStatusResponse | null | undefined,
): boolean {
  if (status && status.billingEnabled === false) return true;
  if (!status?.billingEnabled || !status.email) return false;
  if (!status.hasActiveSubscription || !status.isPro) return false;
  return status.planId === "monthly" || status.planId === "yearly";
}
