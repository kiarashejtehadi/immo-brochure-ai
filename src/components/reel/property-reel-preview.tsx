"use client";

import { useCallback, useMemo, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { Lock } from "lucide-react";
import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import { PropertyReel } from "@/remotion/PropertyReel";
import {
  PROPERTY_REEL_COMPOSITION_ID,
  PROPERTY_REEL_DURATION_FRAMES,
  PROPERTY_REEL_FPS,
  PROPERTY_REEL_HEIGHT,
  PROPERTY_REEL_WIDTH,
} from "@/remotion/constants";
import type { PropertyReelProps, ReelBrokerContact } from "@/types/property-reel";
import {
  buildPropertyReelProps,
  downloadBlob,
  photosToDataUrls,
} from "@/lib/property-reel";
import { hasProReelAccess } from "@/lib/billing/client-access";
import { logoUrlToDataUrl } from "@/lib/branding/pdf-branding";
import { ProBadge, UpgradeProModal } from "@/components/billing/upgrade-pro-modal";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { readJsonResponse } from "@/lib/http/read-json-response";
import { cn } from "@/lib/utils";

const RemotionPlayer = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-[9/16] w-full max-w-[280px] items-center justify-center rounded-xl bg-zinc-100 text-sm text-zinc-500 dark:bg-zinc-800">
        …
      </div>
    ),
  },
);

type ReelPreviewCopy = {
  exportReel: string;
  exportingReel: string;
  reelHint: string;
  reelExportUnsupported: string;
  reelExportFailed: string;
  reelProOnly: string;
};

export type PropertyReelPreviewInput = {
  photoFiles: File[];
  photoPreviewUrls: string[];
  transactionType: Parameters<typeof buildPropertyReelProps>[0]["transactionType"];
  currency: Parameters<typeof buildPropertyReelProps>[0]["currency"];
  address: string;
  size: string;
  rooms: string;
  property: Parameters<typeof buildPropertyReelProps>[0]["property"];
  rent: Parameters<typeof buildPropertyReelProps>[0]["rent"];
  sale: Parameters<typeof buildPropertyReelProps>[0]["sale"];
  formCopy: Parameters<typeof buildPropertyReelProps>[0]["formCopy"];
  priceOnRequestLabel: string;
  perMonthSuffix: string;
  headline?: string;
  agencyLogoUrl?: string;
  brandColor?: string;
  brokerContact?: ReelBrokerContact;
};

