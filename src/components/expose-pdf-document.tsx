import type { ReactNode } from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatPriceAmount, type CurrencyCode } from "@/lib/currency";
import { PDF_WATERMARK_TEXT } from "@/lib/branding/constants";
import { resolvePdfFontFamily } from "@/lib/pdf-fonts";
import { sanitizePdfImageSrc } from "@/lib/pdf-image-data-url";
import { filterPdfTableRows, filterPdfListingDetailRows, isLikelyRawPdfMetadata, isPdfTableValueEmpty } from "@/lib/pdf-table-rows";
import {
  formatPdfDisplayAddress,
  splitPdfParagraphs,
} from "@/lib/pdf-text-format";
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_PRIMARY_COLOR,
  type PDFBrandingProps,
} from "@/types/branding";
import type { BrochurePdfProps } from "@/types/brochure-pdf";
import {
  PageBackdropWatermarks,
  TextAreaWatermark,
  WatermarkedImage,
} from "@/components/pdf-watermark-overlays";

export type { BrochurePdfProps, PDFBrandingProps };

const PAGE_PAD_H = 36;
const PAGE_PAD_V = 28;
const A4_HEIGHT_PT = 841.89;
const PAGE_BODY_MIN_HEIGHT = A4_HEIGHT_PT - PAGE_PAD_V * 2 - 40;
const MAP_HEIGHT_PT = 220;
const FLOOR_PLAN_HEIGHT_PT = 220;
const PAGE4_SPECS_MAX_ROWS = 8;
const METRIC_BOX_HEIGHT = 58;
const HEADER_PAD_TOP = 20;
const HEADER_PAD_BOTTOM = 15;
const HEADER_BAR_CLEARANCE = 15;
const COVER_SECTION_GAP = 25;
const RHYTHM_SM = 12;
const RHYTHM_MD = 14;
const RHYTHM_LG = 16;

type ResolvedPdfBranding = Required<
  Pick<PDFBrandingProps, "primaryColor" | "accentColor">
> & {
  pdfFont: string;
  logoDataUrl?: string;
  avatarDataUrl?: string;
};

function resolveBranding(props: BrochurePdfProps): ResolvedPdfBranding {
  return {
    primaryColor: props.primaryColor ?? props.brandColor ?? DEFAULT_PRIMARY_COLOR,
    accentColor: props.accentColor ?? DEFAULT_ACCENT_COLOR,
    pdfFont: resolvePdfFontFamily(props.fontFamily),
    logoDataUrl: sanitizePdfImageSrc(props.logoDataUrl),
    avatarDataUrl: sanitizePdfImageSrc(props.avatarDataUrl),
  };
}

const stylesCache = new Map<string, ReturnType<typeof createStyles>>();

function getStyles(branding: ResolvedPdfBranding) {
  const key = `${branding.primaryColor}|${branding.accentColor}|${branding.pdfFont}`;
  let styles = stylesCache.get(key);
  if (!styles) {
    styles = createStyles(branding);
    stylesCache.set(key, styles);
  }
  return styles;
}

