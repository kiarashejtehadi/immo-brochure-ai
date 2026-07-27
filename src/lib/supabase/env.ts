export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

/** Supabase dashboard: anon / public key → NEXT_PUBLIC_SUPABASE_ANON_KEY */
export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined;
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined;
}

export function isBillingEnabledFlag(): boolean {
  return process.env.BILLING_ENABLED?.trim().toLowerCase() === "true";
}

export type BillingEnvCheckKey =
  | "BILLING_ENABLED"
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "LEMONSQUEEZY_API_KEY"
  | "LEMONSQUEEZY_STORE_ID"
  | "LEMONSQUEEZY_WEBHOOK_SECRET";

export function getBillingEnvChecks(): Record<BillingEnvCheckKey, boolean> {
  return {
    BILLING_ENABLED: isBillingEnabledFlag(),
    NEXT_PUBLIC_SUPABASE_URL: Boolean(getSupabaseUrl()),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(getSupabaseAnonKey()),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(getSupabaseServiceRoleKey()),
    LEMONSQUEEZY_API_KEY: Boolean(process.env.LEMONSQUEEZY_API_KEY?.trim()),
    LEMONSQUEEZY_STORE_ID: Boolean(process.env.LEMONSQUEEZY_STORE_ID?.trim()),
    LEMONSQUEEZY_WEBHOOK_SECRET: Boolean(process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim()),
  };
}

export function isBillingEnvComplete(): boolean {
  return Object.values(getBillingEnvChecks()).every(Boolean);
}
