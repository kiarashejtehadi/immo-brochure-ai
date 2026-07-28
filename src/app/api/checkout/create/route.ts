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
  try {
    if (!isBillingEnabled()) {
      return NextResponse.json(
        { error: "Billing is not configured on this deployment." },
        { status: 503 },
      );
    }

    const authUser = await getSupabaseAuthUser();
    if (!authUser?.email) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const plan = body.plan;
    if (!plan || !["credits_pack", "monthly", "yearly"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const planConfig = getPlanConfig(plan);
    if (!planConfig) {
      return NextResponse.json(
        {
          error: `Plan "${plan}" is not configured. Set LEMONSQUEEZY_VARIANT_${plan === "credits_pack" ? "CREDITS_PACK" : plan.toUpperCase()} on the server.`,
        },
        { status: 503 },
      );
    }

    const locale = body.locale?.trim() || "en";
    await upsertUserFromAuth({ id: authUser.id, email: authUser.email });
    const dbUser = await getUserById(authUser.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User profile missing." }, { status: 500 });
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
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