const createStyles = (branding: ResolvedPdfBranding) =>
  StyleSheet.create({
    page: {
      paddingHorizontal: PAGE_PAD_H,
      paddingTop: PAGE_PAD_V,
      paddingBottom: PAGE_PAD_V,
      fontFamily: branding.pdfFont,
      fontSize: 10,
      color: "#18181b",
      backgroundColor: "#ffffff",
      flexDirection: "column",
      position: "relative",
    },
    pageColumn: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: PAGE_BODY_MIN_HEIGHT,
    },
    pageMain: {
      flex: 1,
      flexDirection: "column",
    },
    pageMainGrow: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "space-between",
    },
    headerContainer: {
      paddingTop: HEADER_PAD_TOP,
      paddingBottom: HEADER_PAD_BOTTOM,
    },
    headerBar: {
      height: 6,
      backgroundColor: branding.primaryColor,
      marginBottom: HEADER_BAR_CLEARANCE,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerLogoWrap: {
      flex: 1,
      paddingRight: RHYTHM_SM,
    },
    headerBadgeWrap: {},
    logoImage: {
      height: 36,
      width: 140,
      objectFit: "contain" as const,
    },
    badge: {
      color: "#fff",
      fontSize: 9,
      fontWeight: 700,
      paddingVertical: 4,
      paddingHorizontal: 10,
      backgroundColor: branding.primaryColor,
      borderRadius: 2,
    },
    hero: {
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
    },
    heroImageWrap: {
      width: "100%",
      height: 240,
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: "#f4f4f5",
    },
    heroRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: COVER_SECTION_GAP,
      marginBottom: COVER_SECTION_GAP,
      alignItems: "stretch",
    },
    heroImageCol: {
      width: "50%",
      height: 240,
      flexDirection: "column",
    },
    heroContentCol: {
      width: "45%",
      justifyContent: "flex-start",
    },
    heroPlaceholder: {
      width: "100%",
      height: 240,
      borderRadius: 8,
      backgroundColor: "#f4f4f5",
      alignItems: "center",
      justifyContent: "center",
    },
    coverBullets: {
      marginTop: COVER_SECTION_GAP,
    },
    summaryBlock: {
      marginTop: RHYTHM_SM,
    },
    metricsWrap: {
      marginTop: COVER_SECTION_GAP,
      marginBottom: COVER_SECTION_GAP,
    },
    metricsRow: {
      flexDirection: "row",
      width: "100%",
      backgroundColor: "#f8fafc",
      borderWidth: 1,
      borderColor: "#e2e8f0",
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    metricCell: {
      flex: 1,
      minHeight: METRIC_BOX_HEIGHT,
      borderRightWidth: 1,
      borderRightColor: "#e2e8f0",
      paddingVertical: 10,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    metricCellLast: {
      borderRightWidth: 0,
    },
    metricCellHighlight: {
      backgroundColor: "#ffffff",
      borderRadius: 6,
    },
    metricLabel: {
      fontSize: 6.5,
      color: "#71717a",
      marginBottom: 4,
      textAlign: "center",
    },
    metricValue: {
      fontSize: 11,
      fontWeight: 700,
      textAlign: "center",
      lineHeight: 1.2,
    },
    metricValueSmall: {
      fontSize: 9,
      fontWeight: 700,
      textAlign: "center",
      lineHeight: 1.25,
    },
    title: {
      fontSize: 20,
      fontWeight: 700,
      lineHeight: 1.25,
      marginBottom: RHYTHM_SM,
    },
    subtitle: {
      fontSize: 10,
      lineHeight: 1.45,
      color: "#52525b",
      marginBottom: RHYTHM_MD,
    },
    h2: {
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: RHYTHM_SM,
      marginTop: RHYTHM_SM,
      color: branding.accentColor,
    },
    body: { fontSize: 10, lineHeight: 1.55, textAlign: "justify" },
    grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: RHYTHM_LG },
    storySection: {
      marginTop: RHYTHM_SM,
    },
    galleryCell: {
      width: "48%",
      height: 220,
      borderRadius: 4,
      overflow: "hidden",
      backgroundColor: "#f4f4f5",
      marginRight: 10,
      marginBottom: 10,
    },
    galleryImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
    },
    box: {
      borderWidth: 1,
      borderColor: branding.accentColor,
      borderRadius: 6,
      padding: 10,
      marginBottom: 10,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#f4f4f5",
      paddingVertical: 4,
    },
    detailsTableRow: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#eef2f7",
      paddingVertical: 4,
    },
    tableLabel: { width: "45%", fontSize: 9, color: "#52525b" },
    tableValue: { width: "55%", fontSize: 9, fontWeight: 700 },
    detailsTableLabel: { width: "42%", fontSize: 8, color: "#64748b", lineHeight: 1.3 },
    detailsTableValue: { width: "58%", fontSize: 8, fontWeight: 700, lineHeight: 1.3 },
    detailsBox: {
      borderWidth: 1,
      borderColor: "#E2E8F0",
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: "#fafafa",
    },
    bullet: {
      fontSize: 9,
      lineHeight: 1.45,
      marginBottom: 5,
      paddingLeft: 2,
    },
    pageFooter: {
      marginTop: "auto",
      borderTopWidth: 1,
      borderTopColor: "#e4e4e7",
      paddingTop: 10,
    },
    watermarkBand: {
      backgroundColor: "#eef2ff",
      borderWidth: 1,
      borderColor: "#4f46e5",
      borderRadius: 4,
      paddingVertical: 7,
      paddingHorizontal: 10,
      marginBottom: 6,
    },
    watermarkText: {
      fontSize: 9,
      color: "#312e81",
      textAlign: "center",
      fontWeight: 700,
    },
    footerLabel: {
      fontSize: 7,
      color: "#a1a1aa",
      textAlign: "center",
    },
    stagingDisclaimer: {
      marginTop: RHYTHM_SM,
      borderWidth: 1,
      borderColor: "#fde68a",
      backgroundColor: "#fffbeb",
      borderRadius: 4,
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    stagingDisclaimerText: {
      fontSize: 7,
      lineHeight: 1.35,
      color: "#92400e",
    },
    page4Main: {
      flexDirection: "column",
    },
    page4TopSection: {
      marginBottom: RHYTHM_LG,
    },
    page4BottomSection: {
      marginBottom: RHYTHM_MD,
    },
    floorPlanWrap: {
      width: "100%",
      height: FLOOR_PLAN_HEIGHT_PT,
      maxHeight: FLOOR_PLAN_HEIGHT_PT,
      alignItems: "center",
      justifyContent: "center",
      marginTop: RHYTHM_SM,
      marginBottom: RHYTHM_SM,
      paddingHorizontal: RHYTHM_SM,
      paddingVertical: RHYTHM_SM,
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: "#fafafa",
      borderWidth: 1,
      borderColor: "#e2e8f0",
    },
    floorPlan: {
      width: "100%",
      height: FLOOR_PLAN_HEIGHT_PT,
      maxHeight: FLOOR_PLAN_HEIGHT_PT,
      objectFit: "contain" as const,
    },
    mapWrap: {
      width: "100%",
      height: MAP_HEIGHT_PT,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: RHYTHM_MD,
      borderWidth: 1,
      borderColor: "#d4d4d8",
      backgroundColor: "#f4f4f5",
    },
    mapImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
    },
    mapFallback: {
      width: "100%",
      height: MAP_HEIGHT_PT,
      borderRadius: 8,
      marginBottom: RHYTHM_MD,
      borderWidth: 1,
      borderColor: "#cbd5e1",
      backgroundColor: "#e0f2fe",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    mapFallbackAddress: {
      fontSize: 9,
      color: "#1e3a8a",
      textAlign: "center",
      lineHeight: 1.4,
    },
    floorPlanPlaceholder: {
      width: "100%",
      height: FLOOR_PLAN_HEIGHT_PT,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#e2e8f0",
      backgroundColor: "#fafafa",
      paddingHorizontal: RHYTHM_LG,
    },
    floorPlanPlaceholderText: {
      fontSize: 9,
      color: "#64748b",
      textAlign: "center",
    },
    sectionBlock: {
      marginBottom: RHYTHM_MD,
    },
    contactBox: {
      borderWidth: 1,
      borderColor: "#E2E8F0",
      borderRadius: 8,
      padding: RHYTHM_SM,
      backgroundColor: "#ffffff",
    },
    contactLogo: {
      maxHeight: 28,
      maxWidth: 100,
      objectFit: "contain" as const,
      marginBottom: RHYTHM_SM,
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    avatarImage: {
      width: 44,
      height: 44,
      borderRadius: 22,
      objectFit: "cover" as const,
    },
    contactDetails: {
      flex: 1,
      paddingLeft: RHYTHM_SM,
    },
    contactName: {
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1.3,
      marginBottom: 3,
    },
    contactLine: {
      fontSize: 9,
      lineHeight: 1.4,
      color: "#334155",
      marginBottom: 3,
    },
    page4BottomRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    page4Column: {
      width: "48%",
    },
    page4ColumnRight: {
      width: "48%",
      paddingLeft: RHYTHM_MD,
    },
    legalSection: {
      marginTop: RHYTHM_SM,
      paddingTop: RHYTHM_SM,
      borderTopWidth: 1,
      borderTopColor: "#e2e8f0",
    },
    legalNoticeText: {
      fontSize: 7,
      lineHeight: 1.4,
      color: "#64748b",
    },
  });

