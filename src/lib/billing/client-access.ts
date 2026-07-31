import type { BillingStatusResponse } from "@/types/billing";

/** True when the user has a subscription or purchased credits (not trial-only). */
export function hasPurchasedBillingAccess(
  status: BillingStatusResponse | null | undefined,
): boolean {
  if (!status?.billingEnabled || !status.email) return false;
  if (status.hasActiveSubscription) return true;
  return (status.remainingCredits ?? 0) > (status.trialCredits ?? 0);
}
