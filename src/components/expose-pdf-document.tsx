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
import { filterPdfTableRows } from "@/lib/pdf-table-rows";
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
const METRIC_BOX_HEIGHT = 56;
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
      paddingTop: PAGE_PAD_V + 6,
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
    headerBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 6,
      backgroundColor: branding.primaryColor,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: RHYTHM_MD,
      minHeight: 40,
    },
    headerLogoWrap: {
      flex: 1,
      minWidth: 0,
      paddingRight: RHYTHM_SM,
    },
    headerBadgeWrap: {
      flexShrink: 0,
    },
    logoImage: {
      maxHeight: 40,
      maxWidth: 150,
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
      flex: 1,
      minHeight: 220,
      borderRadius: 6,
      overflow: "hidden",
      backgroundColor: "#f4f4f5",
    },
    heroRow: {
      flexDirection: "row",
      marginBottom: RHYTHM_LG,
      alignItems: "stretch",
    },
    heroImageCol: {
      width: "52%",
      minHeight: 220,
      flexDirection: "column",
    },
    heroContentCol: {
      flex: 1,
      justifyContent: "flex-start",
      minWidth: 0,
      paddingLeft: RHYTHM_LG,
    },
    heroPlaceholder: {
      width: "100%",
      flex: 1,
      minHeight: 220,
      borderRadius: 6,
      backgroundColor: "#f4f4f5",
      alignItems: "center",
      justifyContent: "center",
    },
    summaryBlock: {
      marginTop: RHYTHM_SM,
    },
    metricsWrap: {
      marginTop: RHYTHM_LG,
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
      minWidth: 0,
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
      fontSize: 7,
      color: "#71717a",
      marginBottom: 4,
      textAlign: "center",
      letterSpacing: 0.3,
    },
    metricValue: {
      fontSize: 12,
      fontWeight: 700,
      textAlign: "center",
      lineHeight: 1.2,
    },
    title: {
      fontSize: 22,
      fontWeight: 700,
      lineHeight: 1.2,
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
      marginTop: RHYTHM_LG,
    },
    galleryCell: {
      width: "48%",
      height: 120,
      borderRadius: 4,
      overflow: "hidden",
      backgroundColor: "#f4f4f5",
      marginRight: 8,
      marginBottom: 8,
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
      marginBottom: RHYTHM_LG,
      borderWidth: 1,
      borderColor: "#d4d4d8",
      position: "relative",
      backgroundColor: "#f4f4f5",
    },
    mapImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
    },
    mapPinOverlay: {
      position: "absolute",
      top: "50%",
      left: "50%",
      marginLeft: -10,
      marginTop: -20,
      alignItems: "center",
    },
    mapPinDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "#dc2626",
      borderWidth: 3,
      borderColor: "#ffffff",
    },
    mapFallback: {
      width: "100%",
      height: MAP_HEIGHT_PT,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: RHYTHM_LG,
      borderWidth: 1,
      borderColor: "#cbd5e1",
      backgroundColor: "#e0f2fe",
      position: "relative",
    },
    mapFallbackOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    mapFallbackAddress: {
      fontSize: 9,
      color: "#1e3a8a",
      textAlign: "center",
      lineHeight: 1.4,
      marginTop: RHYTHM_SM,
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
      minWidth: 0,
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
      minWidth: 0,
    },
    page4ColumnRight: {
      width: "48%",
      minWidth: 0,
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
    <View wrap={false}>
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
  isLast,
}: {
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: string;
  accentColor: string;
  highlight?: boolean;
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
        style={[s.metricValue, highlight ? { color: accentColor } : {}]}
        wrap={false}
      >
        {value}
      </Text>
    </View>
  );
}