export function PropertyReelPreview({
  input,
  copy,
  locale,
  onSignIn,
  className,
}: {
  input: PropertyReelPreviewInput;
  copy: ReelPreviewCopy;
  locale: string;
  onSignIn?: () => void;
  className?: string;
}) {
  const { status } = useBillingStatus();
  const proReelAccess = hasProReelAccess(status);
  const signedIn = Boolean(status?.email);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const previewProps = useMemo(
    (): PropertyReelProps =>
      buildPropertyReelProps({
        photoUrls: input.photoPreviewUrls,
        transactionType: input.transactionType,
        currency: input.currency,
        address: input.address,
        size: input.size,
        rooms: input.rooms,
        property: input.property,
        rent: input.rent,
        sale: input.sale,
        formCopy: input.formCopy,
        priceOnRequestLabel: input.priceOnRequestLabel,
        perMonthSuffix: input.perMonthSuffix,
        headline: input.headline,
        agencyLogoUrl: input.agencyLogoUrl,
        brandColor: input.brandColor,
        brokerContact: input.brokerContact,
      }),
    [input],
  );

  const handleExport = useCallback(async () => {
    setExporting(true);
    setExportError(null);
    setExportProgress(0);

    try {
      const authRes = await fetch("/api/reel/export", {
        method: "POST",
        credentials: "same-origin",
      });
      const authData = await readJsonResponse<{ ok?: boolean; error?: string; code?: string }>(
        authRes,
      );

      if (!authRes.ok) {
        throw new Error(authData.error ?? copy.reelProOnly);
      }

      const readiness = await canRenderMediaOnWeb({
        container: "mp4",
        width: PROPERTY_REEL_WIDTH,
        height: PROPERTY_REEL_HEIGHT,
      });

      if (!readiness.canRender) {
        throw new Error(copy.reelExportUnsupported);
      }

      const dataUrlPhotos =
        input.photoFiles.length > 0
          ? await photosToDataUrls(input.photoFiles.slice(0, 5))
          : [];

      let agencyLogoUrl = input.agencyLogoUrl;
      if (agencyLogoUrl) {
        agencyLogoUrl =
          (await logoUrlToDataUrl(agencyLogoUrl)) ?? agencyLogoUrl;
      }

      const exportProps = buildPropertyReelProps({
        photoUrls: dataUrlPhotos,
        transactionType: input.transactionType,
        currency: input.currency,
        address: input.address,
        size: input.size,
        rooms: input.rooms,
        property: input.property,
        rent: input.rent,
        sale: input.sale,
        formCopy: input.formCopy,
        priceOnRequestLabel: input.priceOnRequestLabel,
        perMonthSuffix: input.perMonthSuffix,
        headline: input.headline,
        agencyLogoUrl,
        brandColor: input.brandColor,
        brokerContact: input.brokerContact,
      });

      const { getBlob } = await renderMediaOnWeb({
        composition: {
          component: PropertyReel,
          durationInFrames: PROPERTY_REEL_DURATION_FRAMES,
          fps: PROPERTY_REEL_FPS,
          width: PROPERTY_REEL_WIDTH,
          height: PROPERTY_REEL_HEIGHT,
          id: PROPERTY_REEL_COMPOSITION_ID,
          defaultProps: exportProps,
        },
        inputProps: exportProps,
        onProgress: ({ progress }) => {
          setExportProgress(Math.round(progress * 100));
        },
      });

      const blob = await getBlob();
      const slug = exportProps.location
        ? exportProps.location.replace(/[^\w]+/g, "-").slice(0, 40)
        : "property";
      downloadBlob(blob, `property-reel-${slug}.mp4`);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : copy.reelExportFailed);
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  }, [copy.reelExportFailed, copy.reelExportUnsupported, copy.reelProOnly, input]);

  function handleExportClick() {
    if (!proReelAccess) {
      setExportError(null);
      if (!signedIn) {
        onSignIn?.();
        return;
      }
      setUpgradeOpen(true);
      return;
    }
    void handleExport();
  }

  return (
    <>
      <div className={cn("flex flex-col items-center gap-4", className)}>
        <div className="w-full max-w-[280px] overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-700">
          <RemotionPlayer
            component={PropertyReel as ComponentType<Record<string, unknown>>}
            inputProps={previewProps as Record<string, unknown>}
            durationInFrames={PROPERTY_REEL_DURATION_FRAMES}
            compositionWidth={PROPERTY_REEL_WIDTH}
            compositionHeight={PROPERTY_REEL_HEIGHT}
            fps={PROPERTY_REEL_FPS}
            style={{
              width: "100%",
              aspectRatio: "9 / 16",
            }}
            controls
            loop
            acknowledgeRemotionLicense
          />
        </div>

        <div className="w-full max-w-sm space-y-2">
          <button
            type="button"
            onClick={handleExportClick}
            disabled={exporting && proReelAccess}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
              proReelAccess
                ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-500"
                : "border-zinc-300 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
            )}
          >
            {!proReelAccess ? <Lock className="h-4 w-4 shrink-0" aria-hidden /> : null}
            <span>
              {exporting && proReelAccess
                ? exportProgress !== null
                  ? `${copy.exportingReel} (${exportProgress}%)`
                  : copy.exportingReel
                : copy.exportReel}
            </span>
            {!proReelAccess ? <ProBadge /> : null}
          </button>

          {!proReelAccess ? (
            <p className="text-center text-xs leading-relaxed text-amber-800 dark:text-amber-200">
              {copy.reelProOnly}
            </p>
          ) : (
            <p className="text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {copy.reelHint}
            </p>
          )}

          {exportError ? (
            <p className="text-center text-xs text-red-600 dark:text-red-400" role="alert">
              {exportError}
            </p>
          ) : null}
        </div>
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