function fmt(amount: string, currency: CurrencyCode, fallback: string) {
  return formatPriceAmount(amount, currency, fallback);
}

type RentFinancials = {
  netColdRent: string;
  utilityCharges: string;
  totalRent: string;
  securityDeposit: string;
};

const FINANCIAL_SPEC_LABEL =
  /kaltmiete|nettokaltmiete|net cold rent|nebenkosten|utility charges?|gesamtmiete|warmmiete|total rent|kaution|deposit|security deposit/i;

function resolveRentFinancials(props: BrochurePdfProps): RentFinancials {
  return {
    netColdRent: props.netColdRent?.trim() ?? "",
    utilityCharges: props.utilityCharges?.trim() ?? "",
    totalRent: props.totalRent?.trim() || (props.transactionType === "rent" ? props.priceAmount.trim() : ""),
    securityDeposit: props.securityDeposit?.trim() ?? "",
  };
}

function formatGermanEuro(amount: string, currency: CurrencyCode): string {
  if (!amount.trim()) return "-";
  const formatted = fmt(amount, currency, "-");
  return formatted === "-" ? "-" : formatted;
}

function formatCoverAreaRooms(size: string, rooms: string): string {
  const sizePart = size.trim() ? `${size.trim()} m²` : "";
  const roomsPart = rooms.trim() ? `${rooms.trim()} Zimmer` : "";
  if (sizePart && roomsPart) return `${sizePart} | ${roomsPart}`;
  if (sizePart) return sizePart;
  if (roomsPart) return roomsPart;
  return "-";
}

