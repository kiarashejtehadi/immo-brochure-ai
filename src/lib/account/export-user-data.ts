import { getUserBranding } from "@/lib/branding/repository";
import { listUserStorageFiles } from "@/lib/account/user-storage";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type UserDataExport = {
  export_date: string;
  account_information: {
    user_id: string;
    email: string | null;
    auth_created_at: string | null;
    last_sign_in_at: string | null;
    profile_created_at: string | null;
    payment_customer_id: string | null;
    branding_and_contact: Awaited<ReturnType<typeof getUserBranding>>;
  };
  properties_and_exposes: {
    note: string;
    items: [];
  };
  subscription_history: Array<{
    id: string;
    provider_subscription_id: string;
    status: string;
    plan_id: string;
    current_period_end: string | null;
    created_at: string;
    updated_at: string;
  }>;
  credits_and_usage: {
    remaining_credits: number | null;
    trial_credits: number | null;
    audio_credits_used: number | null;
    credits_updated_at: string | null;
  };
  generation_activity: Array<{
    id: string;
    used_credit: boolean;
    created_at: string;
  }>;
  payment_fulfillments: Array<{
    id: string;
    provider: string;
    external_id: string;
    kind: string;
    created_at: string;
  }>;
  uploaded_files: Awaited<ReturnType<typeof listUserStorageFiles>>;
};

const PROPERTIES_NOTE =
  "Listing drafts, property details, and generated exposé content are stored in your browser session only and are not persisted on our servers unless you save branding or billing data separately.";

export async function buildUserDataExport(userId: string): Promise<UserDataExport> {
  const supabase = createSupabaseServiceClient();

  const [
    authResult,
    userRowResult,
    subscriptionsResult,
    creditsResult,
    logsResult,
    fulfillmentsResult,
    branding,
    uploadedFiles,
  ] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase.from("users").select("*").eq("id", userId).maybeSingle(),
    supabase.from("subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("user_credits").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("generation_logs")
      .select("id, used_credit, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("payment_fulfillments")
      .select("id, provider, external_id, kind, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    getUserBranding(userId),
    listUserStorageFiles(userId),
  ]);

  if (authResult.error) {
    throw new Error(authResult.error.message);
  }
  if (userRowResult.error) {
    throw new Error(userRowResult.error.message);
  }
  if (subscriptionsResult.error) {
    throw new Error(subscriptionsResult.error.message);
  }
  if (creditsResult.error) {
    throw new Error(creditsResult.error.message);
  }
  if (logsResult.error) {
    throw new Error(logsResult.error.message);
  }
  if (fulfillmentsResult.error) {
    throw new Error(fulfillmentsResult.error.message);
  }

  const authUser = authResult.data.user;
  const userRow = userRowResult.data;
  const credits = creditsResult.data;

  return {
    export_date: new Date().toISOString(),
    account_information: {
      user_id: userId,
      email: authUser?.email ?? userRow?.email ?? null,
      auth_created_at: authUser?.created_at ?? null,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      profile_created_at: userRow?.created_at ?? null,
      payment_customer_id: userRow?.payment_customer_id ?? null,
      branding_and_contact: branding,
    },
    properties_and_exposes: {
      note: PROPERTIES_NOTE,
      items: [],
    },
    subscription_history: (subscriptionsResult.data ?? []).map((row) => ({
      id: row.id,
      provider_subscription_id: row.provider_subscription_id,
      status: row.status,
      plan_id: row.plan_id,
      current_period_end: row.current_period_end,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })),
    credits_and_usage: {
      remaining_credits: credits?.remaining_credits ?? null,
      trial_credits: credits?.trial_credits ?? null,
      audio_credits_used: credits?.audio_credits_used ?? null,
      credits_updated_at: credits?.updated_at ?? null,
    },
    generation_activity: logsResult.data ?? [],
    payment_fulfillments: fulfillmentsResult.data ?? [],
    uploaded_files: uploadedFiles,
  };
}
