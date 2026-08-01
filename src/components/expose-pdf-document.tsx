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
import { filterPdfTableRows } from "@/lib/pdf-table-rows";
import type { BrochurePdfProps } from "@/types/brochure-pdf";
import {
  PageBackdropWatermarks,
  TextAreaWatermark,
  WatermarkedImage,
} from "@/components/pdf-watermark-overlays";

export type { BrochurePdfProps };

const s = StyleSheet.create({
  page: {
    padding: 32,
    paddingTop: 48,
    paddingBottom: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#18181b",
    backgroundColor: "#ffffff",
    flexDirection: "column",
    position: "relative",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    height: 36,
    maxWidth: 140,
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
    borderColor: "#e4e4e7",
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
});

function fmt(amount: string, currency: CurrencyCode, fallback: string) {
  return formatPriceAmount(amount, currency, fallback);
}

function PdfPageChrome({
  brandColor,
  logoDataUrl,
  badge,
}: {
  brandColor: string;
  logoDataUrl?: string;
  badge: string;
}) {
  return (
    <>
      <View style={[s.accentBar, { backgroundColor: brandColor }]} />
      <View style={s.headerRow}>
        {logoDataUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image style={s.logo} src={logoDataUrl} />
        ) : (
          <Text style={{ fontSize: 9, color: "#71717a" }}>Immo Brochure AI</Text>
        )}
        <Text style={[s.badge, { backgroundColor: brandColor, marginBottom: 0 }]}>{badge}</Text>
      </View>
    </>
  );
}

function PdfMetricCell({
  label,
  value,
  brandColor,
  highlight,
}: {
  label: string;
  value: string;
  brandColor: string;
  highlight?: boolean;
}) {
  return (
    <View
      style={
        highlight
          ? [s.metricCell, { borderColor: brandColor }]
          : s.metricCell
      }
    >
      <Text style={s.metricLabel} wrap={false}>
        {label}
      </Text>
      <Text style={s.metricValue} wrap={false}>
        {value}
      </Text>
    </View>
  );
}

function PdfMetricsRow({
  priceLabel,
  priceDisplay,
  sizeDisplay,
  roomsDisplay,
  brandColor,
}: {
  priceLabel: string;
  priceDisplay: string;
  sizeDisplay: string | null;
  roomsDisplay: string | null;
  brandColor: string;
}) {
  return (
    <View style={s.metricsRow}>
      <PdfMetricCell
        label={priceLabel}
        value={priceDisplay}
        brandColor={brandColor}
        highlight
      />
      <PdfMetricCell
        label="Size"
        value={sizeDisplay ?? "—"}
        brandColor={brandColor}
      />
      <PdfMetricCell
        label="Rooms"
        value={roomsDisplay ?? "—"}
        brandColor={brandColor}
      />
    </View>
  );
}

function PdfTable({ rows }: { rows: { label: string; value: string }[] }) {
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
  src,
  showWatermark,
}: {
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
  agent,
  brandColor,
  website,
}: {
  agent: BrochurePdfProps["agent"];
  brandColor: string;
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
      <Text style={[s.h2, { color: brandColor }]}>Your contact</Text>
      <View style={[s.box, { borderColor: brandColor }]}>
        {name ? <Text style={{ fontSize: 12, fontWeight: 700 }}>{name}</Text> : null}
        {agency ? <Text style={{ marginTop: name ? 4 : 0 }}>{agency}</Text> : null}
        {phone ? <Text style={{ marginTop: name || agency ? 4 : 0 }}>{phone}</Text> : null}
        {email ? <Text style={{ marginTop: name || agency || phone ? 4 : 0 }}>{email}</Text> : null}
        {website?.trim() ? (
          <Text style={{ marginTop: 4 }}>{website.trim()}</Text>
        ) : null}
      </View>
    </>
  );
}

function PdfPageFooter({ pageLabel, showWatermark }: { pageLabel: string; showWatermark?: boolean }) {
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
  const hero = props.photoDataUrls[0];
  const gallery = props.photoDataUrls.slice(1, 5);
  const brandColor = props.brandColor ?? "#18181b";
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
        <PdfPageChrome
          brandColor={brandColor}
          logoDataUrl={props.logoDataUrl}
          badge={props.transactionBadge}
        />
        <View style={s.heroRow}>
          {hero ? (
            <PdfHeroImage src={hero} showWatermark={showWatermark} />
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
          priceLabel={props.priceLabel}
          priceDisplay={priceDisplay}
          sizeDisplay={sizeDisplay}
          roomsDisplay={roomsDisplay}
          brandColor={brandColor}
        />
        {props.summary.map((line, i) => (
          <Text key={i} style={s.bullet}>
            • {line}
          </Text>
        ))}
        <View style={s.flexSpacer} />
        <PdfPageFooter pageLabel="ImmoCaption AI · Page 1 — Cover" showWatermark={showWatermark} />
      </Page>

      <Page size="A4" style={s.page}>
        {showWatermark ? <PageBackdropWatermarks page={2} /> : null}
        {showWatermark ? <TextAreaWatermark top={420} /> : null}
        {showWatermark ? <TextAreaWatermark top={620} /> : null}
        <PdfPageChrome
          brandColor={brandColor}
          logoDataUrl={props.logoDataUrl}
          badge={props.transactionBadge}
        />
        <Text style={[s.h2, { color: brandColor }]}>Property story</Text>
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
            <Text style={[s.h2, { color: brandColor }]}>Energy certificate</Text>
            <PdfTable rows={props.energyLines} />
          </>
        ) : null}

        {props.specsTable.length > 0 ? (
          <>
            <Text style={[s.h2, { color: brandColor }]}>Specifications</Text>
            <PdfTable rows={props.specsTable} />
          </>
        ) : null}
        <View style={s.flexSpacer} />
        <PdfPageFooter pageLabel="ImmoCaption AI · Page 2 — Details" showWatermark={showWatermark} />
      </Page>

      <Page size="A4" style={s.page}>
        {showWatermark ? <PageBackdropWatermarks page={3} /> : null}
        {showWatermark ? <TextAreaWatermark top={210} /> : null}
        {showWatermark ? <TextAreaWatermark top={520} /> : null}
        <PdfPageChrome
          brandColor={brandColor}
          logoDataUrl={props.logoDataUrl}
          badge={props.transactionBadge}
        />
        <Text style={[s.h2, { color: brandColor }]}>Location & neighborhood</Text>
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
            <Text style={[s.h2, { color: brandColor }]}>Floor plan</Text>
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
          agent={props.agent}
          brandColor={brandColor}
          website={props.website}
        />

        <Text style={[s.h2, { color: brandColor }]}>Legal notice</Text>
        <Text style={{ fontSize: 8, lineHeight: 1.35, color: "#52525b" }}>
          {props.agent.legalDisclaimer.trim() || props.legalDisclaimerFallback}
        </Text>
        <View style={s.flexSpacer} />
        <PdfPageFooter
          pageLabel="ImmoCaption AI · Page 3 — Contact & imprint"
          showWatermark={showWatermark}
        />
      </Page>
    </Document>
  );
}

export type ExposePdfDocumentProps = BrochurePdfProps;