function buildGermanRentFinancialRows(
  financials: RentFinancials,
  currency: CurrencyCode,
): { label: string; value: string }[] {
  return [
    { label: "Net Cold Rent (Kaltmiete)", value: formatGermanEuro(financials.netColdRent, currency) },
    { label: "Utility Charges (Nebenkosten)", value: formatGermanEuro(financials.utilityCharges, currency) },
    { label: "Total Rent (Gesamtmiete)", value: formatGermanEuro(financials.totalRent, currency) },
    { label: "Deposit (Kaution)", value: formatGermanEuro(financials.securityDeposit, currency) },
  ];
}

function filterNonFinancialListingRows(rows: { label: string; value: string }[]) {
  return filterPdfListingDetailRows(rows).filter(
    (row) => !FINANCIAL_SPEC_LABEL.test(row.label.trim()),
  );
}

function buildCommissionPdfRow(
  label: string | undefined,
  value: string | undefined,
): { label: string; value: string } | null {
  const trimmed = value?.trim() ?? "";
  if (isPdfTableValueEmpty(trimmed)) return null;
  return { label: label?.trim() || "Provision", value: trimmed };
}

function pdfWordNoHyphens(word: string): string[] {
  return [word];
}

function PdfPageChrome({
  styles: s,
  branding,
  badge,
}: {
  styles: ReturnType<typeof createStyles>;
  branding: ResolvedPdfBranding;
  badge: string;
}) {
  return (
    <View wrap={false} style={s.headerContainer}>
      <View style={s.headerBar} />
      <View style={s.headerRow}>
        <View style={s.headerLogoWrap}>
          {branding.logoDataUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image style={s.logoImage} src={branding.logoDataUrl} />
          ) : (
            <Text style={{ fontSize: 9, color: "#71717a" }}>Immo Brochure AI</Text>
          )}
        </View>
        <View style={s.headerBadgeWrap}>
          <Text style={s.badge} wrap={false}>
            {badge}
          </Text>
        </View>
      </View>
    </View>
  );
}

