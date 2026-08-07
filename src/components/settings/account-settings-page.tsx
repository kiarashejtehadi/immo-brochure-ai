"use client";

import { Link } from "@/i18n/navigation";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { AccountDangerZone } from "@/components/settings/account-danger-zone";
import { SettingsNav } from "@/components/settings/settings-nav";
import type { UiLocale } from "@/lib/i18n";
import { getBillingCopy } from "@/lib/i18n-billing";

export function AccountSettingsPage({ locale }: { locale: string }) {
  const uiLocale = locale as UiLocale;
  const copy = getBillingCopy(uiLocale);
  const { status, loading } = useBillingStatus();
  const email = status?.email;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/create"
          className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {copy.backToStudio}
        </Link>
      </div>

      <SettingsNav />

      <div className="space-y-8">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {copy.settingsAccount}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {copy.settingsAccountSubtitle}
          </p>
        </div>

        <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {copy.account}
          </h2>
          {loading ? (
            <p className="mt-2 text-sm text-zinc-500">{copy.loading}</p>
          ) : email ? (
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{email}</p>
          ) : (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{copy.signIn}</p>
          )}
        </section>

        <AccountDangerZone copy={copy} />
      </div>
    </>
  );
}
