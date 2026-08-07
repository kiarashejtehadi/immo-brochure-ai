import { NextResponse } from "next/server";
import { getLegalBusinessConfig } from "@/config/legal-business";
import {
  formatContactEmailHtml,
  formatContactEmailSubject,
} from "@/lib/contact/format-contact-email";
import { validateContactForm } from "@/lib/contact/validate-contact-form";
import { sendViaResend } from "@/lib/email/send-via-resend";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const jsonError = (message: string, status: number) =>
    NextResponse.json({ error: message }, { status });

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON.", 400);
    }

    const validated = validateContactForm(body);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.message, field: validated.field },
        { status: 400 },
      );
    }

    const recipient = getLegalBusinessConfig().email.trim();
    if (!recipient || recipient.includes("example")) {
      return jsonError(
        "Contact form is not configured yet. Please set LEGAL_CONTACT_EMAIL.",
        503,
      );
    }

    await sendViaResend({
      to: recipient,
      subject: formatContactEmailSubject(validated.data),
      html: formatContactEmailHtml(validated.data),
      replyTo: validated.data.email,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/contact]", err);
    return jsonError(
      err instanceof Error ? err.message : "Could not send your message. Please try again.",
      502,
    );
  }
}
