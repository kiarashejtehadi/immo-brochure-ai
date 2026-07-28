"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  consumePostAuthRedirect,
  resolvePathAfterSignIn,
} from "@/lib/supabase/auth-redirect";
import { refreshBrowserAuthSession } from "@/lib/supabase/client-session";

function normalizeOtpType(raw: string | null): EmailOtpType | null {
  if (!raw) return null;
  const allowed: EmailOtpType[] = [
    "magiclink",
    "signup",
    "invite",
    "recovery",
    "email_change",
    "email",
  ];
  if (allowed.includes(raw as EmailOtpType)) return raw as EmailOtpType;
  if (raw === "email_change_new") return "email_change";
  return null;
}

async function verifyTokenHash(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  tokenHash: string,
  primaryType: EmailOtpType,
): Promise<{ error: Error | null }> {
  const types: EmailOtpType[] = [primaryType, "email", "magiclink", "signup"];
  const seen = new Set<string>();
  let lastError: Error | null = null;
  for (const type of types) {
    if (seen.has(type)) continue;
    seen.add(type);
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) return { error: null };
    lastError = error;
  }
  return { error: lastError ?? new Error("Token verification failed.") };
}

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    async function goAfterAuth(storedOrNext: string) {
      await refreshBrowserAuthSession();
      const dest = await resolvePathAfterSignIn(storedOrNext, { defaultToCheckout: true });
      if (!cancelled) {
        router.refresh();
        router.replace(dest);
      }
    }

    async function completeAuth() {
      try {
        const supabase = createSupabaseBrowserClient();
        const nextParam = searchParams.get("next");
        const storedPath = nextParam?.startsWith("/")
          ? nextParam
          : consumePostAuthRedirect("/de");

        const providerError =
          searchParams.get("error_description") ?? searchParams.get("error");
        if (providerError) {
          router.replace(`/en?auth=error&reason=${encodeURIComponent(providerError)}`);
          return;
        }

        const hash =
          typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          await goAfterAuth(storedPath);
          return;
        }

        const tokenHash = searchParams.get("token_hash");
        const type = normalizeOtpType(searchParams.get("type"));
        if (tokenHash && type) {
          const { error } = await verifyTokenHash(supabase, tokenHash, type);
          if (error) throw error;
          await goAfterAuth(storedPath);
          return;
        }

        const email = searchParams.get("email");
        const token = searchParams.get("token");
        if (email && token) {
          const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "email",
          });
          if (error) throw error;
          await goAfterAuth(storedPath);
          return;
        }

        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
              await goAfterAuth(storedPath);
              return;
            }
            throw new Error(
              `${error.message} (redirect URL in email must match this site: ${window.location.origin}/auth/callback)`,
            );
          }
          await goAfterAuth(storedPath);
          return;
        }

        router.replace("/en?auth=error&reason=missing_auth_params");
      } catch (err) {
        const reason = err instanceof Error ? err.message : "sign_in_failed";
        if (!cancelled) {
          setMessage("Sign-in failed. Redirecting…");
          router.replace(`/en?auth=error&reason=${encodeURIComponent(reason.slice(0, 120))}`);
        }
      }
    }

    void completeAuth();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="mx-auto flex min-h-[40vh] max-w-md items-center justify-center px-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
    </main>
  );
}
