import type { NextRequest } from "next/server";

export const BETA_ACCESS_COOKIE = "beta_access";

const TOKEN_PREFIX = "beta-v1:";

export function isBetaProtectionEnabled(): boolean {
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
  if (isBetaPublicPath(path)) {
    return "/";
  }
  return path;
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
