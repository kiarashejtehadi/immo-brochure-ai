"use client";

import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CreditPackUsage } from "@/components/billing/credit-pack-usage";
import { FormAccordionCard, FormGrid, inputClassName, labelClassName } from "@/components/listing/form-ui";
import { MarketConfigBar } from "@/components/listing/market-config-bar";
import type { BillingStatusResponse } from "@/types/billing";
import type { FormCopy } from "@/lib/i18n-form";
import type { WorkflowUiCopy } from "@/lib/i18n-workflow";
import type {
  FeatureKey,
  ToneKey,
  OutputLanguage,
  UiCopy,
} from "@/lib/i18n";
import { LOCALE_LABELS } from "@/lib/i18n";
import { EXPOSE_LANGUAGE_OPTIONS } from "@/lib/target-languages";
import {
  CURRENCY_LABELS,
  ENGLISH_CURRENCY_OPTIONS,
  formatPriceAmount,
  type CurrencyCode,
} from "@/lib/currency";
import { blockNonNumericKey, sanitizeNumericInput } from "@/lib/numeric-input";
import { LISTING_COUNTRY_OPTIONS } from "@/lib/location/format-address";
import { btnPrimaryCompact, chipActive, chipInactive, segmentActive } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { shouldShowDachCommissionControls } from "@/lib/listing-market-presets";
import type {
  AgentFormData,
  EnergyCertificateType,
  EnergyClass,
  EnergyFormData,
  HeatingSource,
  ListingAddress,
  PropertyCondition,
  PropertyDetails,
  PropertyType,
  ParkingType,
  FurnishingStatus,
  RentFormData,
  SaleFormData,
  TransactionType,
  TargetMarket,
  UserRole,
  CommissionPreset,
  GenerateResult,
} from "@/types/listing";

const MAX_PHOTOS = 5;

const FEATURE_KEYS: FeatureKey[] = [
  "Balcony Terrace",
  "Fitted Kitchen",
  "Elevator",
  "Garden",
  "Guest WC",
  "Cellar",
  "Wheelchair Accessible",
];

const FURNISHING_STATUSES: FurnishingStatus[] = [
  "unfurnished",
  "partially_furnished",
  "fully_furnished",
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
  "wood_pellets",
];

const PROPERTY_TYPES: PropertyType[] = [
  "apartment",
  "house",
  "penthouse",
  "commercial",
  "land",
];

const PARKING_TYPES: ParkingType[] = ["none", "outdoor", "garage", "underground"];

const CONDITIONS: PropertyCondition[] = [
  "first_occupancy",
  "modernized",
  "well_maintained",
  "needs_renovation",
];

export type PhotoPreview = {
  id: string;
  file: File;
  url: string;
};

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

function NumericField({
  id,
  label,
  value,
  onChange,
  allowDecimal = true,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowDecimal?: boolean;
  placeholder?: string;
  hint?: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName()}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        pattern={allowDecimal ? "[0-9]*[.]?[0-9]*" : "[0-9]*"}
        min={0}
        placeholder={placeholder}
        value={value}
        onKeyDown={(e) => blockNonNumericKey(e, allowDecimal)}
        onChange={(e) => onChange(sanitizeNumericInput(e.target.value, allowDecimal))}
        className={inputClassName()}
      />
      {hint}
    </div>
  );
}