function PdfMetricsRow({
  styles: s,
  priceLabel,
  priceDisplay,
  sizeDisplay,
  roomsDisplay,
  accentColor,
}: {
  styles: ReturnType<typeof createStyles>;
  priceLabel: string;
  priceDisplay: string;
  sizeDisplay: string | null;
  roomsDisplay: string | null;
  accentColor: string;
}) {
  return (
    <View style={s.metricsRow} wrap={false}>
      <PdfMetricCell
        styles={s}
        label={priceLabel}
        value={priceDisplay}
        accentColor={accentColor}
        highlight
      />
      <PdfMetricCell
        styles={s}
        label="Size"
        value={sizeDisplay ?? "—"}
        accentColor={accentColor}
      />
      <PdfMetricCell
        styles={s}
        label="Rooms"
        value={roomsDisplay ?? "—"}
        accentColor={accentColor}
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
  src: string;
}) {
  return (
    <View style={s.floorPlanWrap} wrap={false}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={src} style={s.floorPlan} />
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
        <View style={s.mapPinOverlay}>
          <View style={s.mapPinDot} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.mapFallback} wrap={false}>
      <View style={{ flex: 1, backgroundColor: "#bfdbfe" }} />
      <View style={s.mapFallbackOverlay}>
        <View style={s.mapPinDot} />
        {displayAddress ? (
          <Text style={s.mapFallbackAddress}>{displayAddress}</Text>
        ) : (
          <Text style={s.mapFallbackAddress}>Location preview unavailable</Text>
        )}
      </View>
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
  const priceDisplay = props.priceAmount.trim()
    ? fmt(props.priceAmount, props.currency, props.priceOnRequestLabel)
    : props.priceOnRequestLabel;
  const sizeDisplay = props.size.trim() ? `${props.size} m²` : null;
  const roomsDisplay = props.rooms.trim() || null;
  const displayAddress = formatPdfDisplayAddress(props.address);
  const storyParagraphs = splitPdfParagraphs(props.fullDescription);
  const locationParagraphs = splitPdfParagraphs(props.locationDescription);
  const floorPlanSrc = sanitizePdfImageSrc(props.floorPlanDataUrl);
  const page4Specs = filterPdfTableRows(props.specsTable).slice(0, PAGE4_SPECS_MAX_ROWS);

  return (
    <Document title={`Exposé – ${props.title}`}>
      <PdfPageLayout
        styles={s}
        branding={branding}
        badge={props.transactionBadge}
        pageLabel="ImmoCaption AI · Page 1 — Cover"
        showWatermark={showWatermark}
        watermarkPage={1}
        textWatermarks={[{ top: 400 }, { top: 560 }]}
      >
        <View wrap={false} style={s.pageMainGrow}>
          <View wrap={false} style={s.heroRow}>
            {hero ? (
              <PdfHeroImage styles={s} src={hero} showWatermark={showWatermark} />
            ) : (
              <View style={[s.heroImageCol, s.heroPlaceholder]}>
                <Text style={{ color: "#a1a1aa", fontSize: 9 }}>Cover photo</Text>
              </View>
            )}
            <View style={s.heroContentCol}>
              <Text style={s.title}>{props.title}</Text>
              {displayAddress ? <Text style={s.subtitle}>{displayAddress}</Text> : null}
              {props.summary.length > 0 ? (
                <View style={s.summaryBlock}>
                  {props.summary.map((line, i) => (
                    <Text key={i} style={s.bullet}>
                      • {line}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
          <View wrap={false} style={s.metricsWrap}>
            <PdfMetricsRow
              styles={s}
              priceLabel={props.priceLabel}
              priceDisplay={priceDisplay}
              sizeDisplay={sizeDisplay}
              roomsDisplay={roomsDisplay}
              accentColor={branding.accentColor}
            />
          </View>
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
          {floorPlanSrc ? (
            <View wrap={false} style={s.page4TopSection}>
              <Text style={s.h2}>Floor plan</Text>
              <PdfFloorPlanImage styles={s} src={floorPlanSrc} />
            </View>
          ) : null}

          <View wrap={false} style={s.page4BottomSection}>
            <View wrap={false} style={s.page4BottomRow}>
              <View style={page4Specs.length > 0 ? s.page4Column : { width: "100%" }}>
                <Text style={[s.h2, { marginTop: 0 }]}>Your contact</Text>
                <PdfContactCard
                  styles={s}
                  agent={props.agent}
                  logoDataUrl={branding.logoDataUrl}
                  avatarDataUrl={branding.avatarDataUrl}
                  website={props.website}
                />
              </View>
              {page4Specs.length > 0 ? (
                <View style={s.page4ColumnRight}>
                  <Text style={[s.h2, { marginTop: 0 }]}>Listing details</Text>
                  <PdfTable styles={s} rows={page4Specs} variant="details" />
                </View>
              ) : null}
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
