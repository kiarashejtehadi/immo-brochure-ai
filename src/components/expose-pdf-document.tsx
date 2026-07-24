import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

export type ExposePdfDocumentProps = {
  address: string;
  price: string;
  size: string;
  rooms: string;
  features: string[];
  tone: string;
  exposeText: string;
  photoDataUrls: string[];
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#171717",
    backgroundColor: "#ffffff",
  },
  brand: {
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#71717a",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 14,
    color: "#09090b",
  },
  photoRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  photo: {
    flex: 1,
    height: 118,
    objectFit: "cover",
    borderRadius: 4,
    backgroundColor: "#f4f4f5",
  },
  photoPlaceholder: {
    flex: 1,
    height: 118,
    borderRadius: 4,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    fontSize: 8,
    color: "#a1a1aa",
  },
  specsBox: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specItem: {
    width: "48%",
  },
  specLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#71717a",
    marginBottom: 2,
  },
  specValue: {
    fontSize: 10,
    fontWeight: 700,
    color: "#18181b",
  },
  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#52525b",
    marginBottom: 8,
    fontWeight: 700,
  },
  expose: {
    fontSize: 10,
    lineHeight: 1.45,
    color: "#27272a",
    textAlign: "justify",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 7,
    color: "#a1a1aa",
    textAlign: "center",
  },
});

function formatPrice(price: string) {
  const n = Number(price);
  if (!price.trim() || Number.isNaN(n)) return "Auf Anfrage";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ExposePdfDocument({
  address,
  price,
  size,
  rooms,
  features,
  tone,
  exposeText,
  photoDataUrls,
}: ExposePdfDocumentProps) {
  const displayAddress = address.trim() || "Immobilie";
  const photos = photoDataUrls.slice(0, 3);

  return (
    <Document title={`Exposé – ${displayAddress}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>ImmoCaption AI · Exposé</Text>
        <Text style={styles.title}>{displayAddress}</Text>

        <View style={styles.photoRow}>
          {photos.length > 0 ? (
            photos.map((src, index) => (
              // @react-pdf Image has no alt prop
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image key={index} style={styles.photo} src={src} />
            ))
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>Keine Fotos</Text>
            </View>
          )}
        </View>

        <View style={styles.specsBox}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Kaufpreis</Text>
            <Text style={styles.specValue}>{formatPrice(price)}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Wohnfläche</Text>
            <Text style={styles.specValue}>
              {size.trim() ? `${size} m²` : "—"}
            </Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Zimmer</Text>
            <Text style={styles.specValue}>{rooms.trim() || "—"}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Ton / Stil</Text>
            <Text style={styles.specValue}>{tone}</Text>
          </View>
          <View style={{ width: "100%" }}>
            <Text style={styles.specLabel}>Ausstattung</Text>
            <Text style={styles.specValue}>
              {features.length > 0 ? features.join(" · ") : "—"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Objektbeschreibung</Text>
        <Text style={styles.expose}>{exposeText}</Text>

        <Text style={styles.footer}>
          Erstellt mit ImmoCaption AI · Nur für interne Vermarktung
        </Text>
      </Page>
    </Document>
  );
}