export type ListingFormProps = {
  copy: UiCopy & FormCopy & WorkflowUiCopy;
  targetMarket: TargetMarket;
  onTargetMarket: (market: TargetMarket) => void;
  userRole: UserRole;
  onUserRole: (role: UserRole) => void;
  commissionPreset: CommissionPreset;
  onCommissionPreset: (preset: CommissionPreset) => void;
  bedrooms: string;
  onBedrooms: (value: string) => void;
  bathrooms: string;
  onBathrooms: (value: string) => void;
  onFillDemoDach?: () => void;
  transactionType: TransactionType;
  onTransactionType: (type: TransactionType) => void;
  property: PropertyDetails;
  onProperty: (patch: Partial<PropertyDetails>) => void;
  address: ListingAddress;
  onAddress: (patch: Partial<ListingAddress>) => void;
  size: string;
  onSize: (value: string) => void;
  rooms: string;
  onRooms: (value: string) => void;
  currency: CurrencyCode;
  onCurrency: (value: CurrencyCode) => void;
  showCurrencySelect: boolean;
  hasMounted: boolean;
  rent: RentFormData;
  onRent: (patch: Partial<RentFormData>) => void;
  sale: SaleFormData;
  onSale: (patch: Partial<SaleFormData>) => void;
  energy: EnergyFormData;
  onEnergy: (patch: Partial<EnergyFormData>) => void;
  heatingLabel: (source: HeatingSource) => string;
  features: FeatureKey[];
  onToggleFeature: (feature: FeatureKey) => void;
  photos: PhotoPreview[];
  dragOver: boolean;
  onDragOver: (over: boolean) => void;
  onAddPhotos: (files: FileList | File[]) => void;
  onRemovePhoto: (id: string) => void;
  photoInputRef: React.RefObject<HTMLInputElement>;
  floorPlanPreview: string | null;
  floorPlanInputRef: React.RefObject<HTMLInputElement>;
  onFloorPlanChange: (file: File | null) => void;
  agent: AgentFormData;
  onAgent: (patch: Partial<AgentFormData>) => void;
  onResetAgentFromBranding?: () => void;
  canResetFromBranding?: boolean;
  tone: ToneKey;
  onTone: (tone: ToneKey) => void;
  targetLanguage: OutputLanguage;
  onTargetLanguage: (lang: OutputLanguage) => void;
  generateError: string | null;
  billingHint: "auth" | "checkout" | null;
  onOpenAuth: () => void;
  billingStatus: BillingStatusResponse | null;
  isGenerating: boolean;
  isDownloadingPdf: boolean;
  result: GenerateResult | null;
  onGenerate: () => void;
  onDownloadPdf: () => void;
};

