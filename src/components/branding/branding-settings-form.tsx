"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { hasPurchasedBillingAccess, isCreditPackPlan } from "@/lib/billing/client-access";
import { BrandingProGate } from "@/components/branding/branding-pro-gate";
import { ProBadge, UpgradeProModal } from "@/components/billing/upgrade-pro-modal";
import { SettingsNav } from "@/components/settings/settings-nav";
import { DEFAULT_BRAND_COLOR, type UserBrandingProfile } from "@/types/branding";
import { readJsonResponse } from "@/lib/http/read-json-response";
import type { UiLocale } from "@/lib/i18n";
import { getBillingCopy } from "@/lib/i18n-billing";
import {
  formatTrialCreditsLeft,
  getBrandingCopy,
  getBrandingFieldLabels,
} from "@/lib/i18n-branding";
import { cn } from "@/lib/utils";

export function BrandingSettingsForm({ locale }: { locale: string }) {
  const uiLocale = locale as UiLocale;
  const billingCopy = getBillingCopy(uiLocale);
  const copy = getBrandingCopy(uiLocale);
  const fieldLabels = getBrandingFieldLabels(uiLocale);
  const { status, refresh } = useBillingStatus();
  const [branding, setBranding] = useState<UserBrandingProfile>({
    logoUrl: null,
    brandColor: DEFAULT_BRAND_COLOR,
    agencyName: null,
    brokerName: null,
    contactPhone: null,
    contactEmail: null,
    website: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isPro = status?.isPro === true;
  const cleanPdfExports = hasPurchasedBillingAccess(status);
  const creditPackOnly = isCreditPackPlan(status);
  const proBrandingLocked = !isPro;

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
          brandColor: data.branding?.brandColor ?? DEFAULT_BRAND_COLOR,
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

  async function saveFields() {
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
          ...(isPro ? { brandColor: branding.brandColor } : {}),
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

  async function onLogoSelected(file: File | null) {
    if (!file) return;
    if (!isPro) {
      setUpgradeOpen(true);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/branding/logo", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const data = await readJsonResponse<{ logoUrl?: string; error?: string }>(res);
      if (!res.ok) throw new Error(data.error ?? copy.uploadFailed);
      setBranding((b) => ({ ...b, logoUrl: data.logoUrl ?? b.logoUrl }));
      setMessage(copy.logoUploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">{copy.loadingBranding}</p>;
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
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

        <div
          className={cn(
            "space-y-8",
            creditPackOnly && "pointer-events-none rounded-2xl opacity-50 grayscale-[0.15]",
          )}
        >
          <section className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{copy.agencyLogo}</h3>
              <ProBadge />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {branding.logoUrl && isPro ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={branding.logoUrl}
                  alt={copy.agencyLogoAlt}
                  className="h-14 max-w-[160px] object-contain"
                />
              ) : (
                <div className="flex h-14 w-32 items-center justify-center rounded border border-dashed border-zinc-300 text-xs text-zinc-400">
                  {copy.noLogo}
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => void onLogoSelected(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                disabled={uploading || creditPackOnly}
                onClick={() => (isPro ? fileRef.current?.click() : setUpgradeOpen(true))}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600"
              >
                {uploading ? copy.uploading : isPro ? copy.uploadLogo : copy.uploadLogoPro}
              </button>
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{copy.brandColor}</h3>
              <ProBadge />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.brandColor ?? DEFAULT_BRAND_COLOR}
                disabled={proBrandingLocked || creditPackOnly}
                onChange={(e) => setBranding((b) => ({ ...b, brandColor: e.target.value }))}
                onClick={() => {
                  if (!isPro) setUpgradeOpen(true);
                }}
                className="h-10 w-14 cursor-pointer rounded border border-zinc-200 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                value={branding.brandColor ?? ""}
                disabled={proBrandingLocked || creditPackOnly}
                onChange={(e) => setBranding((b) => ({ ...b, brandColor: e.target.value }))}
                className="w-28 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </section>
        </div>

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
          onClick={() => void saveFields()}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
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
    </>
  );
}
