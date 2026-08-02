import { isBillingEnabled } from "@/lib/billing/config";
import {
  getActiveSubscription,
  getAudioCreditsUsed,
  incrementAudioCreditsUsed,
  upsertUserFromAuth,
} from "@/lib/billing/repository";
import { getSessionUser } from "@/lib/billing/access";
import {
  TRIAL_AUDIO_CREDIT_LIMIT,
  TRIAL_AUDIO_LIMIT_ERROR,
  isProTier,
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

  const audioCreditsUsed = await getAudioCreditsUsed(authUser.id);
  if (audioCreditsUsed >= TRIAL_AUDIO_CREDIT_LIMIT) {
    return {
      ok: false,
      status: 403,
      error: TRIAL_AUDIO_LIMIT_ERROR,
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
