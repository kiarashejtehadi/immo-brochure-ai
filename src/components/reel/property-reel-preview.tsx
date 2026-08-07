"use client";

import { useCallback, useMemo, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { canRenderMediaOnWeb, renderMediaOnWeb } from "@remotion/web-renderer";
import { PropertyReel } from "@/remotion/PropertyReel";
import { importWithChunkRetry } from "@/lib/import-with-chunk-retry";
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
import { UpgradeProModal } from "@/components/billing/upgrade-pro-modal";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { readJsonResponse } from "@/lib/http/read-json-response";
import { cn } from "@/lib/utils";

const RemotionPlayer = dynamic(
  () =>
    importWithChunkRetry(() =>
      import("@remotion/player").then((mod) => mod.Player),
    ),
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
  reelDemoHint: string;
  reelUpgradeBanner: string;
  reelExportUnsupported: string;
  reelExportFailed: string;
  reelSignInRequired: string;
  reelPaymentRequired: string;
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
  roomsSuffix: string;
  headline?: string;
  agencyLogoUrl?: string;
  brandColor?: string;
  brokerContact?: ReelBrokerContact;
};

function buildReelProps(
  input: PropertyReelPreviewInput,
  photoUrls: string[],
  showDemoWatermark: boolean,
): PropertyReelProps {
  return buildPropertyReelProps({
    photoUrls,
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
    roomsSuffix: input.roomsSuffix,
    headline: input.headline,
    agencyLogoUrl: input.agencyLogoUrl,
    brandColor: input.brandColor,
    brokerContact: input.brokerContact,
    showDemoWatermark,
  });
}

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
  const showDemoWatermark = !proReelAccess;
  const signedIn = Boolean(status?.email);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const previewProps = useMemo(
    (): PropertyReelProps =>
      buildReelProps(input, input.photoPreviewUrls, showDemoWatermark),
    [input, showDemoWatermark],
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
      const authData = await readJsonResponse<{
        ok?: boolean;
        isProReel?: boolean;
        error?: string;
        code?: string;
      }>(authRes);

      if (!authRes.ok) {
        if (authData.code === "unauthenticated") {
          throw new Error(copy.reelSignInRequired);
        }
        if (authData.code === "payment_required") {
          throw new Error(copy.reelPaymentRequired);
        }
        throw new Error(authData.error ?? copy.reelExportFailed);
      }

      const exportDemoWatermark = authData.isProReel !== true;

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
      if (agencyLogoUrl && !exportDemoWatermark) {
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
        roomsSuffix: input.roomsSuffix,
        headline: input.headline,
        agencyLogoUrl,
        brandColor: input.brandColor,
        brokerContact: input.brokerContact,
        showDemoWatermark: exportDemoWatermark,
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
  }, [
    copy.reelExportFailed,
    copy.reelExportUnsupported,
    copy.reelPaymentRequired,
    copy.reelSignInRequired,
    input,
  ]);

  function handleExportClick() {
    setExportError(null);
    if (!signedIn) {
      onSignIn?.();
      return;
    }
    void handleExport();
  }

  return (
    <>
      <div className={cn("flex flex-col items-center gap-4", className)}>
        <div className="relative w-full max-w-[280px] overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-700">
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
            disabled={exporting}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {exporting
                ? exportProgress !== null
                  ? `${copy.exportingReel} (${exportProgress}%)`
                  : copy.exportingReel
                : copy.exportReel}
            </span>
          </button>

          <p className="text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {showDemoWatermark ? (
              <>
                {copy.reelDemoHint}{" "}
                <button
                  type="button"
                  onClick={() => setUpgradeOpen(true)}
                  className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
                >
                  {copy.reelUpgradeBanner}
                </button>
              </>
            ) : (
              copy.reelHint
            )}
          </p>

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
