import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { DbSubscription, DbUser, DbUserCredits, SubscriptionStatus } from "@/types/billing";
import { creditsPerPack } from "@/lib/billing/config";

export async function upsertUserFromAuth(user: {
  id: string;
  email: string;
}): Promise<DbUser> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("users")
    .upsert(
      { id: user.id, email: user.email },
      { onConflict: "id" },
    )
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to upsert user.");
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

export async function decrementCredit(userId: string): Promise<number | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc("decrement_user_credit", {
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
  return typeof data === "number" ? data : null;
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
