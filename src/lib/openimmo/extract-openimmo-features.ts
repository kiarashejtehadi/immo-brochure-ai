import type { FeatureKey } from "@/lib/i18n";
import type { ParkingType } from "@/types/listing";
import {
  getText,
  getValue,
  isPresentFlag,
  textValue,
} from "@/lib/openimmo/xml-node-utils";

function hasPositiveNumber(value: string): boolean {
  const num = Number(value.replace(",", "."));
  return Number.isFinite(num) && num > 0;
}

/** Map OpenImmo `<ausstattung>` flags to form feature chips. */
export function extractOpenImmoFeatures(
  ausstattung: Record<string, unknown> | undefined,
  flaechen?: Record<string, unknown>,
): FeatureKey[] {
  const features = new Set<FeatureKey>();
  const aus = ausstattung ?? {};
  const fl = flaechen ?? {};

  if (
    isPresentFlag(aus, "balkon_terrasse_pflicht") ||
    isPresentFlag(aus, "balkon") ||
    isPresentFlag(aus, "terrasse") ||
    hasPositiveNumber(getText(fl, "anzahl_balkone")) ||
    hasPositiveNumber(getText(fl, "anzahl_terrassen"))
  ) {
    features.add("Balcony Terrace");
  }

  if (isPresentFlag(aus, "einbaukueche") || isPresentFlag(aus, "ebk")) {
    features.add("Fitted Kitchen");
  }

  if (isPresentFlag(aus, "aufzug") || isPresentFlag(aus, "fahrstuhl")) {
    features.add("Elevator");
  }

  if (isPresentFlag(aus, "keller") || isPresentFlag(aus, "unterkellert")) {
    features.add("Cellar");
  }

  if (isPresentFlag(aus, "gartennutzung") || isPresentFlag(aus, "garten")) {
    features.add("Garden");
  }

  if (isPresentFlag(aus, "gaeste_wc") || isPresentFlag(aus, "gaestewc")) {
    features.add("Guest WC");
  }

  if (isPresentFlag(aus, "barrierefrei") || isPresentFlag(aus, "rollstuhlgerecht")) {
    features.add("Wheelchair Accessible");
  }

  return [...features];
}

/** Map OpenImmo `<stellplatzart>` to parking dropdown values. */
export function extractOpenImmoParking(
  ausstattung: Record<string, unknown> | undefined,
): ParkingType | "" {
  if (!ausstattung) return "";

  const stellplatzart = getValue(ausstattung, "stellplatzart");
  if (!stellplatzart) return "";

  if (typeof stellplatzart === "object" && stellplatzart !== null) {
    const node = stellplatzart as Record<string, unknown>;
    if (isPresentFlag(node, "TIEFGARAGE") || isPresentFlag(node, "PARKHAUS")) {
      return "underground";
    }
    if (isPresentFlag(node, "GARAGE")) return "garage";
    if (
      isPresentFlag(node, "FREIPLATZ") ||
      isPresentFlag(node, "CARPORT") ||
      isPresentFlag(node, "PARKPLATZ") ||
      isPresentFlag(node, "DUPLEX")
    ) {
      return "outdoor";
    }
    return "outdoor";
  }

  const label = textValue(stellplatzart).toUpperCase();
  if (!label) return "outdoor";
  if (label.includes("TIEF") || label.includes("PARKHAUS")) return "underground";
  if (label.includes("GARAGE")) return "garage";
  return "outdoor";
}
