import type { DbSubscription, UserTier } from "@/types/billing";
import { creditsPerPack } from "@/lib/billing/config";

export type { UserTier };

/** Free PDF credits granted on signup (also used as voice parse cap for trial-only users). */
export const TRIAL_SIGNUP_PDF_CREDITS = 2;

export const TRIAL_AUDIO_CREDIT_LIMIT = TRIAL_SIGNUP_PDF_CREDITS;

export const TRIAL_AUDIO_LIMIT_ERROR =
  "Trial audio limit reached (2/2). Upgrade to Pro for unlimited voice dictation.";

export function creditPackAudioLimitError(used: number, limit: number): string {
  return `Voice dictation limit reached (${used}/${limit}). Upgrade to Pro for unlimited voice dictation.`;
}

/** True when remaining credits are trial-only (no purchased pack balance). */
export function isTrialOnlyCredits(
  remainingCredits: number,
  trialCredits: number,
): boolean {
  return remainingCredits <= trialCredits;
}

/** User bought a credit pack (or otherwise has paid PDF credits beyond the free trial). */
export function hasCreditPackEntitlements(
  remainingCredits: number,
  trialCredits: number,
  creditsTotal: number,
): boolean {
  if (creditsTotal > TRIAL_SIGNUP_PDF_CREDITS) return true;
  return remainingCredits > trialCredits;
}

export function resolveUserTier(subscription: DbSubscription | null): UserTier {
  if (subscription?.plan_id === "monthly") return "pro_monthly";
  if (subscription?.plan_id === "yearly") return "pro_yearly";
  return "trial";
}

export function isProTier(tier: UserTier): boolean {
  return tier === "pro_monthly" || tier === "pro_yearly";
}

/** @deprecated Prefer resolveAudioCreditsLimit with billing snapshot. */
export function audioCreditsLimitForTier(tier: UserTier): number | null {
  return isProTier(tier) ? null : TRIAL_AUDIO_CREDIT_LIMIT;
}

export function resolveAudioCreditsLimit(params: {
  tier: UserTier;
  remainingCredits: number;
  trialCredits: number;
  creditsTotal: number;
}): number | null {
  if (isProTier(params.tier)) return null;
  if (
    hasCreditPackEntitlements(
      params.remainingCredits,
      params.trialCredits,
      params.creditsTotal,
    )
  ) {
    return creditsPerPack();
  }
  return TRIAL_AUDIO_CREDIT_LIMIT;
}
