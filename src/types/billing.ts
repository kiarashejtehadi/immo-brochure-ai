export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete";

export type BillingPlanKey = "credits_pack" | "monthly" | "yearly";

export type DbUser = {
  id: string;
  email: string;
  payment_customer_id: string | null;
  created_at: string;
};

export type DbSubscription = {
  id: string;
  user_id: string;
  provider_subscription_id: string;
  status: SubscriptionStatus;
  plan_id: string;
  current_period_end: string | null;
};

export type DbUserCredits = {
  user_id: string;
  remaining_credits: number;
};

export type BillingAccess = {
  allowed: boolean;
  reason?: "unauthenticated" | "payment_required" | "billing_disabled";
  hasActiveSubscription: boolean;
  remainingCredits: number;
  planLabel?: string;
};

export type BillingStatusResponse = {
  billingEnabled: boolean;
  email: string | null;
  hasActiveSubscription: boolean;
  remainingCredits: number;
  /** Credits from free signup trial (PDF watermark when consumed). */
  trialCredits: number;
  /** Active monthly/yearly subscription — unlocks branding & watermark removal. */
  isPro: boolean;
  /** Generations paid with credit pack (not subscription). */
  creditsUsed: number;
  /** creditsUsed + remainingCredits (total pack balance purchased and not expired). */
  creditsTotal: number;
  planId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
  /** Which required env vars are present (no secret values). Shown when billing is off. */
  configChecks?: Record<string, boolean>;
};
