/** Where to send the user after /auth/callback (pathname only, e.g. /de). */
export const POST_AUTH_REDIRECT_KEY = "immo_post_auth_redirect";

export function savePostAuthRedirect(pathname: string): void {
  if (typeof window === "undefined") return;
  const path = pathname.startsWith("/") ? pathname : "/de";
  sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, path);
}

export function consumePostAuthRedirect(fallback = "/de"): string {
  if (typeof window === "undefined") return fallback;
  const stored = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
  sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  if (stored?.startsWith("/")) return stored;
  return fallback;
}

/** Must match Supabase Redirect URLs exactly (no query string). */
export function authCallbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/auth/callback`;
}
