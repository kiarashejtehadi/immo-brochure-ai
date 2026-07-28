import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { DbSubscription, DbUser, DbUserCredits, SubscriptionStatus } from "@/types/billing";
import { creditsPerPack } from "@/lib/billing/config";

export async function upsertUserFromAuth(user: {
  id: string;
  email: string;
}): Promise<DbUser> {
  const supabase = createSupabaseServiceClient();

  const { error: rpcError } = await supabase.rpc("ensure_billing_user", {
    p_user_id: user.id,
    p_email: user.email,
  });

  if (rpcError) {
    const { data, error } = await supabase
      .from("users")
      .upsert({ id: user.id, email: user.email }, { onConflict: "id" })
      .select("*")
      .single();

    if (error || !data) {
      const msg = error?.message ?? rpcError.message ?? "Failed to upsert user.";
      if (/permission denied/i.test(msg)) {
        throw new Error(
          `${msg} Apply supabase/migrations/004_service_role_billing_writes.sql in Supabase SQL Editor and set SUPABASE_SERVICE_ROLE_KEY on Vercel to the service_role secret (not the anon key).`,
        );
      }
      throw new Error(msg);
    }

    const { data: credits } = await supabase
      .from("user_credits")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!credits) {
      await supabase.from("user_credits").insert({ user_id: user.id, remaining_credits: 0 });
    }

    return data as DbUser;
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    throw new Error("Failed to load user after ensure_billing_user.");
  }
  return dbUser;
}

export async function getUserById(userId: string): Promise<DbUser | null> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
  return (data as DbUser | null) ?? null;
}

export async function setPaymentCustomerId(userId: string, customerId: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("users")
    .update({ payment_customer_id: customerId })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

/** @deprecated use setPaymentCustomerId */
export const setStripeCustomerId = setPaymentCustomerId;

export async function tryRecordFulfillment(
  provider: string,
  externalId: string,
  userId: string,
  kind: string,
): Promise<boolean> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("payment_fulfillments").insert({
    provider,
    external_id: externalId,
    user_id: userId,
    kind,
  });
  if (error?.code === "23505") return false;
  if (error) throw new Error(error.message);
  return true;
}

export async function getActiveSubscription(userId: string): Promise<DbSubscription | null> {
  const supabase = createSupabaseServiceClient();
  const now = new Date().toISOString();
  const { data: activeRows } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .order("updated_at", { ascending: false })
    .limit(1);

  if (activeRows?.[0]) {
    return activeRows[0] as DbSubscription;
  }

  const { data: canceledRows } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "canceled")
    .gt("current_period_end", now)
    .order("current_period_end", { ascending: false })
    .limit(1);

  return (canceledRows?.[0] as DbSubscription | undefined) ?? null;
}

export async function upsertSubscription(row: {
  userId: string;
  providerSubscriptionId: string;
  status: SubscriptionStatus;
  planId: string;
  currentPeriodEnd: Date | null;
}): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: row.userId,
      provider_subscription_id: row.providerSubscriptionId,
      status: row.status,
      plan_id: row.planId,
      current_period_end: row.currentPeriodEnd?.toISOString() ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider_subscription_id" },
  );
  if (error) throw new Error(error.message);
}

export async function getUserCredits(userId: string): Promise<number> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("user_credits")
    .select("remaining_credits")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as DbUserCredits | null)?.remaining_credits ?? 0;
}

export async function getTrialCredits(userId: string): Promise<number> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("user_credits")
    .select("trial_credits")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as { trial_credits?: number } | null)?.trial_credits ?? 0;
}

/** Count exposé generations that consumed a credit-pack credit. */
export async function getCreditsUsedCount(userId: string): Promise<number> {
  const supabase = createSupabaseServiceClient();
  const { count, error } = await supabase
    .from("generation_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("used_credit", true);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function addCredits(userId: string, amount: number): Promise<number> {
  const supabase = createSupabaseServiceClient();
  const current = await getUserCredits(userId);
  const next = current + amount;
  const { error } = await supabase.from("user_credits").upsert({
    user_id: userId,
    remaining_credits: next,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  return next;
}

export async function decrementCredit(
  userId: string,
): Promise<{ remaining: number; usedTrialCredit: boolean } | null> {
  const supabase = createSupabaseServiceClient();
  const { data: row, error: readError } = await supabase
    .from("user_credits")
    .select("remaining_credits, trial_credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) throw new Error(readError.message);
  const remaining = (row as { remaining_credits?: number } | null)?.remaining_credits ?? 0;
  const trial = (row as { trial_credits?: number } | null)?.trial_credits ?? 0;
  if (remaining <= 0) return null;

  const usedTrialCredit = trial > 0;
  const nextRemaining = remaining - 1;
  const nextTrial = usedTrialCredit ? trial - 1 : trial;

  const { error: updateError } = await supabase
    .from("user_credits")
    .update({
      remaining_credits: nextRemaining,
      trial_credits: nextTrial,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) throw new Error(updateError.message);
  return { remaining: nextRemaining, usedTrialCredit };
}

export async function logGeneration(userId: string, usedCredit: boolean): Promise<void> {
  const supabase = createSupabaseServiceClient();
  await supabase.from("generation_logs").insert({
    user_id: userId,
    used_credit: usedCredit,
  });
}

export function defaultCreditsGrant(): number {
  return creditsPerPack();
}