function PdfPageLayout({
  styles: s,
  branding,
  badge,
  pageLabel,
  showWatermark,
  watermarkPage,
  textWatermarks,
  children,
}: {
  styles: ReturnType<typeof createStyles>;
  branding: ResolvedPdfBranding;
  badge: string;
  pageLabel: string;
  showWatermark?: boolean;
  watermarkPage: 1 | 2 | 3 | 4;
  textWatermarks?: { top: number }[];
  children: ReactNode;
}) {
  return (
    <Page size="A4" style={s.page} wrap={false}>
      {showWatermark ? <PageBackdropWatermarks page={watermarkPage} /> : null}
      {showWatermark && textWatermarks ? (
        <View wrap={false}>
          {textWatermarks.map((mark, i) => (
            <TextAreaWatermark key={i} top={mark.top} />
          ))}
        </View>
      ) : null}
      <View style={s.pageColumn} wrap={false}>
        <PdfPageChrome styles={s} branding={branding} badge={badge} />
        <View style={s.pageMain} wrap={false}>
          {children}
        </View>
        <PdfPageFooter
          styles={s}
          pageLabel={pageLabel}
          showWatermark={showWatermark}
        />
      </View>
    </Page>
  );
}

function PdfMetricCell({
  styles: s,
  label,
  value,
  accentColor,
  highlight,
  compact,
  isLast,
}: {
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: string;
  accentColor: string;
  highlight?: boolean;
  compact?: boolean;
  isLast?: boolean;
}) {
  return (
    <View
      style={[
        s.metricCell,
        isLast ? s.metricCellLast : {},
        highlight ? s.metricCellHighlight : {},
      ]}
    >
      <Text style={s.metricLabel} wrap={false}>
        {label}
      </Text>
      <Text
        style={[
          compact ? s.metricValueSmall : s.metricValue,
          highlight ? { color: accentColor } : {},
        ]}
        wrap={false}
      >
        {value}
      </Text>
    </View>
  );
}

function PdfGermanRentMetricsRow({
  styles: s,
  financials,
  size,
  rooms,
  currency,
  accentColor,
}: {
  styles: ReturnType<typeof createStyles>;
  financials: RentFinancials;
  size: string;
  rooms: string;
  currency: CurrencyCode;
  accentColor: string;
}) {
  return (
    <View style={s.metricsRow} wrap={false}>
      <PdfMetricCell
        styles={s}
        label="Kaltmiete"
        value={formatGermanEuro(financials.netColdRent, currency)}
        accentColor={accentColor}
      />
      <PdfMetricCell
        styles={s}
        label="Nebenkosten"
        value={formatGermanEuro(financials.utilityCharges, currency)}
        accentColor={accentColor}
      />
      <PdfMetricCell
        styles={s}
        label="Gesamtmiete"
        value={formatGermanEuro(financials.totalRent, currency)}
        accentColor={accentColor}
        highlight
      />
      <PdfMetricCell
        styles={s}
        label="Wohnfläche / Zimmer"
        value={formatCoverAreaRooms(size, rooms)}
        accentColor={accentColor}
        compact
        isLast
      />
    </View>
  );
}

function PdfSaleMetricsRow({
  styles: s,
  priceAmount,
  currency,
  priceOnRequestLabel,
  size,
  rooms,
  accentColor,
}: {
  styles: ReturnType<typeof createStyles>;
  priceAmount: string;
  currency: CurrencyCode;
  priceOnRequestLabel: string;
  size: string;
  rooms: string;
  accentColor: string;
}) {
  const priceDisplay = priceAmount.trim()
    ? formatGermanEuro(priceAmount, currency)
    : priceOnRequestLabel;

  return (
    <View style={s.metricsRow} wrap={false}>
      <PdfMetricCell
        styles={s}
        label="Kaufpreis"
        value={priceDisplay}
        accentColor={accentColor}
        highlight
      />
      <PdfMetricCell
        styles={s}
        label="Wohnfläche / Zimmer"
        value={formatCoverAreaRooms(size, rooms)}
        accentColor={accentColor}
        compact
        isLast
      />
    </View>
  );
}