export function ListingForm(props: ListingFormProps) {
  const {
    copy,
    targetMarket,
    onTargetMarket,
    userRole,
    onUserRole,
    commissionPreset,
    onCommissionPreset,
    bedrooms,
    onBedrooms,
    bathrooms,
    onBathrooms,
    onFillDemoDach,
    transactionType,
    onTransactionType,
    property,
    onProperty,
    address,
    onAddress,
    size,
    onSize,
    rooms,
    onRooms,
    currency,
    onCurrency,
    showCurrencySelect,
    hasMounted,
    rent,
    onRent,
    sale,
    onSale,
    energy,
    onEnergy,
    heatingLabel,
    features,
    onToggleFeature,
    photos,
    dragOver,
    onDragOver,
    onAddPhotos,
    onRemovePhoto,
    photoInputRef,
    floorPlanPreview,
    floorPlanInputRef,
    onFloorPlanChange,
    agent,
    onAgent,
    onResetAgentFromBranding,
    canResetFromBranding,
    tone,
    onTone,
    targetLanguage,
    onTargetLanguage,
    generateError,
    billingHint,
    onOpenAuth,
    billingStatus,
    isGenerating,
    isDownloadingPdf,
    result,
    onGenerate,
    onDownloadPdf,
  } = props;

  const epcDetailsVisible = energy.certificateType !== "na";
  const isDach = targetMarket === "dach";
  const showDachCommission =
    isDach && shouldShowDachCommissionControls(transactionType, userRole);
  const [globalEnergyOpen, setGlobalEnergyOpen] = useState(false);

  const transactionToggle = (
    <div className="flex gap-1 rounded-lg bg-indigo-50/80 p-1 dark:bg-indigo-950/40">
      <button
        type="button"
        onClick={() => onTransactionType("rent")}
        className={cn(
          "flex-1 rounded-md py-2.5 text-sm font-semibold transition-all duration-200",
          transactionType === "rent"
            ? segmentActive
            : "text-zinc-600 hover:text-indigo-700 dark:text-zinc-400 dark:hover:text-indigo-300",
        )}
      >
        {isDach ? copy.dachForRent : copy.forRent}
      </button>
      <button
        type="button"
        onClick={() => onTransactionType("sale")}
        className={cn(
          "flex-1 rounded-md py-2.5 text-sm font-semibold transition-all duration-200",
          transactionType === "sale"
            ? segmentActive
            : "text-zinc-600 hover:text-indigo-700 dark:text-zinc-400 dark:hover:text-indigo-300",
        )}
      >
        {isDach ? copy.dachForSale : copy.forSale}
      </button>
    </div>
  );

  const dachConditionLabel = useCallback(
    (value: PropertyCondition) => {
      const map: Record<PropertyCondition, string> = {
        first_occupancy: copy.dachConditionFirstOccupancy,
        modernized: copy.dachConditionRenovated,
        well_maintained: copy.dachConditionMaintained,
        needs_renovation: copy.dachConditionNeedsRenovation,
      };
      return map[value];
    },
    [copy],
  );

  const hasMinimumFields =
    property.propertyType !== "" &&
    ((address.streetAddress.trim() !== "" && address.city.trim() !== "") ||
      size.trim() !== "");
  const showCreditCost =
    billingStatus?.billingEnabled === true &&
    !billingStatus.hasActiveSubscription &&
    (billingStatus.remainingCredits ?? 0) > 0;
  const generateButtonLabel = isGenerating
    ? copy.generating
    : showCreditCost
      ? copy.generateWithCredit
      : copy.generate;

  const propertyTypeLabel = useCallback(
    (type: PropertyType) => {
      const map: Record<PropertyType, string> = {
        apartment: copy.propertyTypeApartment,
        house: copy.propertyTypeHouse,
        penthouse: copy.propertyTypePenthouse,
        commercial: copy.propertyTypeCommercial,
        land: copy.propertyTypeLand,
      };
      return map[type];
    },
    [copy],
  );

  const parkingLabel = useCallback(
    (type: ParkingType) => {
      const map: Record<ParkingType, string> = {
        none: copy.parkingNone,
        outdoor: copy.parkingOutdoor,
        garage: copy.parkingGarage,
        underground: copy.parkingUnderground,
      };
      return map[type];
    },
    [copy],
  );

  const conditionLabel = useCallback(
    (value: PropertyCondition) => {
      const map: Record<PropertyCondition, string> = {
        first_occupancy: copy.conditionFirstOccupancy,
        modernized: copy.conditionModernized,
        well_maintained: copy.conditionWellMaintained,
        needs_renovation: copy.conditionNeedsRenovation,
      };
      return map[value];
    },
    [copy],
  );

  const [openStep, setOpenStep] = useState(1);

  return (
    <div className="space-y-3 pb-8">
      <MarketConfigBar
        copy={copy}
        targetMarket={targetMarket}
        onTargetMarket={onTargetMarket}
        userRole={userRole}
        onUserRole={onUserRole}
      />

      <FormAccordionCard
        step={1}
        title={copy.sectionListingOverview}
        isOpen={openStep === 1}
        onToggle={() => setOpenStep(1)}
      >
        {!isDach ? transactionToggle : null}

        <div>
          <label htmlFor="propertyType" className={labelClassName()}>
            {copy.propertyType}
          </label>
          <select
            id="propertyType"
            value={property.propertyType}
            onChange={(e) =>
              onProperty({ propertyType: e.target.value as PropertyType | "" })
            }
            className={inputClassName()}
          >
            <option value="">—</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {propertyTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <FormGrid>
          <div className="sm:col-span-2">
            <label htmlFor="streetAddress" className={labelClassName()}>
              {copy.streetAddress}
            </label>
            <input
              id="streetAddress"
              placeholder={copy.streetAddressPlaceholder}
              value={address.streetAddress}
              onChange={(e) => onAddress({ streetAddress: e.target.value })}
              className={inputClassName()}
            />
          </div>
          <div>
            <label htmlFor="postalCode" className={labelClassName()}>
              {copy.postalCode}
            </label>
            <input
              id="postalCode"
              placeholder={copy.postalCodePlaceholder}
              value={address.postalCode}
              onChange={(e) => onAddress({ postalCode: e.target.value })}
              className={inputClassName()}
            />
          </div>
          <div>
            <label htmlFor="city" className={labelClassName()}>
              {copy.city}
            </label>
            <input
              id="city"
              placeholder={copy.cityPlaceholder}
              value={address.city}
              onChange={(e) => onAddress({ city: e.target.value })}
              className={inputClassName()}
            />
          </div>
          <div>
            <label htmlFor="country" className={labelClassName()}>
              {copy.country}
            </label>
            <select
              id="country"
              value={address.country}
              onChange={(e) => onAddress({ country: e.target.value })}
              className={inputClassName()}
            >
              {LISTING_COUNTRY_OPTIONS.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </FormGrid>
      </FormAccordionCard>

      <FormAccordionCard
        step={2}
        title={copy.sectionSpecsPricing}
        isOpen={openStep === 2}
        onToggle={() => setOpenStep(2)}
      >
        {isDach ? <div className="mb-4">{transactionToggle}</div> : null}

        <FormGrid cols={3}>
          <NumericField
            id="size"
            label={copy.size}
            value={size}
            onChange={onSize}
            placeholder="85"
          />
          <NumericField
            id="rooms"
            label={copy.rooms}
            value={rooms}
            onChange={onRooms}
            placeholder="3"
          />
          {!isDach ? (
            <>
              <NumericField
                id="bedrooms"
                label={copy.bedrooms}
                value={bedrooms}
                onChange={onBedrooms}
                placeholder="2"
              />
              <NumericField
                id="bathrooms"
                label={copy.bathrooms}
                value={bathrooms}
                onChange={onBathrooms}
                placeholder="1"
                allowDecimal
              />
            </>
          ) : (
            <div>
              <label htmlFor="floorLevel" className={labelClassName()}>
                {copy.floorLevel}
              </label>
              <input
                id="floorLevel"
                placeholder={copy.floorLevelPlaceholder}
                value={property.floorLevel}
                onChange={(e) => onProperty({ floorLevel: e.target.value })}
                className={inputClassName()}
              />
            </div>
          )}

          {isDach ? (
            transactionType === "rent" ? (
              <>
                <NumericField
                  id="netColdRent"
                  label={`${copy.netColdRent} (€)`}
                  value={rent.netColdRent}
                  onChange={(v) => onRent({ netColdRent: v })}
                  hint={
                    <PriceHint
                      amount={rent.netColdRent}
                      currency={currency}
                      priceOnRequestLabel={copy.priceOnRequest}
                      show={hasMounted}
                    />
                  }
                />
                <NumericField
                  id="utilityCharges"
                  label={`${copy.utilityCharges} (€)`}
                  value={rent.utilityCharges}
                  onChange={(v) => onRent({ utilityCharges: v })}
                  hint={
                    <PriceHint
                      amount={rent.utilityCharges}
                      currency={currency}
                      priceOnRequestLabel={copy.priceOnRequest}
                      show={hasMounted}
                    />
                  }
                />
                <NumericField
                  id="totalRent"
                  label={`${copy.totalRent} (€)`}
                  value={rent.totalRent}
                  onChange={(v) => onRent({ totalRent: v })}
                  hint={
                    <PriceHint
                      amount={rent.totalRent}
                      currency={currency}
                      priceOnRequestLabel={copy.priceOnRequest}
                      show={hasMounted}
                    />
                  }
                />
                <div>
                  <label htmlFor="securityDeposit" className={labelClassName()}>
                    {copy.dachDeposit}
                  </label>
                  <input
                    id="securityDeposit"
                    placeholder="3 Monatskaltmieten"
                    value={rent.securityDeposit}
                    onChange={(e) => onRent({ securityDeposit: e.target.value })}
                    className={inputClassName()}
                  />
                </div>
              </>
            ) : (
              <>
                <NumericField
                  id="purchasePrice"
                  label={`${copy.purchasePrice} (€)`}
                  value={sale.purchasePrice}
                  onChange={(v) => onSale({ purchasePrice: v })}
                  hint={
                    <PriceHint
                      amount={sale.purchasePrice}
                      currency={currency}
                      priceOnRequestLabel={copy.priceOnRequest}
                      show={hasMounted}
                    />
                  }
                />
                <NumericField
                  id="hoaFee"
                  label={copy.dachHouseFee}
                  value={sale.hoaFee}
                  onChange={(v) => onSale({ hoaFee: v })}
                  hint={
                    <PriceHint
                      amount={sale.hoaFee}
                      currency={currency}
                      priceOnRequestLabel={copy.priceOnRequest}
                      show={hasMounted}
                    />
                  }
                />
              </>
            )
          ) : transactionType === "rent" ? (
            <NumericField
              id="globalPrice"
              label={`${copy.globalPrice} (${currency})`}
              value={rent.totalRent || rent.netColdRent}
              onChange={(v) => onRent({ totalRent: v, netColdRent: v })}
              hint={
                <PriceHint
                  amount={rent.totalRent || rent.netColdRent}
                  currency={currency}
                  priceOnRequestLabel={copy.priceOnRequest}
                  show={hasMounted}
                />
              }
            />
          ) : (
            <NumericField
              id="globalPurchasePrice"
              label={`${copy.globalPrice} (${currency})`}
              value={sale.purchasePrice}
              onChange={(v) => onSale({ purchasePrice: v })}
              hint={
                <PriceHint
                  amount={sale.purchasePrice}
                  currency={currency}
                  priceOnRequestLabel={copy.priceOnRequest}
                  show={hasMounted}
                />
              }
            />
          )}

          {showDachCommission ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <p className={labelClassName()}>{copy.commissionLabel}</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                {(["commission_free", "buyer_commission"] as CommissionPreset[]).map((preset) => {
                  const freeLabel =
                    transactionType === "rent" ? copy.commissionFreeRent : copy.commissionFree;
                  const paidLabel =
                    transactionType === "rent"
                      ? copy.commissionLandlordPaid
                      : copy.commissionBuyer;
                  const label = preset === "commission_free" ? freeLabel : paidLabel;

                  return (
                  <label
                    key={`${transactionType}-${preset}`}
                    className={cn(
                      "flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm",
                      commissionPreset === preset
                        ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40"
                        : "border-zinc-200 dark:border-zinc-700",
                    )}
                  >
                    <input
                      type="radio"
                      name={`commissionPreset-${transactionType}`}
                      checked={commissionPreset === preset}
                      onChange={() => onCommissionPreset(preset)}
                      className="text-indigo-600"
                    />
                    {label}
                  </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {!isDach && showCurrencySelect ? (
            <div>
              <label htmlFor="currency" className={labelClassName()}>
                {copy.currency}
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => onCurrency(e.target.value as CurrencyCode)}
                className={inputClassName()}
              >
                {ENGLISH_CURRENCY_OPTIONS.map((code) => (
                  <option key={code} value={code}>
                    {CURRENCY_LABELS[code]}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </FormGrid>
      </FormAccordionCard>

      <FormAccordionCard
        step={3}
        title={copy.sectionBuildingEnergy}
        isOpen={openStep === 3}
        onToggle={() => setOpenStep(3)}
      >
        {isDach ? (
          <>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {copy.epcSection}
              </p>
              <FormGrid>
                <div className="sm:col-span-2">
                  <label htmlFor="certType" className={labelClassName()}>
                    {copy.certificateType}
                  </label>
                  <select
                    id="certType"
                    value={energy.certificateType}
                    onChange={(e) => {
                      const certificateType = e.target.value as EnergyCertificateType;
                      if (certificateType === "na") {
                        onEnergy({ certificateType, energyValue: "", energyClass: "" });
                      } else {
                        onEnergy({ certificateType });
                      }
                    }}
                    className={inputClassName()}
                  >
                    <option value="consumption">{copy.certConsumption}</option>
                    <option value="demand">{copy.certDemand}</option>
                    <option value="na">{copy.dachCertHeritage}</option>
                  </select>
                </div>
                {epcDetailsVisible ? (
                  <>
                    <div>
                      <label htmlFor="energyClass" className={labelClassName()}>
                        {copy.energyClass}
                      </label>
                      <select
                        id="energyClass"
                        value={energy.energyClass}
                        onChange={(e) =>
                          onEnergy({ energyClass: e.target.value as EnergyClass | "" })
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
                    <NumericField
                      id="energyValue"
                      label={copy.energyValueKwh}
                      value={energy.energyValue}
                      onChange={(v) => onEnergy({ energyValue: v })}
                      allowDecimal
                      placeholder="120"
                    />
                  </>
                ) : null}
                <div className="sm:col-span-2">
                  <label htmlFor="heatingSource" className={labelClassName()}>
                    {copy.heatingSource}
                  </label>
                  <select
                    id="heatingSource"
                    value={energy.heatingSource}
                    onChange={(e) =>
                      onEnergy({
                        heatingSource: e.target.value as HeatingSource | "",
                      })
                    }
                    className={inputClassName()}
                  >
                    <option value="">—</option>
                    {HEATING_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src === "wood_pellets" ? copy.woodPellets : heatingLabel(src)}
                      </option>
                    ))}
                  </select>
                </div>
                <NumericField
                  id="constructionYear"
                  label={copy.constructionYear}
                  value={energy.constructionYear}
                  onChange={(v) => onEnergy({ constructionYear: v })}
                  allowDecimal={false}
                  placeholder="1998"
                />
                <div>
                  <label htmlFor="condition" className={labelClassName()}>
                    {copy.condition}
                  </label>
                  <select
                    id="condition"
                    value={property.condition}
                    onChange={(e) =>
                      onProperty({ condition: e.target.value as PropertyCondition | "" })
                    }
                    className={inputClassName()}
                  >
                    <option value="">—</option>
                    {CONDITIONS.map((value) => (
                      <option key={value} value={value}>
                        {dachConditionLabel(value)}
                      </option>
                    ))}
                  </select>
                </div>
              </FormGrid>
            </div>
            <FormGrid>
              <div>
                <label htmlFor="parking" className={labelClassName()}>
                  {copy.parking}
                </label>
                <select
                  id="parking"
                  value={property.parking}
                  onChange={(e) =>
                    onProperty({ parking: e.target.value as ParkingType | "" })
                  }
                  className={inputClassName()}
                >
                  <option value="">—</option>
                  {PARKING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {parkingLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
              <NumericField
                id="parkingFee"
                label={`${copy.parkingFee} (€)`}
                value={property.parkingFee}
                onChange={(v) => onProperty({ parkingFee: v })}
                hint={
                  <PriceHint
                    amount={property.parkingFee}
                    currency={currency}
                    priceOnRequestLabel={copy.priceOnRequest}
                    show={hasMounted}
                  />
                }
              />
            </FormGrid>
          </>
        ) : (
          <>
            <FormGrid>
              <div>
                <label htmlFor="parking" className={labelClassName()}>
                  {copy.parking}
                </label>
                <select
                  id="parking"
                  value={property.parking}
                  onChange={(e) =>
                    onProperty({ parking: e.target.value as ParkingType | "" })
                  }
                  className={inputClassName()}
                >
                  <option value="">—</option>
                  {PARKING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {parkingLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
              <NumericField
                id="parkingFee"
                label={`${copy.parkingFee} (${currency})`}
                value={property.parkingFee}
                onChange={(v) => onProperty({ parkingFee: v })}
                hint={
                  <PriceHint
                    amount={property.parkingFee}
                    currency={currency}
                    priceOnRequestLabel={copy.priceOnRequest}
                    show={hasMounted}
                  />
                }
              />
              <div className="sm:col-span-2">
                <label htmlFor="condition" className={labelClassName()}>
                  {copy.condition}
                </label>
                <select
                  id="condition"
                  value={property.condition}
                  onChange={(e) =>
                    onProperty({ condition: e.target.value as PropertyCondition | "" })
                  }
                  className={inputClassName()}
                >
                  <option value="">—</option>
                  {CONDITIONS.map((value) => (
                    <option key={value} value={value}>
                      {conditionLabel(value)}
                    </option>
                  ))}
                </select>
              </div>
            </FormGrid>

            <button
              type="button"
              onClick={() => setGlobalEnergyOpen((open) => !open)}
              className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-left text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {copy.globalEnergyExpand}
              <span className="float-right text-zinc-400">{globalEnergyOpen ? "−" : "+"}</span>
            </button>

            {globalEnergyOpen ? (
              <div className="mt-3 rounded-lg border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <FormGrid>
                  <div className="sm:col-span-2">
                    <label htmlFor="certTypeGlobal" className={labelClassName()}>
                      {copy.certificateType}
                    </label>
                    <select
                      id="certTypeGlobal"
                      value={energy.certificateType}
                      onChange={(e) => {
                        const certificateType = e.target.value as EnergyCertificateType;
                        if (certificateType === "na") {
                          onEnergy({ certificateType, energyValue: "", energyClass: "" });
                        } else {
                          onEnergy({ certificateType });
                        }
                      }}
                      className={inputClassName()}
                    >
                      <option value="consumption">{copy.certConsumption}</option>
                      <option value="demand">{copy.certDemand}</option>
                      <option value="na">{copy.certNa}</option>
                    </select>
                  </div>
                  {epcDetailsVisible ? (
                    <>
                      <NumericField
                        id="energyValueGlobal"
                        label={copy.energyValue}
                        value={energy.energyValue}
                        onChange={(v) => onEnergy({ energyValue: v })}
                        allowDecimal
                        placeholder="120"
                      />
                      <div>
                        <label htmlFor="energyClassGlobal" className={labelClassName()}>
                          {copy.energyClass}
                        </label>
                        <select
                          id="energyClassGlobal"
                          value={energy.energyClass}
                          onChange={(e) =>
                            onEnergy({ energyClass: e.target.value as EnergyClass | "" })
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
                    </>
                  ) : null}
                  <div className="sm:col-span-2">
                    <label htmlFor="heatingSourceGlobal" className={labelClassName()}>
                      {copy.heatingSource}
                    </label>
                    <select
                      id="heatingSourceGlobal"
                      value={energy.heatingSource}
                      onChange={(e) =>
                        onEnergy({
                          heatingSource: e.target.value as HeatingSource | "",
                        })
                      }
                      className={inputClassName()}
                    >
                      <option value="">—</option>
                      {HEATING_SOURCES.map((src) => (
                        <option key={src} value={src}>
                          {src === "wood_pellets" ? copy.woodPellets : heatingLabel(src)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <NumericField
                    id="constructionYearGlobal"
                    label={copy.constructionYear}
                    value={energy.constructionYear}
                    onChange={(v) => onEnergy({ constructionYear: v })}
                    allowDecimal={false}
                    placeholder="1998"
                  />
                  <NumericField
                    id="heatingInstallYearGlobal"
                    label={copy.heatingInstallYear}
                    value={energy.heatingInstallYear}
                    onChange={(v) => onEnergy({ heatingInstallYear: v })}
                    allowDecimal={false}
                    placeholder="2015"
                  />
                </FormGrid>
              </div>
            ) : null}
          </>
        )}
      </FormAccordionCard>

      <FormAccordionCard
        step={4}
        title={copy.sectionFeatures}
        isOpen={openStep === 4}
        onToggle={() => setOpenStep(4)}
      >
        <div className="mb-4 max-w-sm">
          <label htmlFor="furnishingStatus" className={labelClassName()}>
            {copy.furnishingStatus}
          </label>
          <select
            id="furnishingStatus"
            value={property.furnishingStatus}
            onChange={(e) =>
              onProperty({
                furnishingStatus: e.target.value as FurnishingStatus,
              })
            }
            className={inputClassName()}
          >
            {FURNISHING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "unfurnished"
                  ? copy.furnishingUnfurnished
                  : status === "partially_furnished"
                    ? copy.furnishingPartially
                    : copy.furnishingFully}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FEATURE_KEYS.map((feature) => {
            const active = features.includes(feature);
            return (
              <button
                key={feature}
                type="button"
                onClick={() => onToggleFeature(feature)}
                className={cn(
                  "w-full rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  active ? chipActive : chipInactive,
                )}
              >
                {copy.featuresMap[feature]}
              </button>
            );
          })}
        </div>
      </FormAccordionCard>

      <FormAccordionCard
        step={5}
        title={copy.sectionMedia}
        description={copy.propertyDetailsHint}
        isOpen={openStep === 5}
        onToggle={() => setOpenStep(5)}
      >
        <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50/80 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-950/40">
          <input
            type="checkbox"
            checked={property.isStagedOrModel}
            onChange={(e) => onProperty({ isStagedOrModel: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>
            <span className={labelClassName()}>{copy.isStagedOrModel}</span>
            <span className="mt-1 block text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {copy.isStagedOrModelHint}
            </span>
          </span>
        </label>
        <div>
          <label className={labelClassName()}>{copy.photos}</label>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") photoInputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              onDragOver(true);
            }}
            onDragLeave={() => onDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              onDragOver(false);
              if (photos.length < MAX_PHOTOS) onAddPhotos(e.dataTransfer.files);
            }}
            onClick={() => photoInputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition",
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
              if (e.target.files) onAddPhotos(e.target.files);
              e.target.value = "";
            }}
          />
          {photos.length > 0 ? (
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {photos.map((photo) => (
                <li
                  key={photo.id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
                >
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
                      onRemovePhoto(photo.id);
                    }}
                    className="absolute top-1 right-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100"
                  >
                    {copy.remove}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <label className={labelClassName()}>{copy.floorPlan}</label>
          <p className="mb-2 text-xs text-zinc-500">{copy.floorPlanHint}</p>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") floorPlanInputRef.current?.click();
            }}
            onClick={() => floorPlanInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 px-4 py-8 text-center transition hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
          >
            <p className="text-sm font-medium">
              {floorPlanPreview ? copy.floorPlan : copy.dropImages}
            </p>
          </div>
          <input
            ref={floorPlanInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onFloorPlanChange(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          {floorPlanPreview ? (
            <div className="relative mt-3 aspect-[4/3] max-w-sm overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={floorPlanPreview}
                alt={copy.floorPlan}
                className="h-full w-full bg-zinc-50 object-contain dark:bg-zinc-950"
              />
              <button
                type="button"
                onClick={() => onFloorPlanChange(null)}
                className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white"
              >
                {copy.remove}
              </button>
            </div>
          ) : null}
        </div>
      </FormAccordionCard>

      <FormAccordionCard
        step={6}
        title={copy.sectionAgentOutput}
        isOpen={openStep === 6}
        onToggle={() => setOpenStep(6)}
      >
        {(onResetAgentFromBranding || onFillDemoDach) ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {onResetAgentFromBranding ? (
              <button
                type="button"
                disabled={!canResetFromBranding}
                onClick={onResetAgentFromBranding}
                className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                {copy.resetToBrandingDefaults}
              </button>
            ) : null}
            {onFillDemoDach ? (
              <button
                type="button"
                onClick={onFillDemoDach}
                className="cursor-pointer rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-900 transition hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-100 dark:hover:bg-indigo-950"
              >
                {copy.fillDemoDachListing}
              </button>
            ) : null}
          </div>
        ) : null}
        <FormGrid>
          <div>
            <label htmlFor="agentName" className={labelClassName()}>
              {copy.agentName}
            </label>
            <input
              id="agentName"
              value={agent.name}
              onChange={(e) => onAgent({ name: e.target.value })}
              className={inputClassName()}
            />
          </div>
          <div>
            <label htmlFor="agency" className={labelClassName()}>
              {copy.agency}
            </label>
            <input
              id="agency"
              value={agent.agency}
              onChange={(e) => onAgent({ agency: e.target.value })}
              className={inputClassName()}
            />
          </div>
          {isDach ? (
            <div className="sm:col-span-2">
              <label htmlFor="companyAddress" className={labelClassName()}>
                {copy.agentCompanyAddress}
              </label>
              <input
                id="companyAddress"
                value={agent.companyAddress}
                onChange={(e) => onAgent({ companyAddress: e.target.value })}
                className={inputClassName()}
              />
            </div>
          ) : null}
          <div>
            <label htmlFor="phone" className={labelClassName()}>
              {copy.phone}
            </label>
            <input
              id="phone"
              type="tel"
              value={agent.phone}
              onChange={(e) => onAgent({ phone: e.target.value })}
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
              onChange={(e) => onAgent({ email: e.target.value })}
              className={inputClassName()}
            />
          </div>
          {isDach ? (
            <div className="sm:col-span-2">
              <label htmlFor="licenseId" className={labelClassName()}>
                {copy.agentLicenseId}
              </label>
              <input
                id="licenseId"
                value={agent.licenseId}
                onChange={(e) => onAgent({ licenseId: e.target.value })}
                placeholder="§ 34c GewO — …"
                className={inputClassName()}
              />
            </div>
          ) : null}
        </FormGrid>

        <div>
          <p className={labelClassName()}>{copy.tone}</p>
          <div className="grid grid-cols-3 gap-2">
            {TONE_KEYS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onTone(option)}
                className={cn(
                  "rounded-lg border px-2 py-2.5 text-sm font-medium transition-all duration-200",
                  tone === option
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 dark:border-indigo-500 dark:bg-indigo-500"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                )}
              >
                {copy.tonesMap[option]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="expose-language" className={labelClassName()}>
            {copy.exposeLanguage}
          </label>
          <p className="mb-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {copy.exposeLanguageHint}
          </p>
          <select
            id="expose-language"
            value={targetLanguage}
            onChange={(e) => onTargetLanguage(e.target.value as OutputLanguage)}
            className={inputClassName()}
          >
            {EXPOSE_LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {LOCALE_LABELS[opt.locale]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="legalDisclaimer" className={labelClassName()}>
            {copy.legalDisclaimer}
          </label>
          <textarea
            id="legalDisclaimer"
            rows={2}
            value={agent.legalDisclaimer}
            onChange={(e) => onAgent({ legalDisclaimer: e.target.value })}
            className={cn(inputClassName(), "resize-y")}
          />
        </div>
      </FormAccordionCard>

      <div className="sticky bottom-0 z-10 -mx-1 space-y-3 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
        {generateError ? (
          <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
            <p>{generateError}</p>
            {billingHint === "auth" ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="text-sm font-semibold underline"
              >
                Sign in with email
              </button>
            ) : null}
            {billingHint === "checkout" ? (
              <Link href="/checkout" className="inline-block text-sm font-semibold underline">
                View pricing & buy credits
              </Link>
            ) : null}
          </div>
        ) : null}

        <CreditPackUsage status={billingStatus} variant="panel" />

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating || !hasMinimumFields}
              className={cn(btnPrimaryCompact, "w-full sm:col-span-1")}
            >
              {generateButtonLabel}
            </button>
            {!hasMinimumFields && !isGenerating ? (
              <p className="text-xs leading-snug text-amber-800/90 dark:text-amber-200/90">
                {copy.generateMinimumFieldsHint}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={!result || isDownloadingPdf}
            className={cn(
              "rounded-xl border-2 py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
              result
                ? "border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100"
                : "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900",
            )}
          >
            {isDownloadingPdf ? copy.preparingPdf : copy.downloadPdf}
          </button>
        </div>
        {!result ? (
          <p className="text-center text-xs text-zinc-500">{copy.pdfHint}</p>
        ) : null}
      </div>
    </div>
  );
}

export { MAX_PHOTOS };
