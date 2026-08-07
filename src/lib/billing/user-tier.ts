import { isBillingEnabled } from "@/lib/billing/config";
import {
  getActiveSubscription,
  getAudioCreditsUsed,
  getCreditsUsedCount,
  getTrialCredits,
  getUserCredits,
  incrementAudioCreditsUsed,
  upsertUserFromAuth,
} from "@/lib/billing/repository";
import { getSessionUser } from "@/lib/billing/access";
import {
  TRIAL_AUDIO_LIMIT_ERROR,
  creditPackAudioLimitError,
  isProTier,
  resolveAudioCreditsLimit,
  resolveUserTier,
  type UserTier,
} from "@/lib/billing/tier";

export {
  TRIAL_AUDIO_CREDIT_LIMIT,
  TRIAL_AUDIO_LIMIT_ERROR,
  audioCreditsLimitForTier,
  isProTier,
  resolveUserTier,
  type UserTier,
} from "@/lib/billing/tier";

export type VoiceParseAccessResult =
  | {
      ok: true;
      userId: string;
      tier: UserTier;
      incrementAudioOnSuccess: boolean;
    }
  | {
      ok: false;
      status: 401 | 403;
      error: string;
      code: "unauthenticated" | "audio_limit_reached" | "billing_disabled";
    };

export async function assertVoiceParseAccess(): Promise<VoiceParseAccessResult> {
  if (!isBillingEnabled()) {
    return {
      ok: true,
      userId: "billing-disabled",
      tier: "pro_monthly",
      incrementAudioOnSuccess: false,
    };
  }

  const authUser = await getSessionUser();
  if (!authUser?.email) {
    return {
      ok: false,
      status: 401,
      error: "Sign in to use voice dictation.",
      code: "unauthenticated",
    };
  }

  await upsertUserFromAuth({ id: authUser.id, email: authUser.email });
  const subscription = await getActiveSubscription(authUser.id);
  const tier = resolveUserTier(subscription);

  if (isProTier(tier)) {
    return {
      ok: true,
      userId: authUser.id,
      tier,
      incrementAudioOnSuccess: false,
    };
  }

  const remainingCredits = await getUserCredits(authUser.id);
  const trialCredits = await getTrialCredits(authUser.id);
  const creditsUsed = await getCreditsUsedCount(authUser.id);
  const creditsTotal = remainingCredits + creditsUsed;
  const audioLimit = resolveAudioCreditsLimit({
    tier,
    remainingCredits,
    trialCredits,
    creditsTotal,
  });
  const audioCreditsUsed = await getAudioCreditsUsed(authUser.id);

  if (audioLimit !== null && audioCreditsUsed >= audioLimit) {
    const error =
      audioLimit > 2
        ? creditPackAudioLimitError(audioCreditsUsed, audioLimit)
        : TRIAL_AUDIO_LIMIT_ERROR;
    return {
      ok: false,
      status: 403,
      error,
      code: "audio_limit_reached",
    };
  }

  return {
    ok: true,
    userId: authUser.id,
    tier,
    incrementAudioOnSuccess: true,
  };
}

export async function recordSuccessfulVoiceParse(userId: string): Promise<void> {
  if (userId === "billing-disabled") return;
  await incrementAudioCreditsUsed(userId);
}
