import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatPriceAmount, type CurrencyCode } from "@/lib/currency";
import type { BrochurePdfProps } from "@/types/brochure-pdf";

export type { BrochurePdfProps };

const s = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#18181b",
    backgroundColor: "#ffffff",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#18181b",
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
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
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
});

function fmt(amount: string, currency: CurrencyCode, fallback: string) {
  return formatPriceAmount(amount, currency, fallback);
}

export function ExposePdfDocument(props: BrochurePdfProps) {
  const hero = props.photoDataUrls[0];
  const gallery = props.photoDataUrls.slice(1, 5);

  return (
    <Document title={`Exposé – ${props.title}`}>
      <Page size="A4" style={s.page}>
        <Text style={s.badge}>{props.transactionBadge}</Text>
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
          <View style={s.specChip}>
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
        <Text style={s.footer}>ImmoCaption AI · Page 1 — Cover</Text>
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Property story</Text>
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

        <Text style={s.h2}>Energy certificate</Text>
        <View style={s.box}>
          {props.energyLines.map((line, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={s.tableLabel}>{line.label}</Text>
              <Text style={s.tableValue}>{line.value || "—"}</Text>
            </View>
          ))}
        </View>

        <Text style={s.h2}>Specifications</Text>
        <View style={s.box}>
          {props.specsTable.map((row, i) => (
            <View key={i} style={s.tableRow}>
              <Text style={s.tableLabel}>{row.label}</Text>
              <Text style={s.tableValue}>{row.value || "—"}</Text>
            </View>
          ))}
        </View>
        <Text style={s.footer}>ImmoCaption AI · Page 2 — Details</Text>
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Location & neighborhood</Text>
        <Text style={[s.body, { marginBottom: 14 }]}>{props.locationDescription}</Text>

        <Text style={s.h2}>Floor plan</Text>
        {props.floorPlanDataUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image style={s.floorPlan} src={props.floorPlanDataUrl} />
        ) : (
          <View style={[s.floorPlan, { alignItems: "center", justifyContent: "center" }]}>
            <Text style={{ color: "#a1a1aa" }}>No floor plan uploaded</Text>
          </View>
        )}

        <Text style={s.h2}>Your contact</Text>
        <View style={s.box}>
          <Text style={{ fontSize: 12, fontWeight: 700 }}>{props.agent.name || "—"}</Text>
          <Text style={{ marginTop: 4 }}>{props.agent.agency}</Text>
          <Text style={{ marginTop: 4 }}>{props.agent.phone}</Text>
          <Text>{props.agent.email}</Text>
        </View>

        <Text style={s.h2}>Legal notice</Text>
        <Text style={{ fontSize: 8, lineHeight: 1.35, color: "#52525b" }}>
          {props.agent.legalDisclaimer.trim() ||
            props.legalDisclaimerFallback}
        </Text>
        <Text style={s.footer}>ImmoCaption AI · Page 3 — Contact & imprint</Text>
      </Page>
    </Document>
  );
}

// Backward export alias
export type ExposePdfDocumentProps = BrochurePdfProps;
