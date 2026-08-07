function userSafeResendError(status: number, body: string): Error {
  console.error("[resend]", status, body);
  if (status === 401 || status === 403) {
    return new Error(
      "Email delivery is not configured correctly. Please try again later or contact us directly.",
    );
  }
  if (status === 422 || status === 400) {
    return new Error(
      "Your message could not be delivered. Please check your email address and try again.",
    );
  }
  return new Error("Could not send your message. Please try again later.");
}

export async function sendViaResend(params: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM?.trim() ?? "Immo Brochure AI <onboarding@resend.dev>";
  if (!apiKey) {
    throw new Error("Email delivery is not configured.");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      reply_to: params.replyTo,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw userSafeResendError(res.status, body);
  }
}
