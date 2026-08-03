"use client";

import { useRef, useState } from "react";
import { BrandKitPreview } from "@/components/branding/brand-kit-preview";
import { BrandUploadDropzone } from "@/components/branding/brand-upload-dropzone";
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

function mergeUploadedBranding(
  patch: Partial<UserBrandingProfile>,
  response?: Partial<UserBrandingProfile>,
): Partial<UserBrandingProfile> {
  const merged: Partial<UserBrandingProfile> = { ...patch };
  if (!response) return merged;

  for (const [key, value] of Object.entries(response) as [keyof UserBrandingProfile, unknown][]) {
    if (value != null && value !== "") {
      merged[key] = value as never;
    }
  }
  return merged;
}

type BrandKitSettingsProps = {
  locale: UiLocale;
  branding: UserBrandingProfile;
  onBrandingChange: (patch: Partial<UserBrandingProfile>) => void;
  isPro: boolean;
  creditPackOnly: boolean;
  onUpgrade: () => void;
  onError: (message: string | null) => void;
  onMessage: (message: string | null) => void;
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
    inputRef: React.RefObject<HTMLInputElement | null>,
    field: "logoUrl" | "agentAvatarUrl",
  ) {
    if (!isPro) {
      onUpgrade();
      return;
    }
    const setUploading = field === "logoUrl" ? setUploadingLogo : setUploadingAvatar;
    setUploading(true);
    onError(null);
    onMessage(null);
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
      }>(res, "Upload");
      if (!res.ok) throw new Error(data.error ?? copy.uploadFailed);

      const uploadedUrl = data[field];
      onBrandingChange(
        mergeUploadedBranding(
          uploadedUrl ? { [field]: uploadedUrl } : {},
          data.branding,
        ),
      );
      onMessage(field === "logoUrl" ? copy.logoUploaded : copy.avatarUploaded);
    } catch (err) {
      onError(err instanceof Error ? err.message : copy.uploadFailed);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section
      className={cn(
        "space-y-6 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-700",
        creditPackOnly && "pointer-events-none opacity-50 grayscale-[0.15]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {copy.title}
            </h3>
            <ProBadge />
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{copy.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_240px]">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{copy.agencyLogo}</h4>
              <BrandUploadDropzone
                variant="logo"
                imageUrl={branding.logoUrl}
                alt={copy.agencyLogoAlt}
                hint={copy.logoHint}
                dropLabel={copy.logoDropLabel}
                uploadingLabel={copy.uploading}
                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                disabled={creditPackOnly || !isPro}
                uploading={uploadingLogo}
                onDisabledClick={onUpgrade}
                onFile={(file) => void uploadAsset("/api/branding/logo", file, logoRef, "logoUrl")}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{copy.agentAvatar}</h4>
              <BrandUploadDropzone
                variant="avatar"
                imageUrl={branding.agentAvatarUrl}
                alt={copy.agentAvatarAlt}
                hint={copy.avatarHint}
                dropLabel={copy.avatarDropLabel}
                uploadingLabel={copy.uploading}
                accept="image/png,image/jpeg,image/webp"
                disabled={creditPackOnly || !isPro}
                uploading={uploadingAvatar}
                onDisabledClick={onUpgrade}
                onFile={(file) =>
                  void uploadAsset("/api/branding/avatar", file, avatarRef, "agentAvatarUrl")
                }
              />
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
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <BrandKitPreview branding={branding} copy={copy} />
        </div>
      </div>
    </section>
  );
}
