"use client";

import type { BrandKitCopy } from "@/lib/i18n-branding";
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_PRIMARY_COLOR,
  type UserBrandingProfile,
} from "@/types/branding";

type BrandKitPreviewProps = {
  branding: UserBrandingProfile;
  copy: BrandKitCopy;
};

export function BrandKitPreview({ branding, copy }: BrandKitPreviewProps) {
  const primary = branding.brandColor?.trim() || DEFAULT_PRIMARY_COLOR;
  const accent = branding.accentColor?.trim() || DEFAULT_ACCENT_COLOR;
  const agency = branding.agencyName?.trim() || copy.previewAgencyFallback;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {copy.previewTitle}
      </p>
      <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700">
        <div className="h-1.5" style={{ backgroundColor: primary }} />
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt=""
              className="max-h-8 max-w-[100px] object-contain"
            />
          ) : (
            <span className="text-[10px] text-zinc-400">{copy.previewLogoPlaceholder}</span>
          )}
          <span
            className="rounded px-2 py-0.5 text-[9px] font-bold text-white"
            style={{ backgroundColor: primary }}
          >
            {copy.previewBadge}
          </span>
        </div>
        <div className="space-y-1 px-3 pb-3">
          <p className="text-sm font-bold leading-tight text-zinc-900">{copy.previewSampleTitle}</p>
          <p className="text-[10px] text-zinc-500">{copy.previewSampleAddress}</p>
          <p className="text-[10px] font-semibold" style={{ color: accent }}>
            {agency}
          </p>
        </div>
        <div className="flex gap-1 border-t border-zinc-100 px-3 py-2 dark:border-zinc-800">
          <span
            className="h-3 w-3 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: primary }}
            title={copy.primaryColor}
          />
          <span
            className="h-3 w-3 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: accent }}
            title={copy.accentColor}
          />
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        {copy.previewHint}
      </p>
    </div>
  );
}
