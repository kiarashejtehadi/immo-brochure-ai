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
import { pdfFontFamily } from "@/lib/branding/font-family";
import { filterPdfTableRows } from "@/lib/pdf-table-rows";
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
    pdfFont: pdfFontFamily(props.fontFamily),
    logoDataUrl: props.logoDataUrl,
    avatarDataUrl: props.avatarDataUrl,
  };
}

const createStyles = (branding: ResolvedPdfBranding) =>
  StyleSheet.create({
    page: {
      padding: 32,
      paddingTop: 48,
      paddingBottom: 40,
      fontFamily: branding.pdfFont,
      fontSize: 10,
      color: "#18181b",
      backgroundColor: "#ffffff",
      flexDirection: "column",
      position: "relative",
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
      marginBottom: 10,
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
      marginBottom: 12,
      backgroundColor: branding.primaryColor,
    },
    accentPill: {
      color: branding.accentColor,
      fontSize: 9,
      fontWeight: 700,
    },
    hero: {
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
    },
    heroImageWrap: {
      width: "100%",
      height: 220,
      borderRadius: 6,
      overflow: "hidden",
      backgroundColor: "#f4f4f5",
    },
    heroRow: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 12,
    },
    heroImageCol: {
      width: "52%",
    },
    heroContentCol: {
      flex: 1,
      justifyContent: "center",
      minWidth: 0,
    },
    heroPlaceholder: {
      width: "100%",
      height: 220,
      borderRadius: 6,
      backgroundColor: "#f4f4f5",
      alignItems: "center",
      justifyContent: "center",
    },
    metricsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 12,
      width: "100%",
    },
    metricCell: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#e4e4e7",
      borderRadius: 6,
      paddingVertical: 8,
      paddingHorizontal: 6,
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
      fontSize: 11,
      fontWeight: 700,
      textAlign: "center",
    },
    title: { fontSize: 20, fontWeight: 700, marginBottom: 6 },
    subtitle: { fontSize: 10, color: "#52525b", marginBottom: 0 },
    h2: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
      marginTop: 4,
      color: branding.accentColor,
    },
    body: { fontSize: 10, lineHeight: 1.45, textAlign: "justify" },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
    galleryCell: {
      width: "48%",
      height: 108,
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
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#f4f4f5",
      paddingVertical: 4,
    },
    tableLabel: { width: "45%", fontSize: 9, color: "#52525b" },
    tableValue: { width: "55%", fontSize: 9, fontWeight: 700 },
    bullet: { fontSize: 9, marginBottom: 3 },
    pageFooter: {
      marginTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#e4e4e7",
      paddingTop: 8,
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
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    stagingDisclaimerText: {
      fontSize: 7,
      lineHeight: 1.35,
      color: "#92400e",
    },
    floorPlan: {
      width: "100%",
      maxHeight: 350,
      objectFit: "contain" as const,
      marginTop: 8,
      marginBottom: 12,
    },
    flexSpacer: {
      flexGrow: 1,
      minHeight: 8,
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
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
    <>
      <View style={s.headerBar} />
      <View style={s.headerRow}>
        {branding.logoDataUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image style={s.logoImage} src={branding.logoDataUrl} />
        ) : (
          <Text style={{ fontSize: 9, color: "#71717a" }}>Immo Brochure AI</Text>
        )}
        <Text style={[s.badge, { marginBottom: 0 }]}>{badge}</Text>
      </View>
    </>
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
}: {
  styles: ReturnType<typeof createStyles>;
  rows: { label: string; value: string }[];
}) {
  const visibleRows = filterPdfTableRows(rows);
  if (visibleRows.length === 0) return null;

  return (
    <View style={s.box}>
      {visibleRows.map((row, i) => (
        <View key={`${row.label}-${i}`} style={s.tableRow}>
          <Text style={s.tableLabel}>{row.label}</Text>
          <Text style={s.tableValue}>{row.value}</Text>
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
  src: string;
  showWatermark: boolean;
}) {
  if (showWatermark) {
    return (
      <View style={s.heroImageCol}>
        <WatermarkedImage
          src={src}
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
        <Image src={src} style={s.hero} />
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
    <>
      <Text style={s.h2}>Your contact</Text>
      <View style={s.box}>
        <View style={s.contactRow}>
          {avatarDataUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image style={s.avatarImage} src={avatarDataUrl} />
          ) : null}
          <View style={s.contactDetails}>
            {name ? <Text style={{ fontSize: 12, fontWeight: 700 }}>{name}</Text> : null}
            {agency ? <Text style={{ marginTop: name ? 4 : 0 }}>{agency}</Text> : null}
            {phone ? <Text style={{ marginTop: name || agency ? 4 : 0 }}>{phone}</Text> : null}
            {email ? (
              <Text style={{ marginTop: name || agency || phone ? 4 : 0 }}>{email}</Text>
            ) : null}
            {website?.trim() ? (
              <Text style={{ marginTop: 4 }}>{website.trim()}</Text>
            ) : null}
          </View>
        </View>
      </View>
    </>
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
  const s = createStyles(branding);
  const hero = props.photoDataUrls[0];
  const gallery = props.photoDataUrls.slice(1, 5);
  const showWatermark = props.showWatermark === true;
  const priceDisplay = props.priceAmount.trim()
    ? fmt(props.priceAmount, props.currency, props.priceOnRequestLabel)
    : props.priceOnRequestLabel;
  const sizeDisplay = props.size.trim() ? `${props.size} m²` : null;
  const roomsDisplay = props.rooms.trim() || null;

  return (
    <Document title={`Exposé – ${props.title}`}>
      <Page size="A4" style={s.page}>
        {showWatermark ? <PageBackdropWatermarks page={1} /> : null}
        {showWatermark ? <TextAreaWatermark top={400} /> : null}
        {showWatermark ? <TextAreaWatermark top={560} /> : null}
        <PdfPageChrome styles={s} branding={branding} badge={props.transactionBadge} />
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
        {props.summary.map((line, i) => (
          <Text key={i} style={s.bullet}>
            • {line}
          </Text>
        ))}
        <View style={s.flexSpacer} />
        <PdfPageFooter
          styles={s}
          pageLabel="ImmoCaption AI · Page 1 — Cover"
          showWatermark={showWatermark}
        />
      </Page>

      <Page size="A4" style={s.page}>
        {showWatermark ? <PageBackdropWatermarks page={2} /> : null}
        {showWatermark ? <TextAreaWatermark top={420} /> : null}
        {showWatermark ? <TextAreaWatermark top={620} /> : null}
        <PdfPageChrome styles={s} branding={branding} badge={props.transactionBadge} />
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
        <Text style={s.body}>{props.fullDescription}</Text>

        {props.energyLines.length > 0 ? (
          <>
            <Text style={s.h2}>Energy certificate</Text>
            <PdfTable styles={s} rows={props.energyLines} />
          </>
        ) : null}

        {props.specsTable.length > 0 ? (
          <>
            <Text style={s.h2}>Specifications</Text>
            <PdfTable styles={s} rows={props.specsTable} />
          </>
        ) : null}
        <View style={s.flexSpacer} />
        <PdfPageFooter
          styles={s}
          pageLabel="ImmoCaption AI · Page 2 — Details"
          showWatermark={showWatermark}
        />
      </Page>

      <Page size="A4" style={s.page}>
        {showWatermark ? <PageBackdropWatermarks page={3} /> : null}
        {showWatermark ? <TextAreaWatermark top={210} /> : null}
        {showWatermark ? <TextAreaWatermark top={520} /> : null}
        <PdfPageChrome styles={s} branding={branding} badge={props.transactionBadge} />
        <Text style={s.h2}>Location & neighborhood</Text>
        <Text style={[s.body, { marginBottom: props.stagingDisclaimer ? 8 : 14 }]}>
          {props.locationDescription}
        </Text>
        {props.stagingDisclaimer ? (
          <View style={[s.stagingDisclaimer, { marginBottom: 14 }]}>
            <Text style={s.stagingDisclaimerText}>{props.stagingDisclaimer}</Text>
          </View>
        ) : null}

        {props.floorPlanDataUrl ? (
          <>
            <Text style={s.h2}>Floor plan</Text>
            <View style={{ width: "100%" }}>
              <WatermarkedImage
                src={props.floorPlanDataUrl}
                frameStyle={{ width: "100%" }}
                imageStyle={s.floorPlan}
                showWatermark={showWatermark}
                diagonalSize={18}
              />
            </View>
          </>
        ) : null}

        <PdfContactBlock
          styles={s}
          agent={props.agent}
          avatarDataUrl={branding.avatarDataUrl}
          website={props.website}
        />

        <Text style={s.h2}>Legal notice</Text>
        <Text style={{ fontSize: 8, lineHeight: 1.35, color: "#52525b" }}>
          {props.agent.legalDisclaimer.trim() || props.legalDisclaimerFallback}
        </Text>
        <View style={s.flexSpacer} />
        <PdfPageFooter
          styles={s}
          pageLabel="ImmoCaption AI · Page 3 — Contact & imprint"
          showWatermark={showWatermark}
        />
      </Page>
    </Document>
  );
}

export type ExposePdfDocumentProps = BrochurePdfProps;
