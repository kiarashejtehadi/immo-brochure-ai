import { isBillingEnabled, planDisplayName } from "@/lib/billing/config";
import { getBillingEnvChecks } from "@/lib/supabase/env";
import {
  getActiveSubscription,
  getAudioCreditsUsed,
  getCreditsUsedCount,
  getTrialCredits,
  getUserCredits,
  upsertUserFromAuth,
} from "@/lib/billing/repository";
import {
  resolveUserTier,
  resolveAudioCreditsLimit,
} from "@/lib/billing/tier";
import { hasCreditPackEntitlements } from "@/lib/billing/client-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BillingAccess, BillingStatusResponse } from "@/types/billing";

/** Supabase auth user regardless of BILLING_ENABLED (for status UI / sign out). */
export async function getSupabaseAuthUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  if (!isBillingEnabled()) return null;
  return getSupabaseAuthUser();
}

export async function resolveBillingAccess(): Promise<BillingAccess> {
  if (!isBillingEnabled()) {
    return {
      allowed: true,
      hasActiveSubscription: false,
      remainingCredits: 0,
      reason: "billing_disabled",
    };
  }

  const authUser = await getSessionUser();
  if (!authUser?.email) {
    return {
      allowed: false,
      hasActiveSubscription: false,
      remainingCredits: 0,
      reason: "unauthenticated",
    };
  }

  await upsertUserFromAuth({ id: authUser.id, email: authUser.email });

  const subscription = await getActiveSubscription(authUser.id);
  const hasActiveSubscription = Boolean(subscription);
  const remainingCredits = await getUserCredits(authUser.id);

  if (hasActiveSubscription || remainingCredits > 0) {
    return {
      allowed: true,
      hasActiveSubscription,
      remainingCredits,
      planLabel: subscription
        ? planDisplayName(subscription.plan_id)
        : `${remainingCredits} credits`,
    };
  }

  return {
    allowed: false,
    hasActiveSubscription: false,
    remainingCredits: 0,
    reason: "payment_required",
  };
}

function emptyBillingStatus(
  partial: Partial<BillingStatusResponse> & Pick<BillingStatusResponse, "billingEnabled">,
): BillingStatusResponse {
  return {
    email: null,
    hasActiveSubscription: false,
    remainingCredits: 0,
    trialCredits: 0,
    isPro: false,
    creditsUsed: 0,
    creditsTotal: 0,
    planId: null,
    subscriptionStatus: null,
    currentPeriodEnd: null,
    tier: null,
    audioCreditsUsed: 0,
    audioCreditsLimit: null,
    ...partial,
  };
}

export async function getBillingStatusForClient(): Promise<BillingStatusResponse> {
  const authUser = await getSupabaseAuthUser();

  if (!isBillingEnabled()) {
    return emptyBillingStatus({
      billingEnabled: false,
      email: authUser?.email ?? null,
      tier: "pro_monthly",
      audioCreditsLimit: null,
      configChecks: getBillingEnvChecks(),
    });
  }

  if (!authUser?.email) {
    return emptyBillingStatus({ billingEnabled: true });
  }

  await upsertUserFromAuth({ id: authUser.id, email: authUser.email });
  const subscription = await getActiveSubscription(authUser.id);
  const remainingCredits = await getUserCredits(authUser.id);
  const trialCredits = await getTrialCredits(authUser.id);
  const creditsUsed = await getCreditsUsedCount(authUser.id);
  const creditsTotal = creditsUsed + remainingCredits;
  const hasActiveSubscription = Boolean(subscription);
  const tier = resolveUserTier(subscription);
  const audioCreditsUsed = await getAudioCreditsUsed(authUser.id);

  return {
    billingEnabled: true,
    email: authUser.email,
    hasActiveSubscription,
    remainingCredits,
    trialCredits,
    isPro: hasActiveSubscription,
    creditsUsed,
    creditsTotal,
    planId: subscription?.plan_id ?? (remainingCredits > 0 ? "credits_pack" : null),
    subscriptionStatus: subscription?.status ?? null,
    currentPeriodEnd: subscription?.current_period_end ?? null,
    tier,
    audioCreditsUsed,
    audioCreditsLimit: resolveAudioCreditsLimit({
      tier,
      remainingCredits,
      trialCredits,
      creditsTotal,
    }),
  };
}

const PRO_REEL_PLANS = new Set(["monthly", "yearly"]);

export type ProReelAccessResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; error: string; code: "unauthenticated" | "pro_required" | "billing_disabled" };

/** Server-side gate for property video reel export (Monthly & Yearly Pro only). */
export async function assertProReelAccess(): Promise<ProReelAccessResult> {
  if (!isBillingEnabled()) {
    return {
      ok: false,
      status: 403,
      error: "Video Reels are exclusive to Monthly and Yearly Pro plans.",
      code: "pro_required",
    };
  }

  const authUser = await getSessionUser();
  if (!authUser?.email) {
    return {
      ok: false,
      status: 401,
      error: "Sign in to export video reels.",
      code: "unauthenticated",
    };
  }

  await upsertUserFromAuth({ id: authUser.id, email: authUser.email });
  const subscription = await getActiveSubscription(authUser.id);

  if (!subscription || !PRO_REEL_PLANS.has(subscription.plan_id)) {
    return {
      ok: false,
      status: 403,
      error: "Video Reels are exclusive to Monthly and Yearly Pro plans.",
      code: "pro_required",
    };
  }

  return { ok: true, userId: authUser.id };
}

export type ReelExportAccessResult =
  | { ok: true; userId: string; isProReel: boolean }
  | {
      ok: false;
      status: 401 | 402 | 403;
      error: string;
      code: "unauthenticated" | "payment_required" | "billing_disabled";
    };

/** Server-side gate for property video reel export (all billing tiers; Pro = no demo watermark). */
export async function assertReelExportAccess(): Promise<ReelExportAccessResult> {
  if (!isBillingEnabled()) {
    return { ok: true, userId: "billing-disabled", isProReel: true };
  }

  const access = await resolveBillingAccess();
  if (!access.allowed) {
    if (access.reason === "unauthenticated") {
      return {
        ok: false,
        status: 401,
        error: "Sign in to export video reels.",
        code: "unauthenticated",
      };
    }
    return {
      ok: false,
      status: 402,
      error: "Active subscription or credits required.",
      code: "payment_required",
    };
  }

  const authUser = await getSessionUser();
  if (!authUser?.email) {
    return {
      ok: false,
      status: 401,
      error: "Sign in to export video reels.",
      code: "unauthenticated",
    };
  }

  await upsertUserFromAuth({ id: authUser.id, email: authUser.email });
  const subscription = await getActiveSubscription(authUser.id);
  const remainingCredits = await getUserCredits(authUser.id);
  const trialCredits = await getTrialCredits(authUser.id);
  const creditsUsed = await getCreditsUsedCount(authUser.id);
  const creditsTotal = remainingCredits + creditsUsed;
  const isProReel = Boolean(
    (subscription && PRO_REEL_PLANS.has(subscription.plan_id)) ||
      hasCreditPackEntitlements(remainingCredits, trialCredits, creditsTotal),
  );

  return { ok: true, userId: authUser.id, isProReel };
}
