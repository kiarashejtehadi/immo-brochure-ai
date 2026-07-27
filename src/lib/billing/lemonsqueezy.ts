import crypto from "node:crypto";
import type { BillingPlanKey } from "@/types/billing";
import type { SubscriptionStatus } from "@/types/billing";
import { checkoutSuccessUrl, getAppUrl, getLemonSqueezyStoreId } from "@/lib/billing/config";

const API_BASE = "https://api.lemonsqueezy.com/v1";

type LemonJsonApiResponse<T> = {
  data: T;
};

type LemonCheckoutData = {
  type: "checkouts";
  id: string;
  attributes: {
    url: string;
  };
};

type LemonSubscriptionData = {
  type: "subscriptions";
  id: string;
  attributes: {
    status: string;
    renews_at: string | null;
    ends_at: string | null;
    customer_id: number;
    urls?: {
      customer_portal?: string | null;
    };
  };
};

function apiKey(): string {
  const key = process.env.LEMONSQUEEZY_API_KEY?.trim();
  if (!key) throw new Error("LEMONSQUEEZY_API_KEY is not configured.");
  return key;
}

async function lemonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey()}`,
      ...init?.headers,
    },
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("[lemonsqueezy] API error", res.status, text);
    throw new Error(`Lemon Squeezy API error (${res.status}).`);
  }

  return JSON.parse(text) as T;
}

export function verifyLemonSqueezyWebhook(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(signatureHeader, "utf8");
  if (digest.length !== signature.length) return false;
  return crypto.timingSafeEqual(digest, signature);
}

export function isLemonSqueezyTestMode(): boolean {
  return process.env.LEMONSQUEEZY_TEST_MODE === "true";
}

export async function createLemonSqueezyCheckout(params: {
  variantId: string;
  email: string;
  userId: string;
  planKey: BillingPlanKey;
  creditsToGrant: number;
  locale: string;
}): Promise<string> {
  const storeId = getLemonSqueezyStoreId();
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        test_mode: isLemonSqueezyTestMode(),
        product_options: {
          redirect_url: checkoutSuccessUrl(params.locale),
          enabled_variants: [Number.parseInt(params.variantId, 10)],
        },
        checkout_data: {
          email: params.email,
          custom: {
            userId: params.userId,
            planKey: params.planKey,
            creditsToGrant: String(params.creditsToGrant),
          },
        },
      },
      relationships: {
        store: {
          data: { type: "stores", id: storeId },
        },
        variant: {
          data: { type: "variants", id: params.variantId },
        },
      },
    },
  };

  const json = await lemonFetch<LemonJsonApiResponse<LemonCheckoutData>>("/checkouts", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const url = json.data.attributes.url;
  if (!url) throw new Error("Checkout URL missing from Lemon Squeezy response.");
  return url;
}

export async function getSubscriptionCustomerPortalUrl(
  subscriptionId: string,
): Promise<string | null> {
  const json = await lemonFetch<LemonJsonApiResponse<LemonSubscriptionData>>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
  );
  return json.data.attributes.urls?.customer_portal ?? null;
}

export function mapLemonSubscriptionStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "on_trial":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "cancelled":
    case "expired":
      return "canceled";
    case "paused":
      return "incomplete";
    default:
      return "incomplete";
  }
}

export function subscriptionPeriodEndFromLemon(attrs: {
  renews_at: string | null;
  ends_at: string | null;
}): Date | null {
  const iso = attrs.ends_at ?? attrs.renews_at;
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Subscription still grants access (incl. cancelled until period end). */
export function lemonSubscriptionGrantsAccess(
  status: string,
  periodEnd: Date | null,
): boolean {
  if (status === "active" || status === "on_trial") return true;
  if (status === "cancelled" && periodEnd && periodEnd.getTime() > Date.now()) {
    return true;
  }
  return false;
}

export type LemonWebhookPayload = {
  meta: {
    event_name: string;
    custom_data?: Record<string, string | number | boolean | null> | null;
  };
  data: {
    type: string;
    id: string;
    attributes: Record<string, unknown>;
  };
};

export function customDataUserId(
  custom: LemonWebhookPayload["meta"]["custom_data"],
): string | null {
  if (!custom) return null;
  const raw = custom.userId ?? custom.user_id;
  if (raw === undefined || raw === null) return null;
  const id = String(raw).trim();
  return id.length > 0 ? id : null;
}

export function customDataPlanKey(
  custom: LemonWebhookPayload["meta"]["custom_data"],
): BillingPlanKey | null {
  if (!custom) return null;
  const raw = custom.planKey ?? custom.plan_key;
  if (raw === "credits_pack" || raw === "monthly" || raw === "yearly") return raw;
  return null;
}

export function getAppOriginForWebhooks(): string {
  return getAppUrl();
}
