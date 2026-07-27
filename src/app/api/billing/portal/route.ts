import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/billing/access";
import { isBillingEnabled } from "@/lib/billing/config";
import { getSubscriptionCustomerPortalUrl } from "@/lib/billing/lemonsqueezy";
import { getActiveSubscription } from "@/lib/billing/repository";

export const runtime = "nodejs";

export async function POST() {
  if (!isBillingEnabled()) {
    return NextResponse.json({ error: "Billing disabled." }, { status: 503 });
  }

  const authUser = await getSessionUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const subscription = await getActiveSubscription(authUser.id);
  if (!subscription) {
    return NextResponse.json(
      { error: "No active subscription. Purchase a plan or use credits." },
      { status: 400 },
    );
  }

  try {
    const url = await getSubscriptionCustomerPortalUrl(subscription.provider_subscription_id);
    if (!url) {
      return NextResponse.json(
        { error: "Customer portal URL not available yet." },
        { status: 502 },
      );
    }
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[billing/portal]", err);
    return NextResponse.json({ error: "Failed to open customer portal." }, { status: 502 });
  }
}
