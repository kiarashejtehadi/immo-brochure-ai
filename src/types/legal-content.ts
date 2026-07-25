import type { AppLocale } from "@/i18n/routing";

export type LegalPageKind = "imprint" | "privacy" | "terms";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  listItems?: string[];
};

export type LegalDocument = {
  kind: LegalPageKind;
  locale: AppLocale;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
  /** True when this text is a binding master (en/de). */
  isBindingMaster: boolean;
  /** Shown when UI locale differs from document locale (convenience translation). */
  showConvenienceNotice: boolean;
  /** Which master locale is legally binding for this view. */
  bindingReferenceLocales: AppLocale[];
};
