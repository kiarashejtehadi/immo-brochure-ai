import { cancelLemonSqueezySubscription } from "@/lib/billing/lemonsqueezy";
import { upsertSubscription } from "@/lib/billing/repository";
import type { DbSubscription } from "@/types/billing";

function isStripeSubscriptionId(id: string): boolean {
  return id.startsWith("sub_");
}

/** Cancel via Stripe REST API when STRIPE_SECRET_KEY is configured (legacy / hybrid setups). */
async function cancelStripeSubscription(subscriptionId: string): Promise<void> {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  const res = await fetch(
    `https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${key}`,
      },
    },
  );

  if (res.status === 404) return;

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Stripe subscription cancel failed (${res.status}): ${body.slice(0, 200)}`);
  }
}

async function cancelProviderSubscription(subscription: DbSubscription): Promise<void> {
  const id = subscription.provider_subscription_id.trim();
  if (!id) return;

  if (isStripeSubscriptionId(id)) {
    await cancelStripeSubscription(id);
  } else {
    await cancelLemonSqueezySubscription(id);
  }

  await upsertSubscription({
    userId: subscription.user_id,
    providerSubscriptionId: id,
    status: "canceled",
    planId: subscription.plan_id,
    currentPeriodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : null,
  });
}

/** Cancel all active billable subscriptions for the user (Lemon Squeezy or Stripe). */
export async function cancelAllActiveSubscriptions(
  subscriptions: DbSubscription[],
): Promise<void> {
  const cancelable = subscriptions.filter((row) =>
    ["active", "trialing", "past_due"].includes(row.status),
  );

  const errors: string[] = [];
  for (const subscription of cancelable) {
    try {
      await cancelProviderSubscription(subscription);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown cancel error";
      errors.push(message);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join(" | "));
  }
}
