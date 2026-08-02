import type { DbSubscription, UserTier } from "@/types/billing";

export type { UserTier };

export const TRIAL_AUDIO_CREDIT_LIMIT = 2;

export const TRIAL_AUDIO_LIMIT_ERROR =
  "Trial audio limit reached (2/2). Upgrade to Pro for unlimited voice dictation.";

export function resolveUserTier(subscription: DbSubscription | null): UserTier {
  if (subscription?.plan_id === "monthly") return "pro_monthly";
  if (subscription?.plan_id === "yearly") return "pro_yearly";
  return "trial";
}

export function isProTier(tier: UserTier): boolean {
  return tier === "pro_monthly" || tier === "pro_yearly";
}

export function audioCreditsLimitForTier(tier: UserTier): number | null {
  return isProTier(tier) ? null : TRIAL_AUDIO_CREDIT_LIMIT;
}
