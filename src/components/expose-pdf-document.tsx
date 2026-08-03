import type { ReactNode } from "react";
import {
  Document,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatPriceAmount, type CurrencyCode } from "@/lib/currency";
import { PDF_WATERMARK_TEXT } from "@/lib/branding/constants";
import { resolvePdfFontFamily } from "@/lib/pdf-fonts";
import { sanitizePdfImageSrc } from "@/lib/pdf-image-data-url";
import { filterPdfTableRows } from "@/lib/pdf-table-rows";
import { splitPdfParagraphs } from "@/lib/pdf-text-format";
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

/** A4 page height in pt minus ~20 mm margins on top and bottom. */
const A4_HEIGHT_PT = 841.89;
const PAGE_MARGIN_PT = 57;
const PAGE_BODY_MIN_HEIGHT = A4_HEIGHT_PT - PAGE_MARGIN_PT * 2;
const MAP_HEIGHT_PT = 220;

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
      padding: PAGE_MARGIN_PT,
      paddingTop: PAGE_MARGIN_PT + 6,
      paddingBottom: PAGE_MARGIN_PT,
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
      marginBottom: 12,
      minHeight: 40,
    },
    headerLogoWrap: {
      flex: 1,
      minWidth: 0,
      paddingRight: 12,
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
      alignSelf: "flex-start",
      color: "#fff",
      fontSize: 9,
      fontWeight: 700,
      paddingVertical: 4,
      paddingHorizontal: 10,
      marginBottom: 0,
      backgroundColor: branding.primaryColor,
    },
    hero: {
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
    },
    heroImageWrap: {
      width: "100%",
      flex: 1,
      minHeight: 240,
      borderRadius: 6,
      overflow: "hidden",
      backgroundColor: "#f4f4f5",
    },
    heroRow: {
      flex: 1,
      flexDirection: "row",
      gap: 16,
      marginBottom: 14,
      alignItems: "stretch",
    },
    heroImageCol: {
      width: "52%",
      minHeight: 240,
      flexDirection: "column",
    },
    heroContentCol: {
      flex: 1,
      justifyContent: "flex-start",
      minWidth: 0,
    },
    heroPlaceholder: {
      width: "100%",
      flex: 1,
      minHeight: 240,
      borderRadius: 6,
      backgroundColor: "#f4f4f5",
      alignItems: "center",
      justifyContent: "center",
    },
    summaryBlock: {
      marginTop: 10,
    },
    metricsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 0,
      width: "100%",
    },
    metricCell: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#e4e4e7",
      borderRadius: 6,
      paddingVertical: 10,
      paddingHorizontal: 8,
      minWidth: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    metricLabel: {
      fontSize: 7,
      textTransform: "uppercase",
      color: "#71717a",
      marginBottom: 4,
      textAlign: "center",
    },
    metricValue: {
      fontSize: 12,
      fontWeight: 700,
      textAlign: "center",
    },
    title: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
    subtitle: { fontSize: 10, color: "#52525b", marginBottom: 0 },
    h2: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
      marginTop: 6,
      color: branding.accentColor,
    },
    body: { fontSize: 10, lineHeight: 1.5, textAlign: "justify" },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    storySection: {
      marginTop: 16,
    },
    galleryCell: {
      width: "48%",
      height: 120,
      borderRadius: 4,
      overflow: "hidden",
      backgroundColor: "#f4f4f5",
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
    specsBox: {
      borderWidth: 1,
      borderColor: branding.accentColor,
      borderRadius: 6,
      padding: 14,
      marginBottom: 10,
      flex: 1,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#f4f4f5",
      paddingVertical: 4,
    },
    specsTableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e4e4e7",
      paddingVertical: 7,
    },
    tableLabel: { width: "45%", fontSize: 9, color: "#52525b" },
    tableValue: { width: "55%", fontSize: 9, fontWeight: 700 },
    specsTableLabel: { width: "45%", fontSize: 10, color: "#52525b" },
    specsTableValue: { width: "55%", fontSize: 10, fontWeight: 700 },
    detailsTableLabel: { width: "40%", fontSize: 8, color: "#52525b" },
    detailsTableValue: { width: "60%", fontSize: 8, fontWeight: 700 },
    detailsBox: {
      borderWidth: 1,
      borderColor: "#E2E8F0",
      borderRadius: 6,
      padding: 10,
      flex: 1,
    },
    bullet: { fontSize: 9, lineHeight: 1.4, marginBottom: 4 },
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
      marginTop: 8,
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
    floorPlanSection: {
      flexDirection: "column",
      marginBottom: 16,
    },
    floorPlanWrap: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      borderRadius: 6,
      overflow: "hidden",
      backgroundColor: "#fafafa",
      borderWidth: 1,
      borderColor: "#e4e4e7",
    },
    floorPlan: {
      width: "60%",
      height: 200,
      objectFit: "contain" as const,
    },
    mapWrap: {
      width: "100%",
      height: MAP_HEIGHT_PT,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 16,
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
      marginLeft: -12,
      marginTop: -30,
      alignItems: "center",
    },
    mapFallback: {
      width: "100%",
      height: MAP_HEIGHT_PT,
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 16,
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
      marginTop: 8,
    },
    sectionBlock: {
      marginBottom: 12,
    },
    contactBox: {
      borderWidth: 1,
      borderColor: "#E2E8F0",
      borderRadius: 6,
      padding: 12,
      marginBottom: 10,
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      flexWrap: "nowrap",
    },
    avatarImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      objectFit: "cover" as const,
    },
    contactDetails: {
      flex: 1,
      minWidth: 0,
    },
    contactEmail: {
      marginTop: 4,
    },
    page4BottomRow: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
      marginBottom: 12,
    },
    page4Column: {
      width: "48%",
      minWidth: 0,
    },
  });

