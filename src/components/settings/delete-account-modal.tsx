"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LISTING_STUDIO_DRAFT_STORAGE_KEY } from "@/lib/listing-studio-draft";
import type { BillingCopy } from "@/lib/i18n-billing";
import { readJsonResponse } from "@/lib/http/read-json-response";
import { cn } from "@/lib/utils";

type DeleteAccountModalProps = {
  open: boolean;
  onClose: () => void;
  copy: BillingCopy;
  onSuccess: () => void;
  onError: (message: string) => void;
};

function clearClientSessionData(): void {
  try {
    sessionStorage.removeItem(LISTING_STUDIO_DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function DeleteAccountModal({
  open,
  onClose,
  copy,
  onSuccess,
  onError,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmText("");
      setDeleting(false);
    }
  }, [open]);

  if (!open) return null;

  const canConfirm = confirmText.trim() === "DELETE" && !deleting;

  async function handleConfirm() {
    if (!canConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await readJsonResponse<{ success?: boolean; error?: string }>(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? copy.deleteAccountFailed);
      }

      clearClientSessionData();
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
      } catch {
        /* server already cleared cookies */
      }

      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : copy.deleteAccountFailed);
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={deleting ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-account-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {copy.deleteAccountModalTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {copy.deleteAccountModalWarning}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {copy.deleteAccountModalSubscriptionNote}
        </p>

        <label className="mt-5 block text-sm">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {copy.deleteAccountConfirmLabel}
          </span>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={copy.deleteAccountConfirmPlaceholder}
            disabled={deleting}
            autoComplete="off"
            className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
          <span className="mt-1 block text-xs text-zinc-500">{copy.deleteAccountTypeHint}</span>
        </label>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {copy.deleteAccountCancel}
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!canConfirm}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50",
              "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500",
            )}
          >
            {deleting ? copy.deleteAccountDeleting : copy.deleteAccountConfirmButton}
          </button>
        </div>
      </div>
    </div>
  );
}
