import { pdfFontFamily } from "@/lib/branding/font-family";
import type { BrandFontFamily } from "@/types/branding";

/** Built-in @react-pdf/renderer standard PDF fonts (no Font.register required). */
export const PDF_BUILT_IN_FONTS = new Set([
  "Helvetica",
  "Helvetica-Bold",
  "Helvetica-Oblique",
  "Helvetica-BoldOblique",
  "Times-Roman",
  "Times-Bold",
  "Times-Italic",
  "Times-BoldItalic",
  "Courier",
  "Courier-Bold",
  "Courier-Oblique",
  "Courier-BoldOblique",
]);

let fontsReady = false;

/** Resolve brand kit choice to a built-in PDF font family (never a web/CSS font name). */
export function resolvePdfFontFamily(
  fontFamily?: BrandFontFamily | string | null,
): string {
  const resolved = pdfFontFamily(fontFamily);
  if (PDF_BUILT_IN_FONTS.has(resolved)) return resolved;
  console.warn("[pdf] Unknown font family, falling back to Helvetica:", resolved);
  return "Helvetica";
}

/** Call once before pdf().toBlob() — validates we only use built-in PDF fonts. */
export function ensurePdfFontsReady(fontFamily?: BrandFontFamily | string | null): string {
  const family = resolvePdfFontFamily(fontFamily);
  if (!fontsReady) {
    console.log("[pdf] Using built-in PDF font:", family);
    fontsReady = true;
  }
  return family;
}

/** Prefer explicit bold built-in variants over fontWeight synthesis in react-pdf. */
export function pdfBoldFontFamily(baseFamily: string): string {
  switch (baseFamily) {
    case "Times-Roman":
      return "Times-Bold";
    case "Courier":
      return "Courier-Bold";
    default:
      return "Helvetica-Bold";
  }
}
