const HONEYPOT_FIELD = "website_url";

function trimOptional(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** True when a bot filled the hidden honeypot field. */
export function isHoneypotTriggered(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  return trimOptional((body as Record<string, unknown>)[HONEYPOT_FIELD]).length > 0;
}

export const CONTACT_HONEYPOT_FIELD = HONEYPOT_FIELD;
