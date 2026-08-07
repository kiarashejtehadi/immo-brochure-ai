import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { sendViaResend } from "@/lib/email/send-via-resend";

export const runtime = "nodejs";

type HookPayload = {
  user: { email: string };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
};

const SUBJECTS: Record<string, string> = {
  magiclink: "Your sign-in link — Immo Brochure AI",
  signup: "Confirm your email — Immo Brochure AI",
  recovery: "Reset your password — Immo Brochure AI",
  invite: "You are invited — Immo Brochure AI",
  email_change: "Confirm email change — Immo Brochure AI",
};

function hookSigningSecret(): string {
  const raw = process.env.SEND_EMAIL_HOOK_SECRET?.trim() ?? "";
  return raw.replace(/^v1,whsec_/, "");
}

import { buildAppMagicLinkUrl } from "@/lib/supabase/magic-link";

export async function POST(request: Request) {
  const secret = hookSigningSecret();
  if (!secret) {
    return NextResponse.json({ error: "Hook secret not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const wh = new Webhook(secret);

  let payload: HookPayload;
  try {
    payload = wh.verify(rawBody, {
      "webhook-id": request.headers.get("webhook-id") ?? "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": request.headers.get("webhook-signature") ?? "",
    }) as HookPayload;
  } catch (err) {
    console.error("[auth/hook/send-email] verify failed", err);
    return NextResponse.json({ error: "Invalid hook signature." }, { status: 401 });
  }

  const { user, email_data: emailData } = payload;
  if (!user?.email) {
    return NextResponse.json({ error: "Missing recipient." }, { status: 400 });
  }

  const confirmationUrl = buildAppMagicLinkUrl(emailData);
  const subject =
    SUBJECTS[emailData.email_action_type] ?? "Immo Brochure AI notification";
  const html = `
    <p>Hello,</p>
    <p>Click the link below to continue. It expires soon and works once.</p>
    <p><a href="${confirmationUrl}">Continue</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `.trim();

  try {
    await sendViaResend({ to: user.email, subject, html });
    return NextResponse.json({});
  } catch (err) {
    console.error("[auth/hook/send-email] send failed", err);
    return NextResponse.json(
      { error: { message: err instanceof Error ? err.message : "Send failed." } },
      { status: 500 },
    );
  }
}
