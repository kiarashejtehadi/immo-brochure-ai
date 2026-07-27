import { defaultCreditsGrant } from "@/lib/billing/repository";
import {
  addCredits,
  upsertSubscription,
  upsertUserFromAuth,
  setPaymentCustomerId,
  tryRecordFulfillment,
} from "@/lib/billing/repository";
import {
  customDataPlanKey,
  customDataUserId,
  lemonSubscriptionGrantsAccess,
  mapLemonSubscriptionStatus,
  subscriptionPeriodEndFromLemon,
  type LemonWebhookPayload,
} from "@/lib/billing/lemonsqueezy";

function parseCustomerId(attrs: Record<string, unknown>): string | null {
  const id = attrs.customer_id;
  if (typeof id === "number" && Number.isFinite(id)) return String(id);
  if (typeof id === "string" && id.trim()) return id.trim();
  return null;
}

export async function handleLemonSqueezyWebhook(payload: LemonWebhookPayload): Promise<void> {
  const eventName = payload.meta.event_name;
  switch (eventName) {
    case "order_created":
      await handleOrderCreated(payload);
      break;
    case "subscription_created":
    case "subscription_updated":
      await handleSubscriptionWebhook(payload);
      break;
    case "subscription_cancelled":
    case "subscription_expired":
      await handleSubscriptionWebhook(payload, { forceCanceled: true });
      break;
    default:
      break;
  }
}

async function handleOrderCreated(payload: LemonWebhookPayload): Promise<void> {
  const attrs = payload.data.attributes;
  const status = typeof attrs.status === "string" ? attrs.status : "";
  if (status !== "paid") return;

  const userId = customDataUserId(payload.meta.custom_data);
  if (!userId) {
    console.warn("[webhook] order_created missing userId in custom_data");
    return;
  }

  const planKey = customDataPlanKey(payload.meta.custom_data);
  if (planKey !== "credits_pack") {
    return;
  }

  const orderId = payload.data.id;
  const recorded = await tryRecordFulfillment("lemonsqueezy", orderId, userId, "credits_pack");
  if (!recorded) return;

  const custom = payload.meta.custom_data;
  const grantRaw = custom?.creditsToGrant ?? custom?.credits_to_grant;
  const grant = Number.parseInt(String(grantRaw ?? ""), 10);
  await addCredits(
    userId,
    Number.isFinite(grant) && grant > 0 ? grant : defaultCreditsGrant(),
  );

  const customerId = parseCustomerId(attrs);
  if (customerId) {
    await setPaymentCustomerId(userId, customerId);
  }
}

async function handleSubscriptionWebhook(
  payload: LemonWebhookPayload,
  options?: { forceCanceled?: boolean },
): Promise<void> {
  const attrs = payload.data.attributes;
  const userId = customDataUserId(payload.meta.custom_data);
  if (!userId) {
    console.warn("[webhook] subscription event missing userId in custom_data");
    return;
  }

  const email = payload.meta.custom_data?.email;
  if (typeof email === "string" && email.trim()) {
    await upsertUserFromAuth({ id: userId, email: email.trim() });
  }

  const planKey = customDataPlanKey(payload.meta.custom_data) ?? "monthly";
  const lsStatus = typeof attrs.status === "string" ? attrs.status : "incomplete";
  const periodEnd = subscriptionPeriodEndFromLemon({
    renews_at: typeof attrs.renews_at === "string" ? attrs.renews_at : null,
    ends_at: typeof attrs.ends_at === "string" ? attrs.ends_at : null,
  });

  let status = mapLemonSubscriptionStatus(lsStatus);
  if (options?.forceCanceled) {
    status = "canceled";
  } else if (
    lsStatus === "cancelled" &&
    periodEnd &&
    lemonSubscriptionGrantsAccess(lsStatus, periodEnd)
  ) {
    status = "canceled";
  } else if (lemonSubscriptionGrantsAccess(lsStatus, periodEnd)) {
    status = lsStatus === "on_trial" ? "trialing" : "active";
  }

  await upsertSubscription({
    userId,
    providerSubscriptionId: payload.data.id,
    status,
    planId: planKey,
    currentPeriodEnd: periodEnd,
  });

  const customerId = parseCustomerId(attrs);
  if (customerId) {
    await setPaymentCustomerId(userId, customerId);
  }
}
