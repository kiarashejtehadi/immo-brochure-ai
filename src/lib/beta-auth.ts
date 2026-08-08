import type { NextRequest } from "next/server";

export const BETA_ACCESS_COOKIE = "beta_access";

const TOKEN_PREFIX = "beta-v1:";

/** TEMPORARY: set to false to re-enable the beta password gate. */
const BETA_GATE_LIFTED = true;

export function isBetaProtectionEnabled(): boolean {
  if (BETA_GATE_LIFTED || process.env.BETA_GATE_DISABLED === "true") {
    return false;
  }
  return Boolean(process.env.BETA_PASSWORD?.trim());
}

export function isBetaPublicPath(pathname: string): boolean {
  return (
    pathname === "/beta-login" ||
    pathname.startsWith("/beta-login/") ||
    pathname === "/auth/callback" ||
    pathname.startsWith("/auth/callback/")
  );
}

export function sanitizeBetaRedirect(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }
  if (isBetaPublicPath(path.split("?")[0] ?? path)) {
    return "/";
  }
  // Supabase magic links must not be sent through beta redirect (/?code=…).
  const qIndex = path.indexOf("?");
  if (qIndex !== -1 && path.slice(qIndex + 1).includes("code=")) {
    const pathname = path.slice(0, qIndex) || "/";
    return pathname === "/" ? "/de" : pathname;
  }
  return path;
}

/** If Supabase lands with ?code= on a non-callback path, rewrite to /auth/callback. */
export function authCallbackRedirectUrl(request: NextRequest): URL | null {
  const { pathname } = request.nextUrl;
  if (pathname === "/auth/callback" || pathname.startsWith("/auth/callback/")) {
    return null;
  }
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  if (!code && !tokenHash) return null;

  const url = request.nextUrl.clone();
  url.pathname = "/auth/callback";
  url.search = "";
  if (code) url.searchParams.set("code", code);
  if (tokenHash) {
    url.searchParams.set("token_hash", tokenHash);
    const type = request.nextUrl.searchParams.get("type");
    if (type) url.searchParams.set("type", type);
  }
  const existingNext = request.nextUrl.searchParams.get("next");
  const nextPath =
    existingNext?.startsWith("/")
      ? existingNext
      : pathname === "/" || pathname === ""
        ? "/de"
        : pathname;
  url.searchParams.set("next", nextPath);
  return url;
}

export async function computeBetaAccessToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${TOKEN_PREFIX}${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function isBetaCookieValid(
  cookieValue: string | undefined,
): Promise<boolean> {
  const password = process.env.BETA_PASSWORD?.trim();
  if (!password) {
    return true;
  }
  if (!cookieValue) {
    return false;
  }
  const expected = await computeBetaAccessToken(password);
  return cookieValue === expected;
}

export async function hasValidBetaAccess(request: NextRequest): Promise<boolean> {
  return isBetaCookieValid(request.cookies.get(BETA_ACCESS_COOKIE)?.value);
}

export async function verifyBetaPassword(password: string): Promise<boolean> {
  const expected = process.env.BETA_PASSWORD?.trim();
  if (!expected) {
    return true;
  }
  return password === expected;
}
