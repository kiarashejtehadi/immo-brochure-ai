export type CookieConsentState = {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
};

export const COOKIE_CONSENT_KEY = "immo-cookie-consent-v1";

export function isAnalyticsEnabledInDeployment(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
}

export function readCookieConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsentState;
  } catch {
    return null;
  }
}

export function writeCookieConsent(analytics: boolean): CookieConsentState {
  const state: CookieConsentState = {
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
  return state;
}

export function shouldShowCookieBanner(): boolean {
  if (!isAnalyticsEnabledInDeployment()) return false;
  return readCookieConsent() === null;
}

/** Call before injecting any analytics script. */
export function canLoadAnalytics(): boolean {
  if (!isAnalyticsEnabledInDeployment()) return false;
  const consent = readCookieConsent();
  return consent?.analytics === true;
}
