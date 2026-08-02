import type { BrandFontFamily } from "@/types/branding";

export const BRAND_FONT_OPTIONS: {
  value: BrandFontFamily;
  labelKey: "fontModern" | "fontClassic" | "fontMinimal";
}[] = [
  { value: "modern", labelKey: "fontModern" },
  { value: "classic", labelKey: "fontClassic" },
  { value: "minimal", labelKey: "fontMinimal" },
];

export function isBrandFontFamily(value: string | null | undefined): value is BrandFontFamily {
  return value === "modern" || value === "classic" || value === "minimal";
}

/** Maps brand kit font choice to built-in @react-pdf/renderer fonts. */
export function pdfFontFamily(fontFamily?: BrandFontFamily | string | null): string {
  switch (fontFamily) {
    case "classic":
      return "Times-Roman";
    case "minimal":
      return "Courier";
    default:
      return "Helvetica";
  }
}
