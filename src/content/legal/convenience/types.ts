import type { AppLocale } from "@/i18n/routing";
import type { LegalBusinessConfig } from "@/config/legal-business";
import type { LegalDocument, LegalPageKind } from "@/types/legal-content";

export type ConvenienceLocale = Exclude<AppLocale, "en" | "de">;

export type ConvenienceDocBuilder = (
  cfg: LegalBusinessConfig,
) => Omit<
  LegalDocument,
  "showConvenienceNotice" | "bindingReferenceLocales"
> & {
  showConvenienceNotice?: boolean;
  bindingReferenceLocales?: AppLocale[];
};

export type ConvenienceLocaleBuilders = Record<
  LegalPageKind,
  ConvenienceDocBuilder
>;

export function convenienceMeta(
  cfg: LegalBusinessConfig,
  locale: ConvenienceLocale,
): Pick<
  LegalDocument,
  | "locale"
  | "lastUpdated"
  | "isBindingMaster"
  | "showConvenienceNotice"
  | "bindingReferenceLocales"
> {
  return {
    locale,
    lastUpdated: cfg.lastUpdated,
    isBindingMaster: false,
    showConvenienceNotice: true,
    bindingReferenceLocales: ["en", "de"],
  };
}
