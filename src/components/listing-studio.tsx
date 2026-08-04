"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AccountBar } from "@/components/billing/account-bar";
import { BillingNeedPlanBanner } from "@/components/billing/billing-need-plan-banner";
import { BILLING_REFRESH_EVENT, useBillingStatus } from "@/hooks/use-billing-status";
import { hasProReelAccess } from "@/lib/billing/client-access";
import { AuthEmailModal } from "@/components/billing/auth-email-modal";
import { ListingForm } from "@/components/listing/listing-form";
import { OpenImmoPropertyPickerModal } from "@/components/listing/openimmo-property-picker-modal";
import { useRegisterVoiceFill } from "@/components/listing/voice-fill-context";
import { FreeTrialFormBanner } from "@/components/free-trial-form-banner";
import { getMarketingCopy } from "@/lib/i18n-marketing";
import { fetchDemoPhotos, getDemoListingContent } from "@/lib/demo-listing";
import { prepareImagesForApi, fileToBase64, compressImageForUpload } from "@/lib/prepare-images";
import { MAX_VISION_IMAGES, API_VISION_IMAGE_MAX_EDGE } from "@/lib/generate-vision";
import {
  buildBrochurePdfProps,
  buildGeneratePayload,
} from "@/lib/listing-pdf";
import {
  DEFAULT_LISTING_ADDRESS,
  formatListingAddress,
  getDefaultCountryForLocale,
} from "@/lib/location/format-address";
import { fetchMapForPdf } from "@/lib/location/fetch-map-for-pdf";
import { preparePdfImageProps, type PdfReadyImages } from "@/lib/pdf-image-data-url";
import { downloadExposePdf } from "@/lib/download-expose-pdf";
import { resolvePdfDownloadError } from "@/lib/pdf-download-error";
import { withTimeout } from "@/lib/promise-timeout";
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
import { getWorkflowUiCopy } from "@/lib/i18n-workflow";
import {
  buildRealEstateHashtags,
  formatInstagramWithHashtags,
  stripPlainSocialText,
  truncateMlsCaption,
} from "@/lib/social-copy-presets";
import { buildOpenImmoFormStateSlice, importedImagesToFiles } from "@/lib/openimmo/apply-openimmo-import";
import type { OpenImmoImportApiResponse, OpenImmoImportResult } from "@/types/openimmo-import";
import {
  outputLanguageFromLocale,
  localeFromTargetLanguage,
} from "@/lib/target-languages";
import {
  getDefaultCurrencyForLocale,
  type CurrencyCode,
} from "@/lib/currency";
import { mergeAgentWithBranding, pdfBrandingFromProfile, resolvePdfAgentContact } from "@/lib/branding/pdf-branding";
import { brandingUrlToPdfDataUrl } from "@/lib/pdf-image-data-url";
import {
  agentDefaultsFromBranding,
  hasBrandingAgentDefaults,
  mergeAgentWithBrandingDefaults,
} from "@/lib/branding/agent-from-branding";
import { reelBrandingFromProfile } from "@/lib/property-reel";
import { getBrowserAuthEmail } from "@/lib/supabase/client-session";
import { resolveShowPdfWatermark } from "@/lib/pdf-watermark";
import { getFurnishingDisclaimerText } from "@/lib/furnishing-guardrail";
import { applyVoiceParseResult } from "@/lib/voice/apply-voice-parse";
import type { VoiceParseResult } from "@/types/voice-parse";
import { StagingDisclaimerFooter } from "@/components/listing/staging-disclaimer";
import { CopyToastProvider, useCopyToast } from "@/components/ui/copy-toast";
import type { UserBrandingProfile } from "@/types/branding";
import { importWithChunkRetry } from "@/lib/import-with-chunk-retry";
import {
  clearListingStudioDraft,
  draftOwnerKey,
  fileToStoredPhotoDraft,
  readListingStudioDraft,
  storedPhotoToPreview,
  writeListingStudioDraft,
  type ListingStudioDraft,
} from "@/lib/listing-studio-draft";
import {
  buildDachDemoListingPreset,
  calculateWarmRent,
  DACH_LEGAL_DISCLAIMER,
  dachMarketPresetApply,
  parseCommissionPreset,
  commissionFreeTerms,
  resolveCommissionTermsForPreset,
  privateSellerCommissionFreeTerms,
} from "@/lib/listing-market-presets";
import { cn } from "@/lib/utils";
import type {
  AgentFormData,
  CommissionPreset,
  EnergyFormData,
  GenerateResult,
  HeatingSource,
  ListingAddress,
  PropertyDetails,
  RentFormData,
  SaleFormData,
  TargetMarket,
  TransactionType,
  UserRole,
} from "@/types/listing";

const MAX_PHOTOS = 5;

type PreviewTab = "story" | "location" | "social" | "reel";

const PropertyReelPreview = dynamic(
  () =>
    importWithChunkRetry(() =>
      import("@/components/reel/property-reel-preview").then(
        (mod) => mod.PropertyReelPreview,
      ),
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 px-6 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500">Loading reel preview…</p>
      </div>
    ),
  },
);

type PhotoPreview = {
  id: string;
  file: File;
  url: string;
};

const DEFAULT_AGENT: AgentFormData = {
  name: "",
  agency: "",
  companyAddress: "",
  phone: "",
  email: "",
  licenseId: "",
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
  commissionTerms: "Provisionsfrei für Mieter",
};

