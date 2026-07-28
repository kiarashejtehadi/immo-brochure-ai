import { NextResponse } from "next/server";
import type { BillingPlanKey } from "@/types/billing";
import { getPlanConfig, isBillingEnabled } from "@/lib/billing/config";
import { getSupabaseAuthUser } from "@/lib/billing/access";
import { createLemonSqueezyCheckout } from "@/lib/billing/lemonsqueezy";
import { getUserById, upsertUserFromAuth } from "@/lib/billing/repository";

export const runtime = "nodejs";

type Body = {
  plan?: BillingPlanKey;
  locale?: string;
};

export async function POST(request: Request) {
  const jsonError = (message: string, status: number) =>
    NextResponse.json({ error: message }, { status });

  try {
    if (!isBillingEnabled()) {
      return jsonError("Billing is not configured on this deployment.", 503);
    }

    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }

    const plan = body.plan;
    if (!plan || !["credits_pack", "monthly", "yearly"].includes(plan)) {
      return jsonError("Invalid plan.", 400);
    }

    const planConfig = getPlanConfig(plan);
    if (!planConfig) {
      const envKey =
        plan === "credits_pack"
          ? "LEMONSQUEEZY_VARIANT_CREDITS_PACK"
          : `LEMONSQUEEZY_VARIANT_${plan.toUpperCase()}`;
      return jsonError(
        `Plan "${plan}" is not configured. Set ${envKey} in Vercel (numeric variant ID from Lemon Squeezy).`,
        503,
      );
    }

    const locale = body.locale?.trim() || "en";

    const authUser = await getSupabaseAuthUser();
    if (!authUser?.email) {
      return jsonError("Sign in required.", 401);
    }

    await upsertUserFromAuth({ id: authUser.id, email: authUser.email });
    const dbUser = await getUserById(authUser.id);
    if (!dbUser) {
      return jsonError("User profile missing.", 500);
    }

    const url = await createLemonSqueezyCheckout({
      variantId: planConfig.variantId,
      email: authUser.email,
      userId: authUser.id,
      planKey: planConfig.key,
      creditsToGrant: planConfig.creditsToGrant ?? 0,
      locale,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[checkout/create]", err);
    const message =
      err instanceof Error ? err.message : "Failed to create checkout.";
    return jsonError(message, 502);
  }
}
