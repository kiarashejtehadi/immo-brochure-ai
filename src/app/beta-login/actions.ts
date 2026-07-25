"use server";

import {
  BETA_ACCESS_COOKIE,
  computeBetaAccessToken,
  isBetaProtectionEnabled,
  sanitizeBetaRedirect,
  verifyBetaPassword,
} from "@/lib/beta-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type BetaLoginState = {
  error?: string;
};

export async function submitBetaLogin(
  _prev: BetaLoginState,
  formData: FormData,
): Promise<BetaLoginState> {
  if (!isBetaProtectionEnabled()) {
    redirect(sanitizeBetaRedirect(formData.get("redirect")?.toString()));
  }

  const password = formData.get("password")?.toString() ?? "";
  const redirectTo = sanitizeBetaRedirect(formData.get("redirect")?.toString());

  if (!(await verifyBetaPassword(password))) {
    return { error: "Incorrect password. Please try again." };
  }

  const token = await computeBetaAccessToken(process.env.BETA_PASSWORD!.trim());
  const cookieStore = await cookies();
  cookieStore.set(BETA_ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(redirectTo);
}
