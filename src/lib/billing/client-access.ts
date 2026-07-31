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