function PdfTable({
  styles: s,
  rows,
  variant = "default",
}: {
  styles: ReturnType<typeof createStyles>;
  rows: { label: string; value: string }[];
  variant?: "default" | "details";
}) {
  const visibleRows = filterPdfTableRows(rows);
  if (visibleRows.length === 0) return null;

  const isDetails = variant === "details";

  return (
    <View style={isDetails ? s.detailsBox : s.box} wrap={false}>
      {visibleRows.map((row, i) => (
        <View
          key={`${row.label}-${i}`}
          style={isDetails ? s.detailsTableRow : s.tableRow}
          wrap={false}
        >
          <Text style={isDetails ? s.detailsTableLabel : s.tableLabel}>{row.label}</Text>
          <Text style={isDetails ? s.detailsTableValue : s.tableValue} wrap={false}>
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function PdfHeroImage({
  styles: s,
  src,
  showWatermark,
}: {
  styles: ReturnType<typeof createStyles>;
  src: string | undefined;
  showWatermark: boolean;
}) {
  const safeSrc = sanitizePdfImageSrc(src);
  if (!safeSrc) {
    return (
      <View style={[s.heroImageCol, s.heroPlaceholder]}>
        <Text style={{ color: "#a1a1aa", fontSize: 9 }}>Cover photo</Text>
      </View>
    );
  }

  if (showWatermark) {
    return (
      <View style={s.heroImageCol}>
        <WatermarkedImage
          src={safeSrc}
          frameStyle={s.heroImageWrap}
          imageStyle={s.hero}
          showWatermark={showWatermark}
          diagonalSize={28}
        />
      </View>
    );
  }

  return (
    <View style={s.heroImageCol}>
      <View style={s.heroImageWrap}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={safeSrc} style={s.hero} />
      </View>
    </View>
  );
}

function PdfContactCard({
  styles: s,
  agent,
  logoDataUrl,
  avatarDataUrl,
  website,
}: {
  styles: ReturnType<typeof createStyles>;
  agent: BrochurePdfProps["agent"];
  logoDataUrl?: string;
  avatarDataUrl?: string;
  website?: string;
}) {
  const name = agent.name.trim();
  const agency = agent.agency.trim();
  const phone = agent.phone.trim();
  const email = agent.email.trim();
  const hasContact = name || agency || phone || email || website?.trim() || logoDataUrl;

  if (!hasContact) return null;

  return (
    <View style={s.contactBox} wrap={false}>
      {logoDataUrl ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image style={s.contactLogo} src={logoDataUrl} />
      ) : null}
      <View style={s.contactRow}>
        {avatarDataUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image style={s.avatarImage} src={avatarDataUrl} />
        ) : null}
        <View style={[s.contactDetails, !avatarDataUrl ? { paddingLeft: 0 } : {}]}>
          {name ? (
            <Text style={s.contactName} wrap={false}>
              {name}
            </Text>
          ) : null}
          {agency ? (
            <Text style={s.contactLine} wrap={false}>
              {agency}
            </Text>
          ) : null}
          {email ? (
            <Text style={s.contactLine} wrap={false}>
              {email}
            </Text>
          ) : null}
          {phone ? (
            <Text style={s.contactLine} wrap={false}>
              {phone}
            </Text>
          ) : null}
          {website?.trim() ? (
            <Text style={s.contactLine} wrap={false}>
              {website.trim()}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function PdfFloorPlanImage({
  styles: s,
  src,
}: {
  styles: ReturnType<typeof createStyles>;
  src: string | undefined;
}) {
  const safeSrc = sanitizePdfImageSrc(src);
  if (!safeSrc) {
    return (
      <View style={s.floorPlanPlaceholder} wrap={false}>
        <Text style={s.floorPlanPlaceholderText}>Floor plan available upon request</Text>
      </View>
    );
  }

  return (
    <View style={s.floorPlanWrap} wrap={false}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={safeSrc} style={s.floorPlan} />
    </View>
  );
}

function PdfLocationMap({
  styles: s,
  mapDataUrl,
  address,
}: {
  styles: ReturnType<typeof createStyles>;
  mapDataUrl?: string;
  address: string;
}) {
  const safeMap = sanitizePdfImageSrc(mapDataUrl);
  const displayAddress = formatPdfDisplayAddress(address);

  if (safeMap) {
    return (
      <View style={s.mapWrap} wrap={false}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={safeMap} style={s.mapImage} />
      </View>
    );
  }

  return (
    <View style={s.mapFallback} wrap={false}>
      {displayAddress ? (
        <Text style={s.mapFallbackAddress}>{displayAddress}</Text>
      ) : (
        <Text style={s.mapFallbackAddress}>Location preview unavailable</Text>
      )}
    </View>
  );
}

function PdfPageFooter({
  styles: s,
  pageLabel,
  showWatermark,
}: {
  styles: ReturnType<typeof createStyles>;
  pageLabel: string;
  showWatermark?: boolean;
}) {
  return (
    <View style={s.pageFooter} wrap={false}>
      {showWatermark ? (
        <View style={s.watermarkBand}>
          <Text style={s.watermarkText}>{PDF_WATERMARK_TEXT}</Text>
        </View>
      ) : null}
      <Text style={s.footerLabel}>{pageLabel}</Text>
    </View>
  );
}

export function ExposePdfDocument(props: BrochurePdfProps) {
  const branding = resolveBranding(props);
  const s = getStyles(branding);
  const hero = sanitizePdfImageSrc(props.photoDataUrls[0]);
  const gallery = props.photoDataUrls
    .slice(1, 5)
    .map((src) => sanitizePdfImageSrc(src))
    .filter((src): src is string => Boolean(src));
  const showWatermark = props.showWatermark === true;
  const rentFinancials = resolveRentFinancials(props);
  const displayAddress = formatPdfDisplayAddress(props.address);
  const storyParagraphs = splitPdfParagraphs(props.fullDescription);
  const locationParagraphs = splitPdfParagraphs(props.locationDescription);
  const floorPlanSrc = sanitizePdfImageSrc(props.floorPlanDataUrl);
  const page4FinancialRows =
    props.transactionType === "rent"
      ? buildGermanRentFinancialRows(rentFinancials, props.currency)
      : [];
  const page4OtherSpecs = filterNonFinancialListingRows(props.specsTable).slice(
    0,
    props.transactionType === "rent" ? PAGE4_SPECS_MAX_ROWS - 4 : PAGE4_SPECS_MAX_ROWS,
  );
  const page4CommissionRow = buildCommissionPdfRow(props.commissionLabel, props.commission);
  const page4ListingRows = [
    ...page4FinancialRows,
    ...(page4CommissionRow ? [page4CommissionRow] : []),
    ...page4OtherSpecs,
  ];
  const coverBullets = props.summary.filter(
    (line) => line.trim() && !isLikelyRawPdfMetadata(line),
  );

  return (
    <Document title={`Exposé – ${props.title}`}>
      <PdfPageLayout
        styles={s}
        branding={branding}
        badge={props.transactionBadge}
        pageLabel="ImmoCaption AI · Page 1 — Cover"
        showWatermark={showWatermark}
        watermarkPage={1}
        textWatermarks={[{ top: 520 }, { top: 660 }]}
      >
        <View wrap={false} style={s.pageMainGrow}>
          <View wrap={false} style={s.heroRow}>
            <View style={s.heroContentCol}>
              <Text style={s.title} hyphenationCallback={pdfWordNoHyphens}>
                {props.title}
              </Text>
              {displayAddress ? <Text style={s.subtitle}>{displayAddress}</Text> : null}
            </View>
            {hero ? (
              <PdfHeroImage styles={s} src={hero} showWatermark={showWatermark} />
            ) : (
              <View style={[s.heroImageCol, s.heroPlaceholder]}>
                <Text style={{ color: "#a1a1aa", fontSize: 9 }}>Cover photo</Text>
              </View>
            )}
          </View>
          <View wrap={false} style={s.metricsWrap}>
            {props.transactionType === "rent" ? (
              <PdfGermanRentMetricsRow
                styles={s}
                financials={rentFinancials}
                size={props.size}
                rooms={props.rooms}
                currency={props.currency}
                accentColor={branding.accentColor}
              />
            ) : (
              <PdfSaleMetricsRow
                styles={s}
                priceAmount={props.priceAmount}
                currency={props.currency}
                priceOnRequestLabel={props.priceOnRequestLabel}
                size={props.size}
                rooms={props.rooms}
                accentColor={branding.accentColor}
              />
            )}
          </View>
          {coverBullets.length > 0 ? (
            <View style={s.coverBullets} wrap={false}>
              {coverBullets.map((line, i) => (
                <Text key={i} style={s.bullet}>
                  • {line}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      </PdfPageLayout>

      <PdfPageLayout
        styles={s}
        branding={branding}
        badge={props.transactionBadge}
        pageLabel="ImmoCaption AI · Page 2 — Details"
        showWatermark={showWatermark}
        watermarkPage={2}
        textWatermarks={[{ top: 420 }, { top: 620 }]}
      >
        <View wrap={false}>
          <Text style={s.h2}>Property story</Text>
          <View style={s.grid} wrap={false}>
            {gallery.length > 0 ? (
              gallery.map((src, i) => (
                <WatermarkedImage
                  key={i}
                  src={src}
                  frameStyle={s.galleryCell}
                  imageStyle={s.galleryImg}
                  showWatermark={showWatermark}
                  diagonalSize={12}
                />
              ))
            ) : (
              <Text style={{ color: "#a1a1aa" }}>Additional photos</Text>
            )}
          </View>
          <View style={s.storySection} wrap={false}>
            {storyParagraphs.map((paragraph, i) => (
              <Text
                key={i}
                style={[s.body, { marginBottom: i === storyParagraphs.length - 1 ? RHYTHM_MD : RHYTHM_SM }]}
              >
                {paragraph}
              </Text>
            ))}
          </View>

          {props.energyLines.length > 0 ? (
            <View style={s.sectionBlock} wrap={false}>
              <Text style={s.h2}>Energy certificate</Text>
              <PdfTable styles={s} rows={props.energyLines} />
            </View>
          ) : null}
        </View>
      </PdfPageLayout>

      <PdfPageLayout
        styles={s}
        branding={branding}
        badge={props.transactionBadge}
        pageLabel="ImmoCaption AI · Page 3 — Location"
        showWatermark={showWatermark}
        watermarkPage={3}
        textWatermarks={[{ top: 280 }, { top: 560 }]}
      >
        <View wrap={false}>
          <Text style={s.h2}>Location & neighborhood</Text>
          <PdfLocationMap
            styles={s}
            mapDataUrl={props.mapDataUrl}
            address={props.address}
          />
          {locationParagraphs.map((paragraph, i) => (
            <Text key={i} style={[s.body, { marginBottom: RHYTHM_SM }]}>
              {paragraph}
            </Text>
          ))}
          {props.stagingDisclaimer ? (
            <View style={s.stagingDisclaimer}>
              <Text style={s.stagingDisclaimerText}>{props.stagingDisclaimer}</Text>
            </View>
          ) : null}
        </View>
      </PdfPageLayout>

      <PdfPageLayout
        styles={s}
        branding={branding}
        badge={props.transactionBadge}
        pageLabel="ImmoCaption AI · Page 4 — Floor plan & contact"
        showWatermark={showWatermark}
        watermarkPage={4}
        textWatermarks={[{ top: 320 }, { top: 580 }]}
      >
        <View wrap={false} style={s.page4Main}>
          <View wrap={false} style={s.page4TopSection}>
            <Text style={s.h2}>Floor plan</Text>
            <PdfFloorPlanImage styles={s} src={floorPlanSrc} />
          </View>

          <View wrap={false} style={s.page4BottomSection}>
            <View wrap={false} style={s.page4BottomRow}>
              <View style={s.page4Column}>
                <Text style={[s.h2, { marginTop: 0 }]}>Listing details</Text>
                {page4ListingRows.length > 0 ? (
                  <PdfTable styles={s} rows={page4ListingRows} variant="details" />
                ) : null}
              </View>
              <View style={s.page4ColumnRight}>
                <Text style={[s.h2, { marginTop: 0 }]}>Your contact</Text>
                <PdfContactCard
                  styles={s}
                  agent={props.agent}
                  logoDataUrl={branding.logoDataUrl}
                  avatarDataUrl={branding.avatarDataUrl}
                  website={props.website}
                />
              </View>
            </View>
          </View>

          <View wrap={false} style={s.legalSection}>
            <Text style={[s.h2, { marginTop: 0 }]}>Legal notice</Text>
            <Text style={s.legalNoticeText}>
              {props.agent.legalDisclaimer.trim() || props.legalDisclaimerFallback}
            </Text>
          </View>
        </View>
      </PdfPageLayout>
    </Document>
  );
}

export type ExposePdfDocumentProps = BrochurePdfProps;