function fmt(amount: string, currency: CurrencyCode, fallback: string) {
  return formatPriceAmount(amount, currency, fallback);
}

function PdfDropPin() {
  return (
    <Svg width={24} height={32} viewBox="0 0 24 32">
      <Path
        d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0z"
        fill="#dc2626"
      />
      <Path
        d="M12 6a4 4 0 100 8 4 4 0 000-8z"
        fill="#ffffff"
      />
    </Svg>
  );
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
    <View>
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
          <Text style={[s.badge, { marginBottom: 0 }]} wrap={false}>
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
    <Page size="A4" style={s.page}>
      {showWatermark ? <PageBackdropWatermarks page={watermarkPage} /> : null}
      {showWatermark && textWatermarks ? (
        <View>
          {textWatermarks.map((mark, i) => (
            <TextAreaWatermark key={i} top={mark.top} />
          ))}
        </View>
      ) : null}
      <View style={s.pageColumn}>
        <PdfPageChrome styles={s} branding={branding} badge={badge} />
        <View style={s.pageMain}>{children}</View>
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
}: {
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: string;
  accentColor: string;
  highlight?: boolean;
}) {
  return (
    <View
      style={
        highlight
          ? [s.metricCell, { borderColor: accentColor }]
          : s.metricCell
      }
    >
      <Text style={s.metricLabel} wrap={false}>
        {label}
      </Text>
      <Text style={[s.metricValue, highlight ? { color: accentColor } : {}]} wrap={false}>
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
    <View style={s.metricsRow}>
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
  variant?: "default" | "specs" | "details";
}) {
  const visibleRows = filterPdfTableRows(rows);
  if (visibleRows.length === 0) return null;

  const isSpecs = variant === "specs";
  const isDetails = variant === "details";

  return (
    <View style={isDetails ? s.detailsBox : isSpecs ? s.specsBox : s.box}>
      {visibleRows.map((row, i) => (
        <View key={`${row.label}-${i}`} style={isSpecs ? s.specsTableRow : s.tableRow}>
          <Text
            style={
              isDetails ? s.detailsTableLabel : isSpecs ? s.specsTableLabel : s.tableLabel
            }
          >
            {row.label}
          </Text>
          <Text
            style={
              isDetails ? s.detailsTableValue : isSpecs ? s.specsTableValue : s.tableValue
            }
            wrap={isDetails ? false : undefined}
          >
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

function PdfContactBlock({
  styles: s,
  agent,
  avatarDataUrl,
  website,
}: {
  styles: ReturnType<typeof createStyles>;
  agent: BrochurePdfProps["agent"];
  avatarDataUrl?: string;
  website?: string;
}) {
  const name = agent.name.trim();
  const agency = agent.agency.trim();
  const phone = agent.phone.trim();
  const email = agent.email.trim();
  const hasContact = name || agency || phone || email || website?.trim();

  if (!hasContact) return null;

  return (
    <View style={s.sectionBlock}>
      <Text style={s.h2}>Your contact</Text>
      <View style={s.contactBox}>
        <View style={s.contactRow}>
          {avatarDataUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image style={s.avatarImage} src={avatarDataUrl} />
          ) : null}
          <View style={s.contactDetails}>
            {name ? <Text style={{ fontSize: 12, fontWeight: 700 }} wrap={false}>{name}</Text> : null}
            {agency ? <Text style={{ marginTop: name ? 4 : 0 }} wrap={false}>{agency}</Text> : null}
            {phone ? <Text style={{ marginTop: name || agency ? 4 : 0 }} wrap={false}>{phone}</Text> : null}
            {email ? (
              <Text style={s.contactEmail} wrap={false}>
                {email}
              </Text>
            ) : null}
            {website?.trim() ? (
              <Text style={{ marginTop: 4 }} wrap={false}>
                {website.trim()}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
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
  if (safeMap) {
    return (
      <View style={s.mapWrap}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={safeMap} style={s.mapImage} />
        <View style={s.mapPinOverlay}>
          <PdfDropPin />
        </View>
      </View>
    );
  }

  return (
    <View style={s.mapFallback}>
      <View style={{ flex: 1, backgroundColor: "#bfdbfe" }} />
      <View style={s.mapFallbackOverlay}>
        <PdfDropPin />
        {address.trim() ? (
          <Text style={s.mapFallbackAddress}>{address}</Text>
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
  const storyParagraphs = splitPdfParagraphs(props.fullDescription);
  const locationParagraphs = splitPdfParagraphs(props.locationDescription);

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
        <View style={s.pageMainGrow}>
          <View style={s.heroRow}>
            {hero ? (
              <PdfHeroImage styles={s} src={hero} showWatermark={showWatermark} />
            ) : (
              <View style={[s.heroImageCol, s.heroPlaceholder]}>
                <Text style={{ color: "#a1a1aa", fontSize: 9 }}>Cover photo</Text>
              </View>
            )}
            <View style={s.heroContentCol}>
              <Text style={s.title}>{props.title}</Text>
              {props.address.trim() ? (
                <Text style={s.subtitle}>{props.address}</Text>
              ) : null}
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
          <PdfMetricsRow
            styles={s}
            priceLabel={props.priceLabel}
            priceDisplay={priceDisplay}
            sizeDisplay={sizeDisplay}
            roomsDisplay={roomsDisplay}
            accentColor={branding.accentColor}
          />
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
        <Text style={s.h2}>Property story</Text>
        <View style={s.grid}>
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
        <View style={s.storySection}>
          {storyParagraphs.map((paragraph, i) => (
            <Text key={i} style={[s.body, { marginBottom: i === storyParagraphs.length - 1 ? 12 : 8 }]}>
              {paragraph}
            </Text>
          ))}
        </View>

        {props.energyLines.length > 0 ? (
          <View style={s.sectionBlock}>
            <Text style={s.h2}>Energy certificate</Text>
            <PdfTable styles={s} rows={props.energyLines} />
          </View>
        ) : null}
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
        <Text style={s.h2}>Location & neighborhood</Text>
        <PdfLocationMap
          styles={s}
          mapDataUrl={props.mapDataUrl}
          address={props.address}
        />
        {locationParagraphs.map((paragraph, i) => (
          <Text key={i} style={[s.body, s.sectionBlock, { marginBottom: 8 }]}>
            {paragraph}
          </Text>
        ))}
        {props.stagingDisclaimer ? (
          <View style={s.stagingDisclaimer}>
            <Text style={s.stagingDisclaimerText}>{props.stagingDisclaimer}</Text>
          </View>
        ) : null}
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
        {props.floorPlanDataUrl ? (
          <View style={s.floorPlanSection}>
            <Text style={s.h2}>Floor plan</Text>
            <View style={s.floorPlanWrap}>
              <WatermarkedImage
                src={props.floorPlanDataUrl}
                frameStyle={{ width: "60%", height: 200, alignItems: "center", justifyContent: "center" }}
                imageStyle={s.floorPlan}
                showWatermark={showWatermark}
                diagonalSize={18}
              />
            </View>
          </View>
        ) : null}

        <View style={s.page4BottomRow}>
          <View style={props.specsTable.length > 0 ? s.page4Column : { width: "100%" }}>
            <PdfContactBlock
              styles={s}
              agent={props.agent}
              avatarDataUrl={branding.avatarDataUrl}
              website={props.website}
            />
          </View>
          {props.specsTable.length > 0 ? (
            <View style={s.page4Column}>
              <Text style={s.h2}>Listing details</Text>
              <PdfTable styles={s} rows={props.specsTable} variant="details" />
            </View>
          ) : null}
        </View>

        <View style={s.sectionBlock}>
          <Text style={s.h2}>Legal notice</Text>
          <Text style={{ fontSize: 8, lineHeight: 1.4, color: "#52525b" }}>
            {props.agent.legalDisclaimer.trim() || props.legalDisclaimerFallback}
          </Text>
        </View>
      </PdfPageLayout>
    </Document>
  );
}

export type ExposePdfDocumentProps = BrochurePdfProps;
