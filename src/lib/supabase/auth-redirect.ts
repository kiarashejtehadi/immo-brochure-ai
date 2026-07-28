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

export function checkoutPathForLocale(locale: AppLocale): string {
  return `/${locale}/checkout`;
}

/** Path to restore after magic link — studio home → checkout when billing applies. */
export function pathToSaveBeforeMagicLink(pathname: string): string {
  const path = pathname.split("?")[0] || "/de";
  if (path.includes("/checkout")) return path;
  const locale = localeFromPath(path);
  const normalized = path.replace(/\/$/, "") || `/${locale}`;
  if (normalized === `/${locale}`) {
    return checkoutPathForLocale(locale);
  }
  return path.startsWith("/") ? path : `/${locale}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchBillingStatus(retries = 5): Promise<BillingStatusResponse | null> {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const res = await fetch("/api/billing/status", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (res.ok) {
        return (await res.json()) as BillingStatusResponse;
      }
    } catch {
      /* retry */
    }
    if (attempt < retries - 1) {
      await sleep(120 * (attempt + 1));
    }
  }
  return null;
}

export type ResolvePathAfterSignInOptions = {
  /** After magic link: default to checkout instead of studio when status is unavailable. */
  defaultToCheckout?: boolean;
};

/**
 * After sign-in: honor saved checkout path, or /{locale}/checkout if billing is on and user has no plan/credits.
 */
export async function resolvePathAfterSignIn(
  storedPath: string,
  options?: ResolvePathAfterSignInOptions,
): Promise<string> {
  const locale = localeFromPath(storedPath);
  const studio = studioPathForLocale(locale);
  const checkout = checkoutPathForLocale(locale);

  const saved = storedPath.split("?")[0] ?? storedPath;
  if (saved.includes("/checkout")) {
    return saved.startsWith("/") ? saved : checkout;
  }

  const status = await fetchBillingStatus();
  const fallback = options?.defaultToCheckout ? checkout : studio;

  if (!status) {
    return fallback;
  }

  if (!status.billingEnabled) {
    return saved.startsWith("/") && saved !== studio ? saved : studio;
  }

  const hasAccess =
    status.hasActiveSubscription || (status.remainingCredits ?? 0) > 0;
  if (hasAccess) {
    return studio;
  }

  return checkout;
}
