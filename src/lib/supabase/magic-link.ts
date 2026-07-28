import { getAppUrl } from "@/lib/billing/config";

/** Parse `next` path from Supabase email_data.redirect_to (our /auth/callback?next=… URL). */
export function nextPathFromRedirectTo(redirectTo: string): string {
  try {
    const url = new URL(redirectTo);
    const next = url.searchParams.get("next");
    if (next?.startsWith("/")) return next;
  } catch {
    /* ignore */
  }
  return "/de";
}

export function originFromRedirectTo(redirectTo: string): string {
  try {
    return new URL(redirectTo).origin;
  } catch {
    return getAppUrl();
  }
}

/** Magic link hits our callback with token_hash (works in any browser / mail app). */
export function buildAppMagicLinkUrl(emailData: {
  token_hash: string;
  email_action_type: string;
  redirect_to: string;
}): string {
  const origin = originFromRedirectTo(emailData.redirect_to).replace(/\/$/, "");
  const next = nextPathFromRedirectTo(emailData.redirect_to);
  const params = new URLSearchParams({
    token_hash: emailData.token_hash,
    type: emailData.email_action_type,
    next,
  });
  return `${origin}/auth/callback?${params.toString()}`;
}
