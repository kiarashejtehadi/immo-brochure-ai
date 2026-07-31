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
import type { BrochurePdfProps } from "@/types/brochure-pdf";

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
    height: 260,
    objectFit: "cover",
    borderRadius: 6,
    marginBottom: 16,
    backgroundColor: "#f4f4f5",
  },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  subtitle: { fontSize: 11, color: "#52525b", marginBottom: 14 },
  row: { flexDirection: "row", gap: 12, marginBottom: 8 },
  specChip: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 6,
    padding: 8,
    flex: 1,
  },
  specLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    color: "#71717a",
    marginBottom: 2,
  },
  specValue: { fontSize: 11, fontWeight: 700 },
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
  gridImg: {
    width: "48%",
    height: 100,
    objectFit: "cover",
    borderRadius: 4,
    backgroundColor: "#f4f4f5",
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
  floorPlan: {
    width: "100%",
    height: 180,
    objectFit: "contain",
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: "#fafafa",
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

  return (
    <Document title={`Exposé – ${props.title}`}>
      <Page size="A4" style={s.page}>
        <PdfPageChrome
          brandColor={brandColor}
          logoDataUrl={props.logoDataUrl}
          badge={props.transactionBadge}
        />
        {hero ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image style={s.hero} src={hero} />
        ) : (
          <View style={[s.hero, { alignItems: "center", justifyContent: "center" }]}>
            <Text style={{ color: "#a1a1aa" }}>ImmoCaption AI</Text>
          </View>
        )}
        <Text style={s.title}>{props.title}</Text>
        <Text style={s.subtitle}>{props.address}</Text>
        <View style={s.row}>
          <View style={[s.specChip, { borderColor: brandColor }]}>
            <Text style={s.specLabel}>{props.priceLabel}</Text>
            <Text style={s.specValue}>
              {props.priceAmount.trim()
                ? fmt(props.priceAmount, props.currency, props.priceOnRequestLabel)
                : props.priceOnRequestLabel}
            </Text>
          </View>
          <View style={s.specChip}>
            <Text style={s.specLabel}>Size</Text>
            <Text style={s.specValue}>
              {props.size.trim() ? `${props.size} m²` : "—"}
            </Text>
          </View>
          <View style={s.specChip}>
            <Text style={s.specLabel}>Rooms</Text>
            <Text style={s.specValue}>{props.rooms.trim() || "—"}</Text>
          </View>
        </View>
        {props.summary.map((line, i) => (
          <Text key={i} style={s.bullet}>
            • {line}
          </Text>
        ))}
        <View style={s.flexSpacer} />
        <PdfPageFooter pageLabel="ImmoCaption AI · Page 1 — Cover" showWatermark={showWatermark} />
      </Page>

      <Page size="A4" style={s.page}>
        <PdfPageChrome
          brandColor={brandColor}
          logoDataUrl={props.logoDataUrl}
          badge={props.transactionBadge}
        />
        <Text style={[s.h2, { color: brandColor }]}>Property story</Text>
        <View style={s.grid}>
          {gallery.length > 0 ? (
            gallery.map((src, i) => (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image key={i} style={s.gridImg} src={src} />
            ))
          ) : (
            <Text style={{ color: "#a1a1aa" }}>Additional photos</Text>
          )}
        </View>
        <Text style={s.body}>{props.fullDescription}</Text>

        <Text style={[s.h2, { color: brandColor }]}>Energy certificate</Text>
        <View style={s.box}>
          {props.energyLines.map((line, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={s.tableLabel}>{line.label}</Text>
              <Text style={s.tableValue}>{line.value || "—"}</Text>
            </View>
          ))}
        </View>

        <Text style={[s.h2, { color: brandColor }]}>Specifications</Text>
        <View style={s.box}>
          {props.specsTable.map((row, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={s.tableLabel}>{row.label}</Text>
              <Text style={s.tableValue}>{row.value || "—"}</Text>
            </View>
          ))}
        </View>
        <View style={s.flexSpacer} />
        <PdfPageFooter pageLabel="ImmoCaption AI · Page 2 — Details" showWatermark={showWatermark} />
      </Page>

      <Page size="A4" style={s.page}>
        <PdfPageChrome
          brandColor={brandColor}
          logoDataUrl={props.logoDataUrl}
          badge={props.transactionBadge}
        />
        <Text style={[s.h2, { color: brandColor }]}>Location & neighborhood</Text>
        <Text style={[s.body, { marginBottom: 14 }]}>{props.locationDescription}</Text>

        <Text style={[s.h2, { color: brandColor }]}>Floor plan</Text>
        {props.floorPlanDataUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image style={s.floorPlan} src={props.floorPlanDataUrl} />
        ) : (
          <View style={[s.floorPlan, { alignItems: "center", justifyContent: "center" }]}>
            <Text style={{ color: "#a1a1aa" }}>No floor plan uploaded</Text>
          </View>
        )}

        <Text style={[s.h2, { color: brandColor }]}>Your contact</Text>
        <View style={[s.box, { borderColor: brandColor }]}>
          <Text style={{ fontSize: 12, fontWeight: 700 }}>{props.agent.name || "—"}</Text>
          <Text style={{ marginTop: 4 }}>{props.agent.agency}</Text>
          <Text style={{ marginTop: 4 }}>{props.agent.phone}</Text>
          <Text>{props.agent.email}</Text>
          {props.website ? <Text style={{ marginTop: 4 }}>{props.website}</Text> : null}
        </View>

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
