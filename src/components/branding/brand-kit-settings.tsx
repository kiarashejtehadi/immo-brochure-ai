"use client";

import { useRef, useState } from "react";
import { ProBadge } from "@/components/billing/upgrade-pro-modal";
import { BRAND_FONT_OPTIONS } from "@/lib/branding/font-family";
import type { UiLocale } from "@/lib/i18n";
import { getBrandKitCopy } from "@/lib/i18n-branding";
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_PRIMARY_COLOR,
  type BrandFontFamily,
  type UserBrandingProfile,
} from "@/types/branding";
import { readJsonResponse } from "@/lib/http/read-json-response";
import { cn } from "@/lib/utils";

type BrandKitSettingsProps = {
  locale: UiLocale;
  branding: UserBrandingProfile;
  onBrandingChange: (patch: Partial<UserBrandingProfile>) => void;
  isPro: boolean;
  creditPackOnly: boolean;
  onUpgrade: () => void;
  onError: (message: string) => void;
  onMessage: (message: string) => void;
  onSaveKit: () => Promise<void>;
  saving: boolean;
};

export function BrandKitSettings({
  locale,
  branding,
  onBrandingChange,
  isPro,
  creditPackOnly,
  onUpgrade,
  onError,
  onMessage,
  onSaveKit,
  saving,
}: BrandKitSettingsProps) {
  const copy = getBrandKitCopy(locale);
  const logoRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const proLocked = !isPro;

  async function uploadAsset(
    endpoint: "/api/branding/logo" | "/api/branding/avatar",
    file: File,
    onSuccess: (url: string) => void,
  ) {
    if (!isPro) {
      onUpgrade();
      return;
    }
    const setUploading = endpoint === "/api/branding/logo" ? setUploadingLogo : setUploadingAvatar;
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const data = await readJsonResponse<{
        logoUrl?: string;
        agentAvatarUrl?: string;
        branding?: UserBrandingProfile;
        error?: string;
      }>(res);
      if (!res.ok) throw new Error(data.error ?? copy.uploadFailed);
      if (data.branding) onBrandingChange(data.branding);
      const url = data.logoUrl ?? data.agentAvatarUrl;
      if (url) onSuccess(url);
      onMessage(endpoint === "/api/branding/logo" ? copy.logoUploaded : copy.avatarUploaded);
    } catch (err) {
      onError(err instanceof Error ? err.message : copy.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section
      className={cn(
        "space-y-6 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-700",
        creditPackOnly && "pointer-events-none opacity-50 grayscale-[0.15]",
      )}
    >
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {copy.title}
          </h3>
          <ProBadge />
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{copy.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">{copy.agencyLogo}</h4>
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
              ref={logoRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void uploadAsset("/api/branding/logo", file, (url) =>
                    onBrandingChange({ logoUrl: url }),
                  );
                }
              }}
            />
            <button
              type="button"
              disabled={uploadingLogo || creditPackOnly}
              onClick={() => (isPro ? logoRef.current?.click() : onUpgrade())}
              className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600"
            >
              {uploadingLogo ? copy.uploading : isPro ? copy.uploadLogo : copy.uploadLogoPro}
            </button>
          </div>
          <p className="text-xs text-zinc-500">{copy.logoHint}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">{copy.agentAvatar}</h4>
          <div className="flex flex-wrap items-center gap-4">
            {branding.agentAvatarUrl && isPro ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.agentAvatarUrl}
                alt={copy.agentAvatarAlt}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-zinc-300 text-xs text-zinc-400">
                {copy.noAvatar}
              </div>
            )}
            <input
              ref={avatarRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void uploadAsset("/api/branding/avatar", file, (url) =>
                    onBrandingChange({ agentAvatarUrl: url }),
                  );
                }
              }}
            />
            <button
              type="button"
              disabled={uploadingAvatar || creditPackOnly}
              onClick={() => (isPro ? avatarRef.current?.click() : onUpgrade())}
              className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600"
            >
              {uploadingAvatar ? copy.uploading : isPro ? copy.uploadAvatar : copy.uploadAvatarPro}
            </button>
          </div>
          <p className="text-xs text-zinc-500">{copy.avatarHint}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{copy.primaryColor}</span>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="color"
              value={branding.brandColor ?? DEFAULT_PRIMARY_COLOR}
              disabled={proLocked || creditPackOnly}
              onChange={(e) => onBrandingChange({ brandColor: e.target.value })}
              onClick={() => {
                if (!isPro) onUpgrade();
              }}
              className="h-10 w-14 cursor-pointer rounded border border-zinc-200 disabled:cursor-not-allowed"
            />
            <input
              type="text"
              value={branding.brandColor ?? ""}
              disabled={proLocked || creditPackOnly}
              onChange={(e) => onBrandingChange({ brandColor: e.target.value })}
              placeholder={DEFAULT_PRIMARY_COLOR}
              className="w-28 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{copy.accentColor}</span>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="color"
              value={branding.accentColor ?? DEFAULT_ACCENT_COLOR}
              disabled={proLocked || creditPackOnly}
              onChange={(e) => onBrandingChange({ accentColor: e.target.value })}
              onClick={() => {
                if (!isPro) onUpgrade();
              }}
              className="h-10 w-14 cursor-pointer rounded border border-zinc-200 disabled:cursor-not-allowed"
            />
            <input
              type="text"
              value={branding.accentColor ?? ""}
              disabled={proLocked || creditPackOnly}
              onChange={(e) => onBrandingChange({ accentColor: e.target.value })}
              placeholder={DEFAULT_ACCENT_COLOR}
              className="w-28 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{copy.fontFamily}</span>
        <select
          value={branding.fontFamily ?? "modern"}
          disabled={proLocked || creditPackOnly}
          onChange={(e) =>
            onBrandingChange({ fontFamily: e.target.value as BrandFontFamily })
          }
          className="mt-1 w-full cursor-pointer rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        >
          {BRAND_FONT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {copy[option.labelKey]}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{copy.customLegalImprint}</span>
        <textarea
          rows={4}
          value={branding.customLegalImprint ?? ""}
          onChange={(e) =>
            onBrandingChange({ customLegalImprint: e.target.value || null })
          }
          placeholder={copy.customLegalImprintPlaceholder}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <p className="mt-1 text-xs text-zinc-500">{copy.customLegalImprintHint}</p>
      </label>

      <button
        type="button"
        disabled={saving || creditPackOnly}
        onClick={() => void onSaveKit()}
        className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? copy.saving : copy.saveBrandKit}
      </button>
    </section>
  );
}
