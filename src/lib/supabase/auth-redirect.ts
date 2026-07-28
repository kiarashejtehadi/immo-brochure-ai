import { appLocales, type AppLocale } from "@/i18n/routing";
import type { BillingStatusResponse } from "@/types/billing";

/** Where to send the user after /auth/callback (pathname only, e.g. /de). */
export const POST_AUTH_REDIRECT_KEY = "immo_post_auth_redirect";

/** localStorage so magic links opened in a new tab still see the saved path. */
export function savePostAuthRedirect(pathname: string): void {
  if (typeof window === "undefined") return;
  const path = pathname.startsWith("/") ? pathname : "/de";
  localStorage.setItem(POST_AUTH_REDIRECT_KEY, path);
}

export function consumePostAuthRedirect(fallback = "/de"): string {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(POST_AUTH_REDIRECT_KEY);
  localStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  if (stored?.startsWith("/")) return stored;
  return fallback;
}

/** Must match Supabase Redirect URLs exactly (no query string). */
export function authCallbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/auth/callback`;
}

export function localeFromPath(path: string, fallback: AppLocale = "de"): AppLocale {
  const seg = path.split("/").filter(Boolean)[0];
  if (seg && (appLocales as readonly string[]).includes(seg)) {
    return seg as AppLocale;
  }
  return fallback;
}

/** Studio home for locale (where users generate exposés). */
export function studioPathForLocale(locale: AppLocale): string {
  return `/${locale}`;
}

/**
 * After sign-in: return saved path, or /{locale}/checkout if billing is on and user has no plan/credits.
 */
export async function resolvePathAfterSignIn(storedPath: string): Promise<string> {
  const locale = localeFromPath(storedPath);
  const studio = studioPathForLocale(locale);

  try {
    const res = await fetch("/api/billing/status", { cache: "no-store" });
    if (!res.ok) return studio;
    const status = (await res.json()) as BillingStatusResponse;
    if (!status.billingEnabled) return studio;

    const hasAccess =
      status.hasActiveSubscription || (status.remainingCredits ?? 0) > 0;
    if (hasAccess) return studio;

    return `/${locale}/checkout`;
  } catch {
    return studio;
  }
}
