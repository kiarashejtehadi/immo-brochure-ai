"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { authCallbackUrl, pathToSaveBeforeMagicLink, savePostAuthRedirect } from "@/lib/supabase/auth-redirect";
import type { UiLocale } from "@/lib/i18n";
import { getBillingCopy } from "@/lib/i18n-billing";
import { cn } from "@/lib/utils";

export function AuthEmailModal({
  open,
  onClose,
  onSent,
  redirectPath,
}: {
  open: boolean;
  onClose: () => void;
  onSent?: (email: string) => void;
  /** Override post-auth redirect (e.g. /de/checkout?plan=monthly). */
  redirectPath?: string;
}) {
  const locale = useLocale() as UiLocale;
  const copy = getBillingCopy(locale);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const nextPath =
        redirectPath ??
        pathToSaveBeforeMagicLink(window.location.pathname || "/de");
      savePostAuthRedirect(nextPath);
      const redirectTo = authCallbackUrl(window.location.origin);
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      if (signInError) throw signInError;
      setMessage(copy.authMagicLinkSent);
      onSent?.(email.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.authSendFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <h2 id="auth-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {copy.authTitle}
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{copy.authSubtitle}</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@agency.com"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {copy.authClose}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900",
                loading && "opacity-60",
              )}
            >
              {loading ? copy.authSending : copy.authSendMagicLink}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