const DEFAULT_PROPERTY: PropertyDetails = {
  propertyType: "",
  floorLevel: "",
  parking: "",
  parkingFee: "",
  condition: "",
  furnishingStatus: "unfurnished",
  isStagedOrModel: false,
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
  onCopied,
}: {
  text: string;
  copyLabel: string;
  copiedLabel: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied?.();
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

function ComplianceBadge({ label }: { label: string }) {
  return (
    <p
      className="mx-2 mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
      role="status"
    >
      {label}
    </p>
  );
}

function SocialCopyPresetButtons({
  caption,
  platform,
  labels,
  hashtags,
  onCopied,
}: {
  caption: string;
  platform: "instagram" | "linkedin" | "facebook";
  labels: {
    mls: string;
    instagramHashtags: string;
    plain: string;
    copied: string;
  };
  hashtags: string[];
  onCopied: () => void;
}) {
  const presets =
    platform === "instagram"
      ? [
          { label: labels.mls, text: truncateMlsCaption(caption) },
          {
            label: labels.instagramHashtags,
            text: formatInstagramWithHashtags(caption, hashtags),
          },
          { label: labels.plain, text: stripPlainSocialText(caption) },
        ]
      : [
          { label: labels.mls, text: truncateMlsCaption(caption) },
          { label: labels.plain, text: stripPlainSocialText(caption) },
        ];

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map(({ label, text }) => (
        <CopyButton
          key={label}
          text={text}
          copyLabel={label}
          copiedLabel={labels.copied}
          onCopied={onCopied}
        />
      ))}
    </div>
  );
}

