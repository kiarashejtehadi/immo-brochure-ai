import { isBillingEnabled, planDisplayName } from "@/lib/billing/config";
import { getBillingEnvChecks } from "@/lib/supabase/env";
import {
  getActiveSubscription,
  getUserCredits,
  upsertUserFromAuth,
} from "@/lib/billing/repository";
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

export async function getBillingStatusForClient(): Promise<BillingStatusResponse> {
  const authUser = await getSupabaseAuthUser();

  if (!isBillingEnabled()) {
    return {
      billingEnabled: false,
      email: authUser?.email ?? null,
      hasActiveSubscription: false,
      remainingCredits: 0,
      planId: null,
      subscriptionStatus: null,
      currentPeriodEnd: null,
      configChecks: getBillingEnvChecks(),
    };
  }

  if (!authUser?.email) {
    return {
      billingEnabled: true,
      email: null,
      hasActiveSubscription: false,
      remainingCredits: 0,
      planId: null,
      subscriptionStatus: null,
      currentPeriodEnd: null,
    };
  }

  await upsertUserFromAuth({ id: authUser.id, email: authUser.email });
  const subscription = await getActiveSubscription(authUser.id);
  const remainingCredits = await getUserCredits(authUser.id);

  return {
    billingEnabled: true,
    email: authUser.email,
    hasActiveSubscription: Boolean(subscription),
    remainingCredits,
    planId: subscription?.plan_id ?? (remainingCredits > 0 ? "credits_pack" : null),
    subscriptionStatus: subscription?.status ?? null,
    currentPeriodEnd: subscription?.current_period_end ?? null,
  };
}
