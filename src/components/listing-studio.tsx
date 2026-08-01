"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AccountBar } from "@/components/billing/account-bar";
import { BillingNeedPlanBanner } from "@/components/billing/billing-need-plan-banner";
import { BILLING_REFRESH_EVENT, useBillingStatus } from "@/hooks/use-billing-status";
import { hasPurchasedBillingAccess } from "@/lib/billing/client-access";
import { AuthEmailModal } from "@/components/billing/auth-email-modal";
import { ListingForm } from "@/components/listing/listing-form";
import { WorkspaceMarketing } from "@/components/workspace-marketing";
import { getMarketingCopy } from "@/lib/i18n-marketing";
import { prepareImagesForApi, fileToBase64, compressImageForUpload } from "@/lib/prepare-images";
import {
  buildBrochurePdfProps,
  buildGeneratePayload,
} from "@/lib/listing-pdf";
import {
  getUiCopy,
  LOCALE_LABELS,
  UI_LOCALES,
  type FeatureKey,
  type ToneKey,
  type OutputLanguage,
  type UiLocale,
} from "@/lib/i18n";
import { getFormCopy, isKnownDefaultLegalDisclaimer, resolveLegalDisclaimer } from "@/lib/i18n-form";
import {
  outputLanguageFromLocale,
} from "@/lib/target-languages";
import {
  getDefaultCurrencyForLocale,
  type CurrencyCode,
} from "@/lib/currency";
import { mergeAgentWithBranding, pdfBrandingFromProfile, logoUrlToDataUrl } from "@/lib/branding/pdf-branding";
import { getBrowserAuthEmail } from "@/lib/supabase/client-session";
import { resolveShowPdfWatermark } from "@/lib/pdf-watermark";
import type { UserBrandingProfile } from "@/types/branding";
import { PropertyReelPreview } from "@/components/reel/property-reel-preview";
import { cn } from "@/lib/utils";
import type {
  TransactionType,
  RentFormData,
  SaleFormData,
  EnergyFormData,
  HeatingSource,
  GenerateResult,
  AgentFormData,
  PropertyDetails,
} from "@/types/listing";

const MAX_PHOTOS = 5;

type PreviewTab = "story" | "location" | "social" | "reel";

type PhotoPreview = {
  id: string;
  file: File;
  url: string;
};

const DEFAULT_AGENT: AgentFormData = {
  name: "",
  agency: "",
  phone: "",
  email: "",
  legalDisclaimer: "",
};

const EMPTY_RENT: RentFormData = {
  netColdRent: "",
  utilityCharges: "",
  totalRent: "",
  securityDeposit: "",
  availableFrom: "",
  minimumLeaseTerm: "",
  petPolicy: "",
};

const EMPTY_SALE: SaleFormData = {
  purchasePrice: "",
  hoaFee: "",
  rentalYield: "",
  commissionTerms: "",
};

const DEFAULT_PROPERTY: PropertyDetails = {
  propertyType: "",
  floorLevel: "",
  parking: "",
  parkingFee: "",
  condition: "",
};

const DEFAULT_ENERGY: EnergyFormData = {
  certificateType: "na",
  energyValue: "",
  energyClass: "",
  heatingSource: "",
  constructionYear: "",
  heatingInstallYear: "",
};

function CopyButton({
  text,
  copyLabel,
  copiedLabel,
}: {
  text: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text.trim()}
      className={cn(
        "rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
      )}
    >
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}

