"use client";

import { BRAND_FONT_OPTIONS, cssFontFamily } from "@/lib/branding/font-family";
import type { BrandKitCopy } from "@/lib/i18n-branding";
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_PRIMARY_COLOR,
  type UserBrandingProfile,
} from "@/types/branding";
import { cn } from "@/lib/utils";

export type BrandKitCoverArtProps = {
  branding: UserBrandingProfile;
  copy: BrandKitCopy;
  size?: "mini" | "large";
  showColorSwatches?: boolean;
  onPrimaryColorChange?: (color: string) => void;
  onAccentColorChange?: (color: string) => void;
  colorsEditable?: boolean;
  onColorsLocked?: () => void;
};

function ColorSwatch({
  color,
  label,
  editable,
  onChange,
  onLocked,
  size,
}: {
  color: string;
  label: string;
  editable?: boolean;
  onChange?: (color: string) => void;
  onLocked?: () => void;
  size: "mini" | "large";
}) {
  const inputId = `brand-color-${label.replace(/\s+/g, "-").toLowerCase()}-${size}`;

  return (
    <label
      htmlFor={editable ? inputId : undefined}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        if (!editable) {
          e.preventDefault();
          onLocked?.();
        }
      }}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-1.5 py-0.5 dark:border-zinc-700 dark:bg-zinc-900",
        !editable && "cursor-not-allowed opacity-70",
        size === "large" && "px-2 py-1",
      )}
    >
      <span
        className={cn(
          "rounded-full border border-white shadow-sm",
          size === "large" ? "h-4 w-4" : "h-3 w-3",
        )}
        style={{ backgroundColor: color }}
      />
      {size === "large" ? (
        <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      ) : null}
      {editable ? (
        <input
          id={inputId}
          type="color"
          value={color}
          onChange={(e) => onChange?.(e.target.value)}
          className="sr-only"
        />
      ) : null}
    </label>
  );
}

export function BrandKitCoverArt({
  branding,
  copy,
  size = "mini",
  showColorSwatches = true,
  onPrimaryColorChange,
  onAccentColorChange,
  colorsEditable,
  onColorsLocked,
}: BrandKitCoverArtProps) {
  const primary = branding.brandColor?.trim() || DEFAULT_PRIMARY_COLOR;
  const accent = branding.accentColor?.trim() || DEFAULT_ACCENT_COLOR;
  const agency = branding.agencyName?.trim() || copy.previewAgencyFallback;
  const agentName = branding.brokerName?.trim() || copy.previewAgentFallback;
  const fontStack = cssFontFamily(branding.fontFamily);
  const fontLabel =
    copy[BRAND_FONT_OPTIONS.find((o) => o.value === branding.fontFamily)?.labelKey ?? "fontModern"];
  const large = size === "large";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-950",
        large ? "text-base" : "text-[10px]",
      )}
      style={{ fontFamily: fontStack }}
    >
      <div className={cn("w-full", large ? "h-2" : "h-1.5")} style={{ backgroundColor: primary }} />

      <div className={cn("flex items-center justify-between gap-2", large ? "px-5 py-3" : "px-3 py-2")}>
        <div className="min-w-0 flex-1">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={branding.logoUrl}
              src={branding.logoUrl}
              alt={copy.agencyLogoAlt}
              className={cn(
                "object-contain object-left",
                large ? "max-h-12 max-w-[180px]" : "max-h-8 max-w-[100px]",
              )}
            />
          ) : (
            <span className="text-zinc-400">{copy.previewLogoPlaceholder}</span>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 rounded font-bold text-white",
            large ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[9px]",
          )}
          style={{ backgroundColor: primary }}
        >
          {copy.previewBadge}
        </span>
      </div>

      <div className={cn("flex gap-3", large ? "px-5 pb-4" : "px-3 pb-2")}>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-400 dark:bg-zinc-800",
            large ? "h-36 w-[52%] text-xs" : "h-16 w-[52%] text-[8px]",
          )}
        >
          {copy.previewCoverPhotoPlaceholder}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <p
            className={cn(
              "font-bold leading-tight text-zinc-900 dark:text-zinc-50",
              large ? "text-xl" : "text-sm",
            )}
          >
            {copy.previewSampleTitle}
          </p>
          <p className={cn("text-zinc-500", large ? "mt-1 text-sm" : "text-[10px]")}>
            {copy.previewSampleAddress}
          </p>
        </div>
      </div>

      <div className={cn("grid grid-cols-3 gap-2", large ? "px-5 pb-4" : "px-3 pb-2")}>
        {[
          { label: copy.previewMetricPrice, value: "€ 1.250" },
          { label: copy.previewMetricSize, value: "85 m²" },
          { label: copy.previewMetricRooms, value: "3" },
        ].map((metric) => (
          <div
            key={metric.label}
            className={cn(
              "rounded-md border text-center",
              large ? "px-2 py-2" : "px-1 py-1",
            )}
            style={{ borderColor: accent }}
          >
            <p className={cn("uppercase text-zinc-500", large ? "text-[9px]" : "text-[7px]")}>
              {metric.label}
            </p>
            <p
              className={cn("font-bold", large ? "text-sm" : "text-[10px]")}
              style={{ color: accent }}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className={cn("border-t border-zinc-100 dark:border-zinc-800", large ? "px-5 py-4" : "px-3 py-2")}>
        <p
          className={cn(
            "font-bold uppercase tracking-wide",
            large ? "mb-2 text-xs" : "mb-1 text-[8px]",
          )}
          style={{ color: accent }}
        >
          {copy.previewContactHeading}
        </p>
        <div
          className={cn(
            "flex items-start gap-2 rounded-md border",
            large ? "p-3" : "p-2",
          )}
          style={{ borderColor: accent }}
        >
          {branding.agentAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={branding.agentAvatarUrl}
              src={branding.agentAvatarUrl}
              alt={copy.agentAvatarAlt}
              className={cn(
                "shrink-0 rounded-full object-cover",
                large ? "h-14 w-14" : "h-8 w-8",
              )}
            />
          ) : (
            <div
              className={cn(
                "shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700",
                large ? "h-14 w-14" : "h-8 w-8",
              )}
            />
          )}
          <div className="min-w-0">
            <p className={cn("font-bold text-zinc-900 dark:text-zinc-50", large ? "text-sm" : "text-[10px]")}>
              {agentName}
            </p>
            <p className={cn("text-zinc-600 dark:text-zinc-400", large ? "text-xs" : "text-[9px]")}>
              {agency}
            </p>
            {branding.contactPhone?.trim() ? (
              <p className={cn("text-zinc-500", large ? "text-xs" : "text-[9px]")}>
                {branding.contactPhone.trim()}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {showColorSwatches ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 border-t border-zinc-100 dark:border-zinc-800",
            large ? "px-5 py-3" : "px-3 py-2",
          )}
        >
          <ColorSwatch
            color={primary}
            label={copy.primaryColor}
            editable={colorsEditable}
            onChange={onPrimaryColorChange}
            onLocked={onColorsLocked}
            size={size}
          />
          <ColorSwatch
            color={accent}
            label={copy.accentColor}
            editable={colorsEditable}
            onChange={onAccentColorChange}
            onLocked={onColorsLocked}
            size={size}
          />
          <span className={cn("ml-auto text-zinc-400", large ? "text-[10px]" : "text-[8px]")}>
            {fontLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
}
