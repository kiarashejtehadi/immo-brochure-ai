"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
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
  TARGET_LANGUAGE_OPTIONS,
  outputLanguageFromLocale,
} from "@/lib/target-languages";
import {
  getDefaultCurrencyForLocale,
  ENGLISH_CURRENCY_OPTIONS,
  CURRENCY_LABELS,
  formatPriceAmount,
  type CurrencyCode,
} from "@/lib/currency";
import { cn } from "@/lib/utils";
import type {
  TransactionType,
  RentFormData,
  SaleFormData,
  EnergyFormData,
  EnergyClass,
  EnergyCertificateType,
  HeatingSource,
  GenerateResult,
  AgentFormData,
} from "@/types/listing";

const MAX_PHOTOS = 5;

const FEATURE_KEYS: FeatureKey[] = [
  "Balcony",
  "Fitted Kitchen",
  "Elevator",
  "Renovated",
];

const TONE_KEYS: ToneKey[] = ["Luxurious", "Professional", "Friendly"];

const ENERGY_CLASSES: EnergyClass[] = [
  "A+",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
];

const HEATING_SOURCES: HeatingSource[] = [
  "heat_pump",
  "district_heating",
  "gas",
  "oil",
  "electricity",
  "solar",
];

type PreviewTab = "story" | "location" | "social";

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

const DEFAULT_ENERGY: EnergyFormData = {
  certificateType: "na",
  energyValue: "",
  energyClass: "",
  heatingSource: "",
  constructionYear: "",
  heatingInstallYear: "",
};

function inputClassName() {
  return "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950";
}

function labelClassName() {
  return "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
}

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

