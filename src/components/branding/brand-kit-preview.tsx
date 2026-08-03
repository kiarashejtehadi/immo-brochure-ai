"use client";

import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { BrandKitCoverArt } from "@/components/branding/brand-kit-cover-art";
import type { BrandKitCopy } from "@/lib/i18n-branding";
import type { UserBrandingProfile } from "@/types/branding";
import { cn } from "@/lib/utils";

type BrandKitPreviewProps = {
  branding: UserBrandingProfile;
  copy: BrandKitCopy;
  colorsEditable?: boolean;
  onPrimaryColorChange?: (color: string) => void;
  onAccentColorChange?: (color: string) => void;
  onColorsLocked?: () => void;
};

export function BrandKitPreview({
  branding,
  copy,
  colorsEditable,
  onPrimaryColorChange,
  onAccentColorChange,
  onColorsLocked,
}: BrandKitPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  return (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {copy.previewTitle}
        </p>

        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn(
            "group relative mt-3 w-full cursor-pointer text-left transition",
            "rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          )}
          aria-label={copy.previewExpandLabel}
        >
          <BrandKitCoverArt
            branding={branding}
            copy={copy}
            size="mini"
            colorsEditable={colorsEditable}
            onPrimaryColorChange={onPrimaryColorChange}
            onAccentColorChange={onAccentColorChange}
            onColorsLocked={onColorsLocked}
          />
          <span
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg",
              "bg-zinc-900/0 transition group-hover:bg-zinc-900/40",
            )}
          >
            <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-zinc-800 opacity-0 shadow transition group-hover:opacity-100">
              <Maximize2 className="h-3.5 w-3.5" aria-hidden />
              {copy.previewExpandHint}
            </span>
          </span>
        </button>

        <p className="mt-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {copy.previewHint}
        </p>
      </div>

      {expanded ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={copy.previewTitle}
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {copy.previewTitle}
              </h4>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="cursor-pointer rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                aria-label={copy.previewClose}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <BrandKitCoverArt
              branding={branding}
              copy={copy}
              size="large"
              colorsEditable={colorsEditable}
              onPrimaryColorChange={onPrimaryColorChange}
              onAccentColorChange={onAccentColorChange}
              onColorsLocked={onColorsLocked}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