export default function ListingStudio() {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const floorPlanInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLElement>(null);

  const routeLocale = useLocale() as UiLocale;
  const uiLocale = routeLocale;
  const pathname = usePathname();
  const router = useRouter();
  const uiCopy = getUiCopy(uiLocale);
  const formCopy = getFormCopy(uiLocale);
  const copy = useMemo(
    () => ({ ...uiCopy, ...formCopy }),
    [uiCopy, formCopy],
  );
  const marketingCopy = useMemo(
    () => getMarketingCopy(uiLocale),
    [uiLocale],
  );

  const [targetLanguage, setTargetLanguage] = useState<OutputLanguage>(() =>
    outputLanguageFromLocale(routeLocale),
  );

  useEffect(() => {
    setTargetLanguage(outputLanguageFromLocale(routeLocale));
    setAgent((prev) => ({
      ...prev,
      legalDisclaimer: isKnownDefaultLegalDisclaimer(prev.legalDisclaimer)
        ? getFormCopy(routeLocale).defaultLegalDisclaimer
        : prev.legalDisclaimer,
    }));
  }, [routeLocale]);

  const [currency, setCurrency] = useState<CurrencyCode>("EUR");
  const activeCurrency =
    uiLocale === "en" ? currency : getDefaultCurrencyForLocale(uiLocale);

  useEffect(() => {
    if (uiLocale !== "en") {
      setCurrency(getDefaultCurrencyForLocale(uiLocale));
    }
  }, [uiLocale]);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [transactionType, setTransactionType] =
    useState<TransactionType>("rent");
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);
  const [floorPlanPreview, setFloorPlanPreview] = useState<string | null>(null);

  const [address, setAddress] = useState("");
  const [size, setSize] = useState("");
  const [rooms, setRooms] = useState("");
  const [property, setProperty] = useState<PropertyDetails>({ ...DEFAULT_PROPERTY });
  const [features, setFeatures] = useState<FeatureKey[]>([]);
  const [tone, setTone] = useState<ToneKey>("Professional");

  const [rent, setRent] = useState<RentFormData>({ ...EMPTY_RENT });
  const [sale, setSale] = useState<SaleFormData>({ ...EMPTY_SALE });
  const [energy, setEnergy] = useState<EnergyFormData>({ ...DEFAULT_ENERGY });
  const [agent, setAgent] = useState<AgentFormData>(() => ({
    ...DEFAULT_AGENT,
    legalDisclaimer: getFormCopy(routeLocale).defaultLegalDisclaimer,
  }));

  function handleExposeLanguageChange(lang: OutputLanguage) {
    setTargetLanguage(lang);
  }

  const agentForLocale = useMemo(
    () => ({
      ...agent,
      legalDisclaimer: resolveLegalDisclaimer(
        agent.legalDisclaimer,
        uiLocale,
      ),
    }),
    [agent, uiLocale],
  );

  const [previewTab, setPreviewTab] = useState<PreviewTab>("story");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [pdfWatermark, setPdfWatermark] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [billingHint, setBillingHint] = useState<"auth" | "checkout" | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const { status: billingStatus, refresh: refreshBilling } = useBillingStatus();
  const [brandingProfile, setBrandingProfile] = useState<UserBrandingProfile | null>(null);
  const [browserSignedIn, setBrowserSignedIn] = useState(false);

  useEffect(() => {
    void getBrowserAuthEmail().then((email) => setBrowserSignedIn(Boolean(email)));
  }, [billingStatus?.email]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;
    setPurchaseSuccess(true);
    window.dispatchEvent(new Event(BILLING_REFRESH_EVENT));
    void refreshBilling();
    router.replace(pathname);
  }, [router, pathname, refreshBilling]);

  const showMarketing =
    !purchaseSuccess && !hasPurchasedBillingAccess(billingStatus);
  const isSignedIn = Boolean(billingStatus?.email) || browserSignedIn;
  const isWorkspace = isSignedIn || !showMarketing;

  useEffect(() => {
    if (!billingStatus?.email) return;
    void fetch("/api/branding/profile", { credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { branding?: UserBrandingProfile };
        if (data.branding) setBrandingProfile(data.branding);
      })
      .catch(() => undefined);
  }, [billingStatus?.email]);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const heatingLabel = useCallback(
    (source: HeatingSource) => {
      const map: Record<HeatingSource, string> = {
        heat_pump: copy.heatPump,
        district_heating: copy.districtHeating,
        gas: copy.gas,
        oil: copy.oil,
        electricity: copy.electricity,
        solar: copy.solar,
      };
      return map[source];
    },
    [copy],
  );

  const reelPreviewInput = useMemo(
    () => ({
      photoFiles: photos.map((p) => p.file),
      photoPreviewUrls: photos.map((p) => p.url),
      transactionType,
      currency: activeCurrency,
      address,
      size,
      rooms,
      property,
      rent,
      sale,
      formCopy,
      priceOnRequestLabel: copy.priceOnRequest,
      perMonthSuffix: copy.reelPerMonth,
      headline: result?.title,
    }),
    [
      photos,
      transactionType,
      activeCurrency,
      address,
      size,
      rooms,
      property,
      rent,
      sale,
      formCopy,
      copy.priceOnRequest,
      copy.reelPerMonth,
      result?.title,
    ],
  );

  const addPhotos = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (incoming.length === 0) return;

    setPhotos((prev) => {
      const remaining = MAX_PHOTOS - prev.length;
      const toAdd = incoming.slice(0, remaining).map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...toAdd];
    });
  }, []);

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  function toggleFeature(feature: FeatureKey) {
    setFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  }

  function handleFloorPlanChange(file: File | null) {
    if (floorPlanPreview) URL.revokeObjectURL(floorPlanPreview);
    if (!file) {
      setFloorPlanFile(null);
      setFloorPlanPreview(null);
      return;
    }
    setFloorPlanFile(file);
    setFloorPlanPreview(URL.createObjectURL(file));
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setGenerateError(null);
    setBillingHint(null);
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 90_000);

    try {
      const images = await prepareImagesForApi(photos.map((p) => p.file));
      let floorPlan: { base64: string; mimeType: string } | undefined;
      if (floorPlanFile) {
        const compressed = await compressImageForUpload(floorPlanFile);
        floorPlan = await fileToBase64(compressed);
      }

      const payload = buildGeneratePayload({
        transactionType,
        targetLanguage,
        currency: activeCurrency,
        address,
        size,
        rooms,
        property,
        features,
        tone,
        rent,
        sale,
        energy,
        agent: agentForLocale,
        images,
        floorPlan,
      });

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      let data: GenerateResult & { error?: string; code?: string; watermarkPdf?: boolean } = {
        title: "",
        summary: [],
        fullDescription: "",
        locationDescription: "",
        socialCaptions: { instagram: "", linkedin: "", facebook: "" },
      };
      try {
        data = raw
          ? (JSON.parse(raw) as typeof data)
          : {
              title: "",
              summary: [],
              fullDescription: "",
              locationDescription: "",
              socialCaptions: { instagram: "", linkedin: "", facebook: "" },
            };
      } catch {
        throw new Error(
          response.ok
            ? copy.errors.invalidResponse
            : `${copy.errors.serverError} (${response.status})`,
        );
      }

      if (!response.ok) {
        const code = data.code;
        if (response.status === 401 || code === "unauthenticated") {
          setBillingHint("auth");
          setAuthOpen(true);
        } else if (response.status === 402 || code === "payment_required") {
          setBillingHint("checkout");
        }
        throw new Error(data.error ?? copy.errors.generationFailed);
      }

      if (!data.title?.trim() || !data.fullDescription?.trim()) {
        throw new Error(copy.errors.emptyExpose);
      }

      const sc = data.socialCaptions;
      if (!sc?.instagram?.trim() || !sc.linkedin?.trim() || !sc.facebook?.trim()) {
        throw new Error(copy.errors.expectedCaptions);
      }

      setResult({
        title: data.title,
        summary: Array.isArray(data.summary) ? data.summary : [],
        fullDescription: data.fullDescription,
        locationDescription: data.locationDescription || "â€”",
        socialCaptions: sc,
        watermarkPdf: data.watermarkPdf,
      });
      setPdfWatermark(Boolean(data.watermarkPdf));
      setHasGenerated(true);
      setPreviewTab("story");
      window.dispatchEvent(new Event(BILLING_REFRESH_EVENT));
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? copy.errors.timeout
          : err instanceof Error
            ? err.message
            : copy.errors.generic;
      setGenerateError(message);
    } finally {
      window.clearTimeout(timeoutId);
      setIsGenerating(false);
    }
  }

  async function handleDownloadPdf() {
    if (!result) return;
    setIsDownloadingPdf(true);
    setPdfError(null);
    try {
      const isPro = billingStatus?.isPro === true;
      const agentForPdf = mergeAgentWithBranding(agentForLocale, brandingProfile);
      const brand = pdfBrandingFromProfile(brandingProfile, isPro);
      let logoDataUrl: string | undefined;
      if (brand.logoUrl) {
        logoDataUrl = await logoUrlToDataUrl(brand.logoUrl);
      }
      const pdfProps = buildBrochurePdfProps({
        transactionType,
        form: formCopy,
        ui: uiCopy,
        currency: activeCurrency,
        address,
        size,
        rooms,
        property,
        rent,
        sale,
        energy,
        agent: agentForPdf,
        result,
        branding: {
          brandColor: brand.brandColor,
          logoDataUrl,
          website: brand.website,
          showWatermark: resolveShowPdfWatermark(result, pdfWatermark, billingStatus),
        },
      });
      const { downloadExposePdf } = await import("@/lib/download-expose-pdf");
      await downloadExposePdf({
        ...pdfProps,
        photoDataUrls: [],
        photoFiles: photos.map((p) => p.file),
        floorPlanFile,
      });
    } catch (err) {
      setPdfError(
        err instanceof Error ? err.message : copy.errors.pdfFailed,
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return (
    <div className="min-h-screen overflow-visible bg-gradient-to-b from-blue-50/30 via-zinc-50 to-zinc-50 text-zinc-900 dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
              {copy.brand}
            </p>
            <h1 className="text-lg font-semibold tracking-tight">
              {copy.pageTitle}
            </h1>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <AccountBar locale={routeLocale} />
            <div className="flex flex-col gap-1 sm:items-end">
            <label
              htmlFor="ui-language-header"
              className="text-xs font-medium text-zinc-500"
            >
              {copy.uiLanguage}
            </label>
            <select
              id="ui-language-header"
              value={routeLocale}
              onChange={(e) =>
                router.replace(pathname, {
                  locale: e.target.value as UiLocale,
                })
              }
              className="min-w-[10rem] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {UI_LOCALES.map((loc) => (
                <option key={loc} value={loc}>
                  {LOCALE_LABELS[loc]}
                </option>
              ))}
            </select>
            </div>
          </div>
        </div>
      </header>

      <BillingNeedPlanBanner />

      {purchaseSuccess ? (
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <p
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
            role="status"
          >
            {marketingCopy.purchaseSuccessMessage}
          </p>
        </div>
      ) : null}

      <WorkspaceMarketing copy={marketingCopy} isSignedIn={isSignedIn} visible={showMarketing} />

      <main
        className={cn(
          "mx-auto max-w-6xl overflow-visible px-6 pb-8",
          isWorkspace ? "pt-4 sm:pt-6" : "py-6 sm:py-8",
        )}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <section id="listing-form" className="order-1 min-w-0 flex-1 scroll-mt-28">
          <ListingForm
            copy={copy}
            transactionType={transactionType}
            onTransactionType={setTransactionType}
            property={property}
            onProperty={(patch) => setProperty((p) => ({ ...p, ...patch }))}
            address={address}
            onAddress={setAddress}
            size={size}
            onSize={setSize}
            rooms={rooms}
            onRooms={setRooms}
            currency={currency}
            onCurrency={setCurrency}
            showCurrencySelect={uiLocale === "en"}
            hasMounted={hasMounted}
            rent={rent}
            onRent={(patch) => setRent((r) => ({ ...r, ...patch }))}
            sale={sale}
            onSale={(patch) => setSale((s) => ({ ...s, ...patch }))}
            energy={energy}
            onEnergy={(patch) => setEnergy((en) => ({ ...en, ...patch }))}
            heatingLabel={heatingLabel}
            features={features}
            onToggleFeature={toggleFeature}
            photos={photos}
            dragOver={dragOver}
            onDragOver={setDragOver}
            onAddPhotos={addPhotos}
            onRemovePhoto={removePhoto}
            photoInputRef={photoInputRef}
            floorPlanPreview={floorPlanPreview}
            floorPlanInputRef={floorPlanInputRef}
            onFloorPlanChange={handleFloorPlanChange}
            agent={agent}
            onAgent={(patch) => setAgent((a) => ({ ...a, ...patch }))}
            tone={tone}
            onTone={setTone}
            targetLanguage={targetLanguage}
            onTargetLanguage={handleExposeLanguageChange}
            generateError={generateError}
            billingHint={billingHint}
            onOpenAuth={() => setAuthOpen(true)}
            billingStatus={billingStatus}
            isGenerating={isGenerating}
            isDownloadingPdf={isDownloadingPdf}
            result={result}
            onGenerate={handleGenerate}
            onDownloadPdf={handleDownloadPdf}
          />
          </section>

          <aside className="order-2 min-w-0 flex-1 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto">
            <section
              ref={previewRef}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
          <div className="shrink-0 border-b border-zinc-200 px-4 pt-4 dark:border-zinc-800">
            <h2 className="px-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {copy.preview}
            </h2>
            <div className="mt-3 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              {(
                [
                  ["story", copy.tabStory],
                  ["location", copy.tabLocation],
                  ["social", copy.tabSocial],
                  ["reel", copy.tabReel],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPreviewTab(tab)}
                  className={cn(
                    "flex-1 rounded-md px-1 py-2 text-xs font-medium transition sm:text-sm",
                    previewTab === tab
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 px-2 pb-4">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!result || isDownloadingPdf || isGenerating}
                className={cn(
                  "w-full rounded-lg py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
                  result
                    ? "border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    : "border border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                )}
              >
                {isDownloadingPdf ? copy.preparingPdf : copy.downloadPdf}
              </button>
              {!result ? (
                <p className="mt-2 px-1 text-xs text-zinc-500">
                  {copy.pdfPreviewHint}
                </p>
              ) : null}
              {pdfError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {pdfError}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col p-4 lg:min-h-[20rem]">
            {generateError && !isGenerating && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                {generateError}
              </div>
            )}
            {previewTab === "reel" ? (
              <PropertyReelPreview
                input={reelPreviewInput}
                copy={{
                  exportReel: copy.exportReel,
                  exportingReel: copy.exportingReel,
                  reelHint: copy.reelHint,
                  reelExportUnsupported: copy.reelExportUnsupported,
                  reelExportFailed: copy.reelExportFailed,
                }}
              />
            ) : !hasGenerated && !isGenerating && !generateError ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 px-6 text-center dark:border-zinc-700">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {copy.noContent}
                </p>
                <p className="mt-1 max-w-xs text-sm text-zinc-500">
                  {copy.noContentHint}
                </p>
              </div>
            ) : isGenerating ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 px-6 text-center dark:border-zinc-700">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {copy.creatingCopy}
                </p>
                <p className="mt-1 max-w-xs text-sm text-zinc-500">
                  {copy.creatingCopyHint}
                </p>
              </div>
            ) : !hasGenerated && generateError ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 px-6 text-center dark:border-zinc-700">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {copy.generationFailed}
                </p>
                <p className="mt-1 max-w-sm text-sm text-zinc-500">
                  {copy.generationFailedHint}
                </p>
              </div>
            ) : result && previewTab === "story" ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                      {copy.headline}
                    </span>
                    <CopyButton
                      text={result.title}
                      copyLabel={copy.copy}
                      copiedLabel={copy.copied}
                    />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {result.title}
                  </h3>
                </div>
                {result.summary.length > 0 && (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
                    <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">
                      {copy.summaryLabel}
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-800 dark:text-zinc-200">
                      {result.summary.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-1 flex-col rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                      {copy.fullDescriptionLabel}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton
                        text={result.fullDescription}
                        copyLabel={copy.copy}
                        copiedLabel={copy.copied}
                      />
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf || isGenerating}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        {isDownloadingPdf ? `${copy.pdfShort}â€¦` : copy.pdfShort}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                    {result.fullDescription}
                  </p>
                </div>
              </div>
            ) : result && previewTab === "location" ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    {copy.locationLabel}
                  </span>
                  <CopyButton
                    text={result.locationDescription}
                    copyLabel={copy.copy}
                    copiedLabel={copy.copied}
                  />
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                  {result.locationDescription}
                </p>
              </div>
            ) : result && previewTab === "social" ? (
              <ul className="space-y-4">
                {(
                  [
                    ["instagram", copy.socialInstagram, result.socialCaptions.instagram],
                    ["linkedin", copy.socialLinkedin, result.socialCaptions.linkedin],
                    ["facebook", copy.socialFacebook, result.socialCaptions.facebook],
                  ] as const
                ).map(([key, label, text]) => (
                  <li
                    key={key}
                    className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/50"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-500">
                        {label}
                      </span>
                      <CopyButton
                        text={text}
                        copyLabel={copy.copy}
                        copiedLabel={copy.copied}
                      />
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                      {text}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
            </div>
          </section>
          </aside>
        </div>
      </main>
      <AuthEmailModal open={authOpen} onClose={() => setAuthOpen(false)} onSent={() => setAuthOpen(false)} />
    </div>
  );
}