function ListingStudioContent() {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const floorPlanInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLElement>(null);

  const routeLocale = useLocale() as UiLocale;
  const uiLocale = routeLocale;
  const pathname = usePathname();
  const router = useRouter();
  const uiCopy = useMemo(() => getUiCopy(uiLocale), [uiLocale]);
  const formCopy = useMemo(() => getFormCopy(uiLocale), [uiLocale]);
  const workflowCopy = useMemo(
    () => getWorkflowUiCopy(uiLocale),
    [uiLocale],
  );
  const copy = useMemo(
    () => ({ ...uiCopy, ...formCopy, ...workflowCopy }),
    [uiCopy, formCopy, workflowCopy],
  );
  const { showToast } = useCopyToast();
  const notifyCopied = useCallback(
    () => showToast(copy.copiedToClipboard),
    [showToast, copy.copiedToClipboard],
  );
  const marketingCopy = useMemo(
    () => getMarketingCopy(uiLocale),
    [uiLocale],
  );

  const [targetLanguage, setTargetLanguage] = useState<OutputLanguage>("German");
  const [targetMarket, setTargetMarket] = useState<TargetMarket>("dach");
  const [userRole, setUserRole] = useState<UserRole>("agent");
  const [commissionPreset, setCommissionPreset] = useState<CommissionPreset>("commission_free");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const totalRentManualRef = useRef(false);

  const exposeLocale = useMemo(
    () => localeFromTargetLanguage(targetLanguage),
    [targetLanguage],
  );
  const exposeFormCopy = useMemo(
    () => getFormCopy(exposeLocale),
    [exposeLocale],
  );
  const exposeUiCopy = useMemo(
    () => getUiCopy(exposeLocale),
    [exposeLocale],
  );

  useEffect(() => {
    if (targetMarket === "global") {
      setTargetLanguage(outputLanguageFromLocale(routeLocale));
    }
    const defaultDisclaimer =
      targetMarket === "dach"
        ? DACH_LEGAL_DISCLAIMER
        : getFormCopy(routeLocale).defaultLegalDisclaimer;
    setAgent((prev) => {
      if (!isKnownDefaultLegalDisclaimer(prev.legalDisclaimer)) return prev;
      if (prev.legalDisclaimer === defaultDisclaimer) return prev;
      return { ...prev, legalDisclaimer: defaultDisclaimer };
    });
  }, [routeLocale, targetMarket]);

  const [currency, setCurrency] = useState<CurrencyCode>("EUR");
  const activeCurrency =
    targetMarket === "dach"
      ? "EUR"
      : uiLocale === "en"
        ? currency
        : getDefaultCurrencyForLocale(uiLocale);

  useEffect(() => {
    if (targetMarket === "dach") {
      setCurrency("EUR");
      return;
    }
    if (uiLocale !== "en") {
      setCurrency(getDefaultCurrencyForLocale(uiLocale));
    }
  }, [uiLocale, targetMarket]);

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

  const [address, setAddress] = useState<ListingAddress>(() => ({
    ...DEFAULT_LISTING_ADDRESS,
    country: getDefaultCountryForLocale(routeLocale),
  }));
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
    legalDisclaimer: DACH_LEGAL_DISCLAIMER,
  }));

  const handleRentPatch = useCallback((patch: Partial<RentFormData>) => {
    setRent((prev) => {
      const next = { ...prev, ...patch };
      const manualTotalEdit =
        "totalRent" in patch && !("netColdRent" in patch) && !("utilityCharges" in patch);
      if (manualTotalEdit) {
        totalRentManualRef.current = true;
      }
      if (
        ("netColdRent" in patch || "utilityCharges" in patch) &&
        !totalRentManualRef.current
      ) {
        const calculated = calculateWarmRent(next.netColdRent, next.utilityCharges);
        if (calculated) next.totalRent = calculated;
      }
      return next;
    });
  }, []);

  const handleTargetMarketChange = useCallback(
    (market: TargetMarket) => {
      setTargetMarket(market);
      if (market === "dach") {
        const preset = dachMarketPresetApply();
        setCurrency(preset.currency);
        setTargetLanguage(preset.targetLanguage);
        setAgent((prev) => {
          if (
            !prev.legalDisclaimer.trim() ||
            isKnownDefaultLegalDisclaimer(prev.legalDisclaimer) ||
            prev.legalDisclaimer === getFormCopy(routeLocale).defaultLegalDisclaimer
          ) {
            return { ...prev, legalDisclaimer: DACH_LEGAL_DISCLAIMER };
          }
          return prev;
        });
        return;
      }
      setTargetLanguage(outputLanguageFromLocale(routeLocale));
      setAgent((prev) => {
        if (
          prev.legalDisclaimer === DACH_LEGAL_DISCLAIMER ||
          isKnownDefaultLegalDisclaimer(prev.legalDisclaimer)
        ) {
          return {
            ...prev,
            legalDisclaimer: getFormCopy(routeLocale).defaultLegalDisclaimer,
          };
        }
        return prev;
      });
    },
    [routeLocale],
  );

  const applyPrivateSellerCommission = useCallback(() => {
    setCommissionPreset("commission_free");
    setSale((prev) => ({
      ...prev,
      commissionTerms: privateSellerCommissionFreeTerms(transactionType, formCopy),
    }));
  }, [transactionType, formCopy]);

  const handleCommissionPresetChange = useCallback(
    (preset: CommissionPreset) => {
      setCommissionPreset(preset);
      setSale((prev) => ({
        ...prev,
        commissionTerms: resolveCommissionTermsForPreset(
          preset,
          transactionType,
          formCopy,
          prev.commissionTerms,
        ),
      }));
    },
    [transactionType, formCopy],
  );

  const handleTransactionTypeChange = useCallback(
    (type: TransactionType) => {
      setTransactionType(type);
      if (userRole === "private_seller") {
        setCommissionPreset("commission_free");
        setSale((prev) => ({
          ...prev,
          commissionTerms: privateSellerCommissionFreeTerms(type, formCopy),
        }));
        return;
      }
      setCommissionPreset("commission_free");
      setSale((prev) => ({
        ...prev,
        commissionTerms: commissionFreeTerms(type, formCopy),
      }));
    },
    [userRole, formCopy],
  );

  const handleUserRoleChange = useCallback(
    (role: UserRole) => {
      setUserRole(role);
      if (role === "private_seller") {
        applyPrivateSellerCommission();
        return;
      }
      setCommissionPreset("commission_free");
      setSale((prev) => ({
        ...prev,
        commissionTerms: commissionFreeTerms(transactionType, formCopy),
      }));
    },
    [applyPrivateSellerCommission, transactionType, formCopy],
  );

  const loadDachDemoListing = useCallback(() => {
    const demo = buildDachDemoListingPreset();
    setTargetMarket(demo.targetMarket);
    setUserRole(demo.userRole);
    setCommissionPreset(demo.commissionPreset);
    setTransactionType(demo.transactionType);
    setAddress(demo.address);
    setSize(demo.size);
    setRooms(demo.rooms);
    setBedrooms(demo.bedrooms);
    setBathrooms(demo.bathrooms);
    setProperty({ ...demo.property });
    setRent({ ...demo.rent });
    setSale({ ...demo.sale });
    setEnergy({ ...demo.energy });
    setAgent({ ...demo.agent });
    setFeatures(demo.features);
    setTargetLanguage("German");
    setCurrency("EUR");
    totalRentManualRef.current = true;
    setResult(null);
    setHasGenerated(false);
    setIsDemoSample(false);
    setGenerateError(null);
  }, []);

  function handleExposeLanguageChange(lang: OutputLanguage) {
    setTargetLanguage(lang);
  }

  const agentForLocale = useMemo(
    () => ({
      ...agent,
      legalDisclaimer:
        targetMarket === "dach" &&
        (agent.legalDisclaimer.trim() === DACH_LEGAL_DISCLAIMER ||
          isKnownDefaultLegalDisclaimer(agent.legalDisclaimer))
          ? DACH_LEGAL_DISCLAIMER
          : resolveLegalDisclaimer(agent.legalDisclaimer, uiLocale),
    }),
    [agent, uiLocale, targetMarket],
  );

  const [previewTab, setPreviewTab] = useState<PreviewTab>("story");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isDemoSample, setIsDemoSample] = useState(false);
  const [pdfWatermark, setPdfWatermark] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [billingHint, setBillingHint] = useState<"auth" | "checkout" | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [openImmoPickerOpen, setOpenImmoPickerOpen] = useState(false);
  const [openImmoPickerProperties, setOpenImmoPickerProperties] = useState<OpenImmoImportResult[]>([]);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const { status: billingStatus, loading: billingLoading, refresh: refreshBilling } = useBillingStatus();
  const [brandingProfile, setBrandingProfile] = useState<UserBrandingProfile | null>(null);
  const brandingAutoFillDone = useRef(false);
  const checkoutHandledRef = useRef(false);
  const demoHandledRef = useRef(false);
  const [browserSignedIn, setBrowserSignedIn] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null | undefined>(undefined);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const draftLifecycleRef = useRef<{ ownerKey?: string; hydrated: boolean }>({
    hydrated: false,
  });

  useEffect(() => {
    brandingAutoFillDone.current = false;
  }, [billingStatus?.email]);

  useEffect(() => {
    void getBrowserAuthEmail().then((email) => {
      setAuthEmail(email);
      setBrowserSignedIn(Boolean(email));
    });
  }, [billingStatus?.email]);

  useEffect(() => {
    if (typeof window === "undefined" || checkoutHandledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;
    checkoutHandledRef.current = true;
    setPurchaseSuccess(true);
    window.dispatchEvent(new Event(BILLING_REFRESH_EVENT));
    void refreshBilling();
    router.replace(pathname);
  }, [router, pathname, refreshBilling]);

  const isSignedIn = Boolean(billingStatus?.email) || browserSignedIn;

  // Demo preview lives in React state only — clear it when visitors switch UI language.
  useEffect(() => {
    if (isSignedIn) return;
    setResult(null);
    setHasGenerated(false);
    setIsDemoSample(false);
    setGenerateError(null);
  }, [routeLocale, isSignedIn]);

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

  useEffect(() => {
    if (!brandingProfile || brandingAutoFillDone.current) return;
    setAgent((current) => {
      const patch = agentDefaultsFromBranding(brandingProfile, current);
      if (Object.keys(patch).length === 0) return current;
      brandingAutoFillDone.current = true;
      return { ...current, ...patch };
    });
  }, [brandingProfile]);

  const canResetFromBranding = hasBrandingAgentDefaults(brandingProfile);

  function handleResetAgentFromBranding() {
    if (!brandingProfile) return;
    setAgent((current) => mergeAgentWithBrandingDefaults(current, brandingProfile, { force: true }));
  }

  const resetFormToDefaults = useCallback(() => {
    setPhotos((prev) => {
      for (const photo of prev) URL.revokeObjectURL(photo.url);
      return [];
    });
    setFloorPlanPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFloorPlanFile(null);
    setTargetMarket("dach");
    setUserRole("agent");
    setCommissionPreset("commission_free");
    setBedrooms("");
    setBathrooms("");
    totalRentManualRef.current = false;
    setTransactionType("rent");
    setAddress({
      ...DEFAULT_LISTING_ADDRESS,
      country: getDefaultCountryForLocale(routeLocale),
    });
    setSize("");
    setRooms("");
    setProperty({ ...DEFAULT_PROPERTY });
    setFeatures([]);
    setTone("Professional");
    setRent({ ...EMPTY_RENT });
    setSale({ ...EMPTY_SALE });
    setEnergy({ ...DEFAULT_ENERGY });
    setAgent({
      ...DEFAULT_AGENT,
      legalDisclaimer: DACH_LEGAL_DISCLAIMER,
    });
    setTargetLanguage("German");
    if (uiLocale === "en") setCurrency("EUR");
    setResult(null);
    setHasGenerated(false);
    setIsDemoSample(false);
    setGenerateError(null);
    setPreviewTab("story");
    pdfReadyImagesRef.current = null;
    pdfImagesFingerprintRef.current = "";
  }, [routeLocale, uiLocale]);

  const applyListingDraft = useCallback((draft: ListingStudioDraft) => {
    setTargetLanguage(draft.targetLanguage);
    setTargetMarket(draft.targetMarket ?? "dach");
    setUserRole(draft.userRole ?? "agent");
    const isPrivateSeller = (draft.userRole ?? "agent") === "private_seller";
    const restoredPreset =
      draft.commissionPreset ??
      parseCommissionPreset(draft.sale.commissionTerms, draft.transactionType);
    setCommissionPreset(
      isPrivateSeller && restoredPreset === "commission_free"
        ? "commission_free"
        : restoredPreset,
    );
    setBedrooms(draft.bedrooms ?? "");
    setBathrooms(draft.bathrooms ?? "");
    setCurrency(draft.currency);
    setTransactionType(draft.transactionType);
    setAddress(draft.address);
    setSize(draft.size);
    setRooms(draft.rooms);
    setProperty(draft.property);
    setFeatures(draft.features);
    setTone(draft.tone);
    setRent(draft.rent);
    setSale({
      ...draft.sale,
      commissionTerms:
        isPrivateSeller && restoredPreset === "commission_free"
          ? privateSellerCommissionFreeTerms(
              draft.transactionType,
              getFormCopy(uiLocale),
            )
          : draft.sale.commissionTerms,
    });
    setEnergy(draft.energy);
    setAgent(draft.agent);
    setPhotos((prev) => {
      for (const photo of prev) URL.revokeObjectURL(photo.url);
      return draft.photos.map(storedPhotoToPreview);
    });
    const restoredFloorPlan = draft.floorPlan
      ? storedPhotoToPreview(draft.floorPlan)
      : null;
    setFloorPlanPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return restoredFloorPlan?.url ?? null;
    });
    setFloorPlanFile(restoredFloorPlan?.file ?? null);
    setResult(draft.result);
    setHasGenerated(draft.hasGenerated);
    setIsDemoSample(false);
    setGenerateError(null);
    setPreviewTab(draft.previewTab);
    pdfReadyImagesRef.current = null;
    pdfImagesFingerprintRef.current = "";
  }, [uiLocale]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") {
      if (!draftLifecycleRef.current.hydrated) {
        draftLifecycleRef.current.hydrated = true;
        setDraftHydrated(true);
      }
      return;
    }

    if (billingLoading || authEmail === undefined) return;

    const ownerKey = draftOwnerKey(billingStatus?.email ?? authEmail);

    if (!draftLifecycleRef.current.hydrated) {
      draftLifecycleRef.current.hydrated = true;
      draftLifecycleRef.current.ownerKey = ownerKey;
      const draft = readListingStudioDraft();
      if (draft && draft.ownerKey === ownerKey) {
        applyListingDraft(draft);
      }
      setDraftHydrated(true);
      return;
    }

    if (draftLifecycleRef.current.ownerKey !== ownerKey) {
      draftLifecycleRef.current.ownerKey = ownerKey;
      clearListingStudioDraft();
      resetFormToDefaults();
    }
  }, [
    applyListingDraft,
    authEmail,
    billingLoading,
    billingStatus?.email,
    resetFormToDefaults,
  ]);

  useEffect(() => {
    if (!draftHydrated || isDemoSample) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const ownerKey = draftOwnerKey(billingStatus?.email ?? authEmail ?? null);
          const photosStored = await Promise.all(
            photos.map((photo) => fileToStoredPhotoDraft(photo.id, photo.file)),
          );
          const floorPlanStored = floorPlanFile
            ? await fileToStoredPhotoDraft(
                `floor-plan-${floorPlanFile.name}-${floorPlanFile.lastModified}`,
                floorPlanFile,
              )
            : null;

          if (cancelled) return;

          writeListingStudioDraft({
            version: 1,
            ownerKey,
            savedAt: Date.now(),
            targetLanguage,
            targetMarket,
            userRole,
            commissionPreset,
            bedrooms,
            bathrooms,
            currency: activeCurrency,
            transactionType,
            address,
            size,
            rooms,
            property,
            features,
            tone,
            rent,
            sale,
            energy,
            agent,
            photos: photosStored,
            floorPlan: floorPlanStored,
            result,
            hasGenerated,
            previewTab,
          });
        } catch {
          // Draft save must never break the studio UI
        }
      })();
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    draftHydrated,
    isDemoSample,
    billingStatus?.email,
    authEmail,
    targetLanguage,
    targetMarket,
    userRole,
    commissionPreset,
    bedrooms,
    bathrooms,
    activeCurrency,
    transactionType,
    address,
    size,
    rooms,
    property,
    features,
    tone,
    rent,
    sale,
    energy,
    agent,
    photos,
    floorPlanFile,
    result,
    hasGenerated,
    previewTab,
  ]);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfReadyImagesRef = useRef<PdfReadyImages | null>(null);
  const pdfImagesFingerprintRef = useRef("");

  const PDF_PREP_WATCHDOG_MS = 60_000;

  const buildPdfImagesFingerprint = useCallback((): string => {
    const photoKey = photos
      .map((p) => `${p.file.name}:${p.file.size}:${p.file.lastModified}`)
      .join("|");
    const floorKey = floorPlanFile
      ? `${floorPlanFile.name}:${floorPlanFile.size}:${floorPlanFile.lastModified}`
      : "";
    return `${photoKey}::${floorKey}`;
  }, [photos, floorPlanFile]);

  useEffect(() => {
    pdfReadyImagesRef.current = null;
    pdfImagesFingerprintRef.current = "";
  }, [photos, floorPlanFile]);

  useEffect(() => {
    if (!isDownloadingPdf) return;
    const stalledMessage = copy.errors.pdfStalled;
    const watchdog = window.setTimeout(() => {
      setIsDownloadingPdf(false);
      setPdfError(stalledMessage);
      pdfReadyImagesRef.current = null;
      pdfImagesFingerprintRef.current = "";
    }, PDF_PREP_WATCHDOG_MS);
    return () => window.clearTimeout(watchdog);
  }, [isDownloadingPdf, copy.errors.pdfStalled]);

  const heatingLabel = useCallback(
    (source: HeatingSource) => {
      const map: Record<HeatingSource, string> = {
        heat_pump: copy.heatPump,
        district_heating: copy.districtHeating,
        gas: copy.gas,
        oil: copy.oil,
        electricity: copy.electricity,
        solar: copy.solar,
        wood_pellets: copy.woodPellets,
      };
      return map[source];
    },
    [
      copy.heatPump,
      copy.districtHeating,
      copy.gas,
      copy.oil,
      copy.electricity,
      copy.solar,
      copy.woodPellets,
    ],
  );

  const reelBranding = useMemo(() => {
    const proReel = hasProReelAccess(billingStatus);
    const agentMerged = mergeAgentWithBranding(agentForLocale, brandingProfile);
    return reelBrandingFromProfile(brandingProfile, proReel, agentMerged);
  }, [agentForLocale, billingStatus, brandingProfile]);

  const formattedAddress = useMemo(() => formatListingAddress(address), [address]);

  const furnishingDisclaimerText = useMemo(
    () =>
      getFurnishingDisclaimerText(property.furnishingStatus, photos.length, {
        stagingDisclaimerUnfurnished: exposeFormCopy.stagingDisclaimerUnfurnished,
        stagingDisclaimerPartially: exposeFormCopy.stagingDisclaimerPartially,
      }),
    [
      property.furnishingStatus,
      photos.length,
      exposeFormCopy.stagingDisclaimerUnfurnished,
      exposeFormCopy.stagingDisclaimerPartially,
    ],
  );

  const handleVoiceParsed = useCallback(
    (parsedData: VoiceParseResult) => {
      applyVoiceParseResult(parsedData, transactionType, {
        onTransactionType: setTransactionType,
        onAddress: (patch) => setAddress((current) => ({ ...current, ...patch })),
        onSize: setSize,
        onRooms: setRooms,
        onProperty: (patch) => setProperty((current) => ({ ...current, ...patch })),
        onRent: (patch) => setRent((current) => ({ ...current, ...patch })),
      });
    },
    [transactionType],
  );

  const voiceFillConfig = useMemo(
    () => ({
      locale: routeLocale,
      copy: {
        voiceFillButton: copy.voiceFillButton,
        voiceFillButtonTrial: copy.voiceFillButtonTrial,
        voiceFillListening: copy.voiceFillListening,
        voiceFillProcessing: copy.voiceFillProcessing,
        voiceFillUnsupported: copy.voiceFillUnsupported,
      },
      transactionType,
      onParsed: handleVoiceParsed,
    }),
    [
      routeLocale,
      copy.voiceFillButton,
      copy.voiceFillButtonTrial,
      copy.voiceFillListening,
      copy.voiceFillProcessing,
      copy.voiceFillUnsupported,
      transactionType,
      handleVoiceParsed,
    ],
  );

  useRegisterVoiceFill(voiceFillConfig);

  const socialHashtags = useMemo(
    () =>
      buildRealEstateHashtags({
        city: address.city,
        address: formattedAddress,
        transactionType,
        propertyType: property.propertyType,
      }),
    [address.city, formattedAddress, transactionType, property.propertyType],
  );

  const reelPreviewInput = useMemo(
    () => ({
      photoFiles: photos.map((p) => p.file),
      photoPreviewUrls: photos.map((p) => p.url),
      transactionType,
      currency: activeCurrency,
      address: formattedAddress,
      size,
      rooms,
      property,
      rent,
      sale,
      formCopy: exposeFormCopy,
      priceOnRequestLabel: exposeUiCopy.priceOnRequest,
      perMonthSuffix: exposeFormCopy.reelPerMonth,
      roomsSuffix: exposeFormCopy.reelRoomsSuffix,
      headline: result?.title,
      ...reelBranding,
    }),
    [
      photos,
      transactionType,
      activeCurrency,
      formattedAddress,
      size,
      rooms,
      property,
      rent,
      sale,
      exposeFormCopy,
      exposeUiCopy.priceOnRequest,
      result?.title,
      reelBranding,
    ],
  );

  const loadDemoSample = useCallback(async () => {
    clearListingStudioDraft();
    const demo = getDemoListingContent(exposeLocale);
    setTransactionType("rent");
    setAddress(demo.address);
    setSize(demo.size);
    setRooms(demo.rooms);
    setProperty({ ...demo.property });
    setRent({ ...demo.rent });
    setFeatures(["Balcony Terrace", "Fitted Kitchen", "Elevator"]);
    setResult({ ...demo.result, watermarkPdf: true });
    setHasGenerated(true);
    setIsDemoSample(true);
    setGenerateError(null);
    setPreviewTab("reel");

    try {
      const demoPhotos = await fetchDemoPhotos();
      setPhotos((prev) => {
        for (const photo of prev) URL.revokeObjectURL(photo.url);
        return demoPhotos;
      });
    } catch {
      setPhotos([]);
    }

    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [exposeLocale]);

  const reelPreviewCopy = useMemo(
    () => ({
      exportReel: copy.exportReel,
      exportingReel: copy.exportingReel,
      reelHint: copy.reelHint,
      reelDemoHint: copy.reelDemoHint,
      reelUpgradeBanner: copy.reelUpgradeBanner,
      reelExportUnsupported: copy.reelExportUnsupported,
      reelExportFailed: copy.reelExportFailed,
      reelSignInRequired: copy.reelSignInRequired,
      reelPaymentRequired: copy.reelPaymentRequired,
    }),
    [
      copy.exportReel,
      copy.exportingReel,
      copy.reelHint,
      copy.reelDemoHint,
      copy.reelUpgradeBanner,
      copy.reelExportUnsupported,
      copy.reelExportFailed,
      copy.reelSignInRequired,
      copy.reelPaymentRequired,
    ],
  );

  useEffect(() => {
    if (typeof window === "undefined" || demoHandledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") !== "1") return;
    demoHandledRef.current = true;
    void loadDemoSample();
    router.replace(pathname);
  }, [loadDemoSample, pathname, router]);

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

  const applyOpenImmoImportData = useCallback(
    (rawData: OpenImmoImportResult) => {
      const slice = buildOpenImmoFormStateSlice(rawData, {
        address,
        property: DEFAULT_PROPERTY,
        rent: EMPTY_RENT,
        sale: EMPTY_SALE,
        energy: DEFAULT_ENERGY,
      });
      const importedType = slice.transactionType ?? transactionType;

      setTargetMarket("dach");
      setTargetLanguage("German");
      setCurrency("EUR");

      if (slice.transactionType) {
        setTransactionType(slice.transactionType);
      }

      setAddress(slice.address);
      setSize(slice.size);
      setRooms(slice.rooms);
      setProperty(slice.property);
      setRent(slice.rent);
      totalRentManualRef.current = Boolean(slice.rent.totalRent.trim());

      const commissionTerms =
        userRole === "private_seller"
          ? privateSellerCommissionFreeTerms(importedType, formCopy)
          : commissionFreeTerms(importedType, formCopy);

      setCommissionPreset("commission_free");
      setSale({ ...slice.sale, commissionTerms });
      setEnergy(slice.energy);

      if (slice.title || slice.description || slice.locationText) {
        setResult({
          title: slice.title || "Imported listing",
          summary: slice.description
            ? [slice.description.slice(0, 120)]
            : slice.locationText
              ? [slice.locationText.slice(0, 120)]
              : [],
          fullDescription: slice.description,
          locationDescription: slice.locationText || "—",
          socialCaptions: { instagram: "", linkedin: "", facebook: "" },
        });
        setHasGenerated(true);
        setPreviewTab(slice.description ? "story" : "location");
      } else {
        setResult(null);
        setHasGenerated(false);
      }

      setPhotos((prev) => {
        for (const photo of prev) URL.revokeObjectURL(photo.url);
        return [];
      });
      const imageFiles = importedImagesToFiles(rawData);
      if (imageFiles.length > 0) {
        addPhotos(imageFiles);
      }

      setIsDemoSample(false);
      setGenerateError(null);
      showToast(copy.openImmoImportSuccess);
    },
    [addPhotos, address, copy, formCopy, showToast, transactionType, userRole],
  );

  const handleOpenImmoImport = useCallback(
    async (file: File) => {
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/import/openimmo", { method: "POST", body });
        const payload = (await res.json()) as OpenImmoImportApiResponse;

        if (!res.ok || !payload.data?.length) {
          throw new Error(payload.error || copy.openImmoImportError);
        }

        if (payload.data.length === 1) {
          applyOpenImmoImportData(payload.data[0]);
          return;
        }

        setOpenImmoPickerProperties(payload.data);
        setOpenImmoPickerOpen(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : copy.openImmoImportError;
        window.alert(message);
      }
    },
    [applyOpenImmoImportData, copy.openImmoImportError],
  );

  const handleOpenImmoPropertySelect = useCallback(
    (index: number) => {
      const property = openImmoPickerProperties[index];
      if (!property) return;
      applyOpenImmoImportData(property);
      setOpenImmoPickerOpen(false);
      setOpenImmoPickerProperties([]);
    },
    [applyOpenImmoImportData, openImmoPickerProperties],
  );

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
      const images = await prepareImagesForApi(
        photos.map((p) => p.file),
        { limit: MAX_VISION_IMAGES, maxEdge: API_VISION_IMAGE_MAX_EDGE },
      );
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
      setIsDemoSample(false);
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
    if (!result || isDownloadingPdf) return;
    setPdfError(null);

    try {
      const isPro = billingStatus?.isPro === true;
      const agentForPdf = resolvePdfAgentContact(agentForLocale, brandingProfile);
      const brand = pdfBrandingFromProfile(brandingProfile, isPro);
      const fingerprint = buildPdfImagesFingerprint();

      const [logoDataUrl, avatarDataUrl, mapDataUrl] = await Promise.all([
        brand.logoUrl ? brandingUrlToPdfDataUrl(brand.logoUrl) : Promise.resolve(undefined),
        brand.avatarUrl ? brandingUrlToPdfDataUrl(brand.avatarUrl) : Promise.resolve(undefined),
        fetchMapForPdf(address),
      ]);

      let readyImages = pdfReadyImagesRef.current;
      if (!readyImages || pdfImagesFingerprintRef.current !== fingerprint) {
        readyImages = await withTimeout(
          preparePdfImageProps({
            photoFiles: photos.map((p) => p.file),
            floorPlanFile,
            logoDataUrl,
            avatarDataUrl,
            mapDataUrl,
          }),
          30_000,
          "PDF image preparation timed out",
        );
        pdfReadyImagesRef.current = readyImages;
        pdfImagesFingerprintRef.current = fingerprint;
      } else {
        readyImages = {
          ...readyImages,
          logoDataUrl,
          avatarDataUrl,
          mapDataUrl,
        };
      }

      const pdfProps = buildBrochurePdfProps({
        transactionType,
        form: exposeFormCopy,
        ui: exposeUiCopy,
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
        photoCount: photos.length,
        branding: {
          primaryColor: brand.primaryColor,
          accentColor: brand.accentColor,
          brandColor: brand.brandColor,
          logoDataUrl: readyImages.logoDataUrl,
          avatarDataUrl: readyImages.avatarDataUrl,
          fontFamily: brand.fontFamily,
          website: brand.website,
          showWatermark: resolveShowPdfWatermark(result, pdfWatermark, billingStatus),
        },
      });

      // Set loading state only after image prep — keeps canvas work off the spinner re-render path.
      setIsDownloadingPdf(true);

      await withTimeout(
        downloadExposePdf({
          ...pdfProps,
          photoDataUrls: readyImages.photoDataUrls,
          floorPlanDataUrl: readyImages.floorPlanDataUrl,
          mapDataUrl: readyImages.mapDataUrl,
          logoDataUrl: readyImages.logoDataUrl,
          avatarDataUrl: readyImages.avatarDataUrl,
        }),
        50_000,
        "PDF render timed out",
      );
    } catch (err) {
      const message = resolvePdfDownloadError(err, copy);
      setPdfError(message);
      showToast(message);
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
          <div className="flex w-full flex-col-reverse items-stretch gap-3 sm:w-auto sm:flex-col sm:items-end">
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
              className="w-full min-w-[10rem] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm sm:w-auto dark:border-zinc-700 dark:bg-zinc-900"
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

      <main className="mx-auto max-w-6xl overflow-visible px-6 pb-8 pt-4 sm:pt-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <section id="listing-form" className="order-1 min-w-0 flex-1 scroll-mt-28">
          {!isSignedIn ? (
            <FreeTrialFormBanner
              copy={marketingCopy}
              onSignUp={() => setAuthOpen(true)}
            />
          ) : null}
          <ListingForm
            copy={copy}
            targetMarket={targetMarket}
            onTargetMarket={handleTargetMarketChange}
            userRole={userRole}
            onUserRole={handleUserRoleChange}
            commissionPreset={commissionPreset}
            onCommissionPreset={handleCommissionPresetChange}
            bedrooms={bedrooms}
            onBedrooms={setBedrooms}
            bathrooms={bathrooms}
            onBathrooms={setBathrooms}
            onFillDemoDach={loadDachDemoListing}
            onOpenImmoImport={handleOpenImmoImport}
            transactionType={transactionType}
            onTransactionType={handleTransactionTypeChange}
            property={property}
            onProperty={(patch) => setProperty((p) => ({ ...p, ...patch }))}
            address={address}
            onAddress={(patch) => setAddress((a) => ({ ...a, ...patch }))}
            size={size}
            onSize={setSize}
            rooms={rooms}
            onRooms={setRooms}
            currency={currency}
            onCurrency={setCurrency}
            showCurrencySelect={uiLocale === "en"}
            hasMounted={hasMounted}
            rent={rent}
            onRent={handleRentPatch}
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
            onResetAgentFromBranding={handleResetAgentFromBranding}
            canResetFromBranding={canResetFromBranding}
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
            {isDemoSample ? (
              <p
                className="mx-2 mt-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs leading-relaxed text-indigo-950 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-100"
                role="note"
              >
                {marketingCopy.demoPreviewNotice}
              </p>
            ) : null}
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
            {result && hasGenerated ? (
              <div className="mt-3 px-2">
                <ComplianceBadge label={copy.complianceBadge} />
              </div>
            ) : null}
            <div className="mt-3 px-2 pb-4">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!result || isDownloadingPdf}
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
                <div
                  role="alert"
                  className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                >
                  <p className="font-medium">{pdfError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfError(null);
                      pdfReadyImagesRef.current = null;
                      pdfImagesFingerprintRef.current = "";
                    }}
                    className="mt-2 text-xs font-semibold underline underline-offset-2"
                  >
                    Dismiss
                  </button>
                </div>
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
                locale={routeLocale}
                onSignIn={() => setAuthOpen(true)}
                copy={reelPreviewCopy}
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
                      onCopied={notifyCopied}
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
                        onCopied={notifyCopied}
                      />
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        {isDownloadingPdf ? `${copy.pdfShort}…` : copy.pdfShort}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                    {result.fullDescription}
                  </p>
                  {furnishingDisclaimerText ? (
                    <div className="mt-3">
                      <StagingDisclaimerFooter text={furnishingDisclaimerText} />
                    </div>
                  ) : null}
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
                    onCopied={notifyCopied}
                  />
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                  {result.locationDescription}
                </p>
                {furnishingDisclaimerText ? (
                  <div className="mt-3">
                    <StagingDisclaimerFooter text={furnishingDisclaimerText} />
                  </div>
                ) : null}
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
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-500">
                        {label}
                      </span>
                      <CopyButton
                        text={text}
                        copyLabel={copy.copy}
                        copiedLabel={copy.copied}
                        onCopied={notifyCopied}
                      />
                    </div>
                    <div className="mb-3">
                      <SocialCopyPresetButtons
                        caption={text}
                        platform={key}
                        hashtags={socialHashtags}
                        labels={{
                          mls: copy.copyMlsShort,
                          instagramHashtags: copy.copyInstagramHashtags,
                          plain: copy.copyPlainText,
                          copied: copy.copied,
                        }}
                        onCopied={notifyCopied}
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
      <OpenImmoPropertyPickerModal
        copy={formCopy}
        open={openImmoPickerOpen}
        properties={openImmoPickerProperties}
        onSelect={handleOpenImmoPropertySelect}
        onClose={() => {
          setOpenImmoPickerOpen(false);
          setOpenImmoPickerProperties([]);
        }}
      />
      <AuthEmailModal open={authOpen} onClose={() => setAuthOpen(false)} onSent={() => setAuthOpen(false)} />
    </div>
  );
}

export default function ListingStudio() {
  return (
    <CopyToastProvider>
      <ListingStudioContent />
    </CopyToastProvider>
  );
}
