"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { hasPurchasedBillingAccess, isCreditPackPlan } from "@/lib/billing/client-access";
import { BrandKitSettings } from "@/components/branding/brand-kit-settings";
import { BrandingProGate } from "@/components/branding/branding-pro-gate";
import { AccountDangerZone } from "@/components/settings/account-danger-zone";
import { ProBadge, UpgradeProModal } from "@/components/billing/upgrade-pro-modal";
import { SettingsNav } from "@/components/settings/settings-nav";
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_PRIMARY_COLOR,
  type UserBrandingProfile,
} from "@/types/branding";
import { readJsonResponse } from "@/lib/http/read-json-response";
import type { UiLocale } from "@/lib/i18n";
import { getBillingCopy } from "@/lib/i18n-billing";
import {
  formatTrialCreditsLeft,
  getBrandingCopy,
  getBrandingFieldLabels,
} from "@/lib/i18n-branding";

const emptyBranding = (): UserBrandingProfile => ({
  logoUrl: null,
  brandColor: DEFAULT_PRIMARY_COLOR,
  accentColor: DEFAULT_ACCENT_COLOR,
  agentAvatarUrl: null,
  fontFamily: "modern",
  customLegalImprint: null,
  agencyName: null,
  brokerName: null,
  contactPhone: null,
  contactEmail: null,
  website: null,
});

export function BrandingSettingsForm({ locale }: { locale: string }) {
  const uiLocale = locale as UiLocale;
  const billingCopy = getBillingCopy(uiLocale);
  const copy = getBrandingCopy(uiLocale);
  const fieldLabels = getBrandingFieldLabels(uiLocale);
  const { status, refresh } = useBillingStatus();
  const [branding, setBranding] = useState<UserBrandingProfile>(emptyBranding());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const isPro = status?.isPro === true;
  const cleanPdfExports = hasPurchasedBillingAccess(status);
  const creditPackOnly = isCreditPackPlan(status);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/branding/profile", { credentials: "same-origin" });
      if (res.status === 401) {
        setError(copy.signInToManage);
        return;
      }
      const data = await readJsonResponse<{ branding?: UserBrandingProfile }>(res);
      if (data.branding) {
        setBranding((prev) => ({
          ...prev,
          ...data.branding,
          brandColor: data.branding?.brandColor ?? DEFAULT_PRIMARY_COLOR,
          accentColor: data.branding?.accentColor ?? DEFAULT_ACCENT_COLOR,
          fontFamily: data.branding?.fontFamily ?? "modern",
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [copy.loadFailed, copy.signInToManage]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveContactFields() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/branding/profile", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: branding.agencyName,
          brokerName: branding.brokerName,
          contactPhone: branding.contactPhone,
          contactEmail: branding.contactEmail,
          website: branding.website,
        }),
      });
      const data = await readJsonResponse<{ branding?: UserBrandingProfile; error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? copy.saveFailed);
      if (data.branding) setBranding((b) => ({ ...b, ...data.branding }));
      setMessage(copy.saved);
      void refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function saveBrandKit() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/branding/profile", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isPro
            ? {
                brandColor: branding.brandColor,
                accentColor: branding.accentColor,
                fontFamily: branding.fontFamily,
              }
            : {}),
          customLegalImprint: branding.customLegalImprint,
        }),
      });
      const data = await readJsonResponse<{ branding?: UserBrandingProfile; error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? copy.saveFailed);
      if (data.branding) setBranding((b) => ({ ...b, ...data.branding }));
      setMessage(copy.saved);
      void refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">{copy.loadingBranding}</p>;
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/create"
          className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {billingCopy.backToStudio}
        </Link>
      </div>

      <SettingsNav />

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{copy.settingsTitle}</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{copy.settingsSubtitle}</p>
          {status?.trialCredits ? (
            <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
              {formatTrialCreditsLeft(uiLocale, status.trialCredits)}
            </p>
          ) : null}
        </div>

        {creditPackOnly ? (
          <BrandingProGate onUpgrade={() => setUpgradeOpen(true)} />
        ) : null}

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        {message ? <p className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}

        <BrandKitSettings
          locale={uiLocale}
          branding={branding}
          onBrandingChange={(patch) => setBranding((b) => ({ ...b, ...patch }))}
          isPro={isPro}
          creditPackOnly={creditPackOnly}
          onUpgrade={() => setUpgradeOpen(true)}
          onError={setError}
          onMessage={setMessage}
          onSaveKit={saveBrandKit}
          saving={saving}
        />

        <section className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["agencyName", fieldLabels.agencyName],
              ["brokerName", fieldLabels.brokerName],
              ["contactPhone", fieldLabels.contactPhone],
              ["contactEmail", fieldLabels.contactEmail],
              ["website", fieldLabels.website],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
              <input
                type={key === "contactEmail" ? "email" : key === "website" ? "url" : "text"}
                value={branding[key] ?? ""}
                onChange={(e) => setBranding((b) => ({ ...b, [key]: e.target.value || null }))}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          ))}
        </section>

        <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{copy.pdfWatermark}</h3>
            {!cleanPdfExports ? <ProBadge /> : null}
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {cleanPdfExports ? copy.pdfWatermarkClean : copy.pdfWatermarkTrial}
          </p>
          {!cleanPdfExports ? (
            <Link
              href="/pricing"
              className="mt-3 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              {copy.viewPlans}
            </Link>
          ) : null}
        </section>

        <button
          type="button"
          disabled={saving}
          onClick={() => void saveContactFields()}
          className="cursor-pointer rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saving ? copy.saving : copy.saveContactBranding}
        </button>
      </div>
      <UpgradeProModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        locale={locale}
        subscriptionOnly
      />
      <AccountDangerZone copy={billingCopy} />
    </>
  );
}