function PriceHint({
  amount,
  currency,
  priceOnRequestLabel,
  show,
}: {
  amount: string;
  currency: CurrencyCode;
  priceOnRequestLabel: string;
  show: boolean;
}) {
  if (!show || !amount.trim()) return null;
  return (
    <p className="mt-1 text-xs text-zinc-500">
      {formatPriceAmount(amount, currency, priceOnRequestLabel)}
    </p>
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

  const [currency, setCurrency] = useState<CurrencyCode>("USD");
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
  const [features, setFeatures] = useState<FeatureKey[]>([]);
  const [tone, setTone] = useState<ToneKey>("Professional");

  const [rent, setRent] = useState<RentFormData>({ ...EMPTY_RENT });
  const [sale, setSale] = useState<SaleFormData>({ ...EMPTY_SALE });
  const [energy, setEnergy] = useState<EnergyFormData>({ ...DEFAULT_ENERGY });
  const [agent, setAgent] = useState<AgentFormData>(() => ({
    ...DEFAULT_AGENT,
    legalDisclaimer: getFormCopy(routeLocale).defaultLegalDisclaimer,
  }));

  function handleTargetLanguageChange(lang: OutputLanguage) {
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
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
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
      let data: GenerateResult & { error?: string } = {
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
        locationDescription: data.locationDescription || "—",
        socialCaptions: sc,
      });
      setHasGenerated(true);
      setPreviewTab("story");
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
      const pdfProps = buildBrochurePdfProps({
        transactionType,
        form: formCopy,
        ui: uiCopy,
        currency: activeCurrency,
        address,
        size,
        rooms,
        rent,
        sale,
        energy,
        agent: agentForLocale,
        result,
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1">
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
            <div className="flex flex-col gap-1">
              <label
                htmlFor="target-language-header"
                className="text-xs font-medium text-zinc-500"
              >
                {copy.targetLanguage}
              </label>
              <select
                id="target-language-header"
                value={targetLanguage}
                onChange={(e) =>
                  handleTargetLanguageChange(e.target.value as OutputLanguage)
                }
                className="min-w-[10rem] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {TARGET_LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {LOCALE_LABELS[opt.locale]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-2 lg:items-start">
        <section className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => setTransactionType("rent")}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-semibold transition",
                transactionType === "rent"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400",
              )}
            >
              {copy.forRent}
            </button>
            <button
              type="button"
              onClick={() => setTransactionType("sale")}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-semibold transition",
                transactionType === "sale"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400",
              )}
            >
              {copy.forSale}
            </button>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {copy.propertyDetails}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {copy.propertyDetailsHint}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {copy.photos}
            </label>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  photoInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (photos.length < MAX_PHOTOS) addPhotos(e.dataTransfer.files);
              }}
              onClick={() => photoInputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition",
                dragOver
                  ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
                  : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600",
                photos.length >= MAX_PHOTOS && "pointer-events-none opacity-50",
              )}
            >
              <p className="text-sm font-medium">{copy.dropImages}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {photos.length}/{MAX_PHOTOS} {copy.photosSelected}
              </p>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addPhotos(e.target.files);
                e.target.value = "";
              }}
            />
            {photos.length > 0 && (
              <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {photos.map((photo) => (
                  <li
                    key={photo.id}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
                  >
                    {/*
                      User upload preview (blob: URL, same origin — not a third-party CDN).
                      next/image is unnecessary for ephemeral object URLs.
                    */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(photo.id);
                      }}
                      className="absolute top-1 right-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100"
                    >
                      {copy.remove}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              {copy.basics}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address" className={labelClassName()}>
                  {copy.address}
                </label>
                <input
                  id="address"
                  type="text"
                  placeholder={copy.addressPlaceholder}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClassName()}
                />
              </div>
              <div>
                <label htmlFor="size" className={labelClassName()}>
                  {copy.size}
                </label>
                <input
                  id="size"
                  type="number"
                  min={0}
                  placeholder="85"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={inputClassName()}
                />
              </div>
              <div>
                <label htmlFor="rooms" className={labelClassName()}>
                  {copy.rooms}
                </label>
                <input
                  id="rooms"
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="3"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className={inputClassName()}
                />
              </div>
            </div>
          </div>

          {transactionType === "rent" ? (
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                {copy.rentDetails}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["netColdRent", copy.netColdRent, "netColdRent"],
                    ["utilityCharges", copy.utilityCharges, "utilityCharges"],
                    ["totalRent", copy.totalRent, "totalRent"],
                    ["securityDeposit", copy.securityDeposit, "securityDeposit"],
                  ] as const
                ).map(([key, label, field]) => (
                  <div key={key}>
                    <label htmlFor={key} className={labelClassName()}>
                      {label} ({activeCurrency})
                    </label>
                    <input
                      id={key}
                      type="number"
                      min={0}
                      value={rent[field]}
                      onChange={(e) =>
                        setRent((r) => ({ ...r, [field]: e.target.value }))
                      }
                      className={inputClassName()}
                    />
                    <PriceHint
                      amount={rent[field]}
                      currency={activeCurrency}
                      priceOnRequestLabel={copy.priceOnRequest}
                      show={hasMounted}
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="availableFrom" className={labelClassName()}>
                    {copy.availableFrom}
                  </label>
                  <input
                    id="availableFrom"
                    type="text"
                    value={rent.availableFrom}
                    onChange={(e) =>
                      setRent((r) => ({ ...r, availableFrom: e.target.value }))
                    }
                    className={inputClassName()}
                  />
                </div>
                <div>
                  <label htmlFor="minimumLeaseTerm" className={labelClassName()}>
                    {copy.minimumLeaseTerm}
                  </label>
                  <input
                    id="minimumLeaseTerm"
                    type="text"
                    value={rent.minimumLeaseTerm}
                    onChange={(e) =>
                      setRent((r) => ({
                        ...r,
                        minimumLeaseTerm: e.target.value,
                      }))
                    }
                    className={inputClassName()}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="petPolicy" className={labelClassName()}>
                    {copy.petPolicy}
                  </label>
                  <input
                    id="petPolicy"
                    type="text"
                    value={rent.petPolicy}
                    onChange={(e) =>
                      setRent((r) => ({ ...r, petPolicy: e.target.value }))
                    }
                    className={inputClassName()}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                {copy.saleDetails}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="purchasePrice" className={labelClassName()}>
                    {copy.purchasePrice} ({activeCurrency})
                  </label>
                  <input
                    id="purchasePrice"
                    type="number"
                    min={0}
                    value={sale.purchasePrice}
                    onChange={(e) =>
                      setSale((s) => ({
                        ...s,
                        purchasePrice: e.target.value,
                      }))
                    }
                    className={inputClassName()}
                  />
                  <PriceHint
                    amount={sale.purchasePrice}
                    currency={activeCurrency}
                    priceOnRequestLabel={copy.priceOnRequest}
                    show={hasMounted}
                  />
                </div>
                <div>
                  <label htmlFor="hoaFee" className={labelClassName()}>
                    {copy.hoaFee} ({activeCurrency})
                  </label>
                  <input
                    id="hoaFee"
                    type="number"
                    min={0}
                    value={sale.hoaFee}
                    onChange={(e) =>
                      setSale((s) => ({ ...s, hoaFee: e.target.value }))
                    }
                    className={inputClassName()}
                  />
                  <PriceHint
                    amount={sale.hoaFee}
                    currency={activeCurrency}
                    priceOnRequestLabel={copy.priceOnRequest}
                    show={hasMounted}
                  />
                </div>
                <div>
                  <label htmlFor="rentalYield" className={labelClassName()}>
                    {copy.rentalYield}
                  </label>
                  <input
                    id="rentalYield"
                    type="text"
                    value={sale.rentalYield}
                    onChange={(e) =>
                      setSale((s) => ({ ...s, rentalYield: e.target.value }))
                    }
                    className={inputClassName()}
                  />
                </div>
                <div>
                  <label htmlFor="commissionTerms" className={labelClassName()}>
                    {copy.commissionTerms}
                  </label>
                  <input
                    id="commissionTerms"
                    type="text"
                    value={sale.commissionTerms}
                    onChange={(e) =>
                      setSale((s) => ({
                        ...s,
                        commissionTerms: e.target.value,
                      }))
                    }
                    className={inputClassName()}
                  />
                </div>
              </div>
            </div>
          )}

          {uiLocale === "en" && (
            <div>
              <label htmlFor="currency" className={labelClassName()}>
                {copy.currency}
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value as CurrencyCode)
                }
                className={inputClassName()}
              >
                {ENGLISH_CURRENCY_OPTIONS.map((code) => (
                  <option key={code} value={code}>
                    {CURRENCY_LABELS[code]}
                  </option>
                ))}
              </select>
            </div>
          )}

          <details className="group rounded-xl border border-zinc-200 dark:border-zinc-700">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-zinc-800 marker:content-none dark:text-zinc-200 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                {copy.energySection}
                <span className="text-xs font-normal text-zinc-500 group-open:hidden">
                  {copy.energyExpand}
                </span>
              </span>
            </summary>
            <div className="space-y-4 border-t border-zinc-200 px-4 py-4 dark:border-zinc-700">
              <div>
                <label htmlFor="certType" className={labelClassName()}>
                  {copy.certificateType}
                </label>
                <select
                  id="certType"
                  value={energy.certificateType}
                  onChange={(e) =>
                    setEnergy((en) => ({
                      ...en,
                      certificateType: e.target.value as EnergyCertificateType,
                    }))
                  }
                  className={inputClassName()}
                >
                  <option value="consumption">{copy.certConsumption}</option>
                  <option value="demand">{copy.certDemand}</option>
                  <option value="na">{copy.certNa}</option>
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="energyValue" className={labelClassName()}>
                    {copy.energyValue}
                  </label>
                  <input
                    id="energyValue"
                    type="text"
                    value={energy.energyValue}
                    onChange={(e) =>
                      setEnergy((en) => ({
                        ...en,
                        energyValue: e.target.value,
                      }))
                    }
                    className={inputClassName()}
                  />
                </div>
                <div>
                  <label htmlFor="energyClass" className={labelClassName()}>
                    {copy.energyClass}
                  </label>
                  <select
                    id="energyClass"
                    value={energy.energyClass}
                    onChange={(e) =>
                      setEnergy((en) => ({
                        ...en,
                        energyClass: e.target.value as EnergyClass | "",
                      }))
                    }
                    className={inputClassName()}
                  >
                    <option value="">—</option>
                    {ENERGY_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="heatingSource" className={labelClassName()}>
                    {copy.heatingSource}
                  </label>
                  <select
                    id="heatingSource"
                    value={energy.heatingSource}
                    onChange={(e) =>
                      setEnergy((en) => ({
                        ...en,
                        heatingSource: e.target.value as HeatingSource | "",
                      }))
                    }
                    className={inputClassName()}
                  >
                    <option value="">—</option>
                    {HEATING_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {heatingLabel(src)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="constructionYear" className={labelClassName()}>
                    {copy.constructionYear}
                  </label>
                  <input
                    id="constructionYear"
                    type="text"
                    value={energy.constructionYear}
                    onChange={(e) =>
                      setEnergy((en) => ({
                        ...en,
                        constructionYear: e.target.value,
                      }))
                    }
                    className={inputClassName()}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="heatingInstallYear"
                    className={labelClassName()}
                  >
                    {copy.heatingInstallYear}
                  </label>
                  <input
                    id="heatingInstallYear"
                    type="text"
                    value={energy.heatingInstallYear}
                    onChange={(e) =>
                      setEnergy((en) => ({
                        ...en,
                        heatingInstallYear: e.target.value,
                      }))
                    }
                    className={inputClassName()}
                  />
                </div>
              </div>
            </div>
          </details>

          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              {copy.agentSection}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="agentName" className={labelClassName()}>
                  {copy.agentName}
                </label>
                <input
                  id="agentName"
                  type="text"
                  value={agent.name}
                  onChange={(e) =>
                    setAgent((a) => ({ ...a, name: e.target.value }))
                  }
                  className={inputClassName()}
                />
              </div>
              <div>
                <label htmlFor="agency" className={labelClassName()}>
                  {copy.agency}
                </label>
                <input
                  id="agency"
                  type="text"
                  value={agent.agency}
                  onChange={(e) =>
                    setAgent((a) => ({ ...a, agency: e.target.value }))
                  }
                  className={inputClassName()}
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelClassName()}>
                  {copy.phone}
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={agent.phone}
                  onChange={(e) =>
                    setAgent((a) => ({ ...a, phone: e.target.value }))
                  }
                  className={inputClassName()}
                />
              </div>
              <div>
                <label htmlFor="email" className={labelClassName()}>
                  {copy.email}
                </label>
                <input
                  id="email"
                  type="email"
                  value={agent.email}
                  onChange={(e) =>
                    setAgent((a) => ({ ...a, email: e.target.value }))
                  }
                  className={inputClassName()}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="legalDisclaimer" className={labelClassName()}>
                  {copy.legalDisclaimer}
                </label>
                <textarea
                  id="legalDisclaimer"
                  rows={3}
                  value={agentForLocale.legalDisclaimer}
                  onChange={(e) =>
                    setAgent((a) => ({
                      ...a,
                      legalDisclaimer: e.target.value,
                    }))
                  }
                  className={cn(inputClassName(), "resize-y")}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClassName()}>{copy.floorPlan}</label>
            <p className="mb-2 text-xs text-zinc-500">{copy.floorPlanHint}</p>
            <input
              ref={floorPlanInputRef}
              type="file"
              accept="image/*"
              className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-800 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-200"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                handleFloorPlanChange(file);
                e.target.value = "";
              }}
            />
            {floorPlanPreview && (
              <div className="relative mt-3 aspect-[4/3] max-w-xs overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              {/*
                Floor plan preview (blob: URL, same origin — not a third-party CDN).
              */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={floorPlanPreview}
                  alt={copy.floorPlan}
                  className="h-full w-full object-contain bg-zinc-50 dark:bg-zinc-950"
                />
                <button
                  type="button"
                  onClick={() => handleFloorPlanChange(null)}
                  className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white"
                >
                  {copy.remove}
                </button>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {copy.features}
            </p>
            <div className="flex flex-wrap gap-2">
              {FEATURE_KEYS.map((feature) => {
                const active = features.includes(feature);
                return (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                    )}
                  >
                    {copy.featuresMap[feature]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {copy.tone}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {TONE_KEYS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-sm font-medium transition",
                    tone === option
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
                  )}
                >
                  {copy.tonesMap[option]}
                </button>
              ))}
            </div>
          </div>

          {generateError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
              {generateError}
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {isGenerating ? copy.generating : copy.generate}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={!result || isDownloadingPdf || isGenerating}
            className={cn(
              "w-full rounded-xl border-2 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
              result
                ? "border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100"
                : "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900",
            )}
          >
            {isDownloadingPdf ? copy.preparingPdf : copy.downloadPdf}
          </button>
          {!result && (
            <p className="text-center text-xs text-zinc-500">{copy.pdfHint}</p>
          )}
        </section>

        <section
          ref={previewRef}
          className="flex min-h-[32rem] flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="border-b border-zinc-200 px-4 pt-4 dark:border-zinc-800">
            <h2 className="px-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {copy.preview}
            </h2>
            <div className="mt-3 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              {(
                [
                  ["story", copy.tabStory],
                  ["location", copy.tabLocation],
                  ["social", copy.tabSocial],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPreviewTab(tab)}
                  className={cn(
                    "flex-1 rounded-md py-2 text-sm font-medium transition",
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

          <div className="flex flex-1 flex-col p-4">
            {generateError && !isGenerating && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                {generateError}
              </div>
            )}
            {!hasGenerated && !isGenerating && !generateError ? (
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
                        {isDownloadingPdf ? `${copy.pdfShort}…` : copy.pdfShort}
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
      </main>
    </div>
  );
}
