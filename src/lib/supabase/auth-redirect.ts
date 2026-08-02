import { appLocales, type AppLocale } from "@/i18n/routing";
import { consumePendingCheckoutPlan } from "@/lib/billing/pending-checkout";
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

/** Studio workspace for locale (form editor + live preview). */
export function studioPathForLocale(locale: AppLocale): string {
  return `/${locale}/create`;
}

export function checkoutPathForLocale(locale: AppLocale): string {
  return `/${locale}/checkout`;
}

/** Path to restore after magic link — default studio for landing & workspace. */
export function pathToSaveBeforeMagicLink(pathname: string): string {
  const path = pathname.split("?")[0] || "/de";
  if (path.includes("/checkout")) {
    return pathname.startsWith("/") ? pathname : path;
  }
  const locale = localeFromPath(path);
  const normalized = path.replace(/\/$/, "") || `/${locale}`;
  if (normalized === `/${locale}` || normalized === `/${locale}/create`) {
    return studioPathForLocale(locale);
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

function hasStudioAccess(status: BillingStatusResponse): boolean {
  if (!status.billingEnabled) return true;
  return status.hasActiveSubscription || (status.remainingCredits ?? 0) > 0;
}

export type ResolvePathAfterSignInOptions = {
  /** When billing status is unavailable, prefer checkout over studio. */
  defaultToCheckout?: boolean;
};

/**
 * After sign-in: send subscribed/credited users to studio; only unpaid users go to checkout.
 */
export async function resolvePathAfterSignIn(
  storedPath: string,
  options?: ResolvePathAfterSignInOptions,
): Promise<string> {
  const locale = localeFromPath(storedPath);
  const studio = studioPathForLocale(locale);
  const checkout = checkoutPathForLocale(locale);
  const savedPath = storedPath.startsWith("/") ? storedPath : studio;
  const savedPathname = savedPath.split("?")[0] ?? savedPath;
  const isCheckoutIntent = savedPathname.includes("/checkout");

  const status = await fetchBillingStatus();

  if (status && hasStudioAccess(status)) {
    if (status.hasActiveSubscription || !isCheckoutIntent) {
      consumePendingCheckoutPlan();
      return studio;
    }
  }

  if (!status) {
    return options?.defaultToCheckout && isCheckoutIntent ? savedPath : studio;
  }

  if (!status.billingEnabled) {
    return savedPathname !== studio && !isCheckoutIntent ? savedPathname : studio;
  }

  if (hasStudioAccess(status)) {
    consumePendingCheckoutPlan();
    return studio;
  }

  if (isCheckoutIntent) {
    return savedPath;
  }

  return checkout;
}
