import { NextResponse } from "next/server";
import { getLemonSqueezyWebhookSecret, isBillingEnabled } from "@/lib/billing/config";
import { handleLemonSqueezyWebhook } from "@/lib/billing/webhook-handlers";
import {
  verifyLemonSqueezyWebhook,
  type LemonWebhookPayload,
} from "@/lib/billing/lemonsqueezy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isBillingEnabled()) {
    return NextResponse.json({ error: "Billing disabled." }, { status: 503 });
  }

  const secret = getLemonSqueezyWebhookSecret();
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  }

  const signature = request.headers.get("x-signature");
  const rawBody = await request.text();

  if (!verifyLemonSqueezyWebhook(rawBody, signature, secret)) {
    console.error("[webhook/payment] Lemon Squeezy signature verification failed");
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let payload: LemonWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as LemonWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    await handleLemonSqueezyWebhook(payload);
  } catch (err) {
    console.error("[webhook/payment] handler error", payload.meta?.event_name, err);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
