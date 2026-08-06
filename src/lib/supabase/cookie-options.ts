import type { CookieOptions } from "@supabase/ssr";

/** Keep users signed in across browser restarts (30 days). */
export const AUTH_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const AUTH_COOKIE_DEFAULTS: Pick<
  CookieOptions,
  "path" | "sameSite" | "secure" | "maxAge"
> = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
};

export function mergeAuthCookieOptions(options: CookieOptions): CookieOptions {
  const clearing = options.maxAge === 0;
  return {
    ...options,
    path: options.path ?? AUTH_COOKIE_DEFAULTS.path,
    sameSite: options.sameSite ?? AUTH_COOKIE_DEFAULTS.sameSite,
    secure:
      process.env.NODE_ENV === "production"
        ? true
        : (options.secure ?? AUTH_COOKIE_DEFAULTS.secure),
    maxAge: clearing ? 0 : AUTH_COOKIE_MAX_AGE_SECONDS,
  };
}

export function applyAuthCookiesToResponse(
  setCookie: (name: string, value: string, options: CookieOptions) => void,
  cookiesToSet: { name: string; value: string; options: CookieOptions }[],
) {
  cookiesToSet.forEach(({ name, value, options }) => {
    setCookie(name, value, mergeAuthCookieOptions(options));
  });
}
