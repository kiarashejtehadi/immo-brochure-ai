"use client";

import { useState } from "react";
import { DeleteAccountModal } from "@/components/settings/delete-account-modal";
import { CopyToastProvider, useCopyToast } from "@/components/ui/copy-toast";
import type { BillingCopy } from "@/lib/i18n-billing";

function AccountDangerZoneInner({ copy }: { copy: BillingCopy }) {
  const { showToast } = useCopyToast();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="rounded-xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/60 dark:bg-red-950/20">
        <h2 className="text-sm font-semibold text-red-800 dark:text-red-300">
          {copy.dangerZoneTitle}
        </h2>
        <p className="mt-1 text-sm text-red-900/80 dark:text-red-200/80">
          {copy.dangerZoneDescription}
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-4 cursor-pointer rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
        >
          {copy.deleteAccountButton}
        </button>
      </section>

      <DeleteAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        copy={copy}
        onSuccess={() => {
          setModalOpen(false);
          showToast(copy.deleteAccountSuccess);
          window.setTimeout(() => {
            window.location.href = "/beta-login";
          }, 1200);
        }}
        onError={(message) => {
          showToast(message);
        }}
      />
    </>
  );
}

export function AccountDangerZone({ copy }: { copy: BillingCopy }) {
  return (
    <CopyToastProvider>
      <AccountDangerZoneInner copy={copy} />
    </CopyToastProvider>
  );
}
