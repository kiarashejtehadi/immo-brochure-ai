import type { LegalBusinessConfig } from "@/config/legal-business";
import type { LegalDocument, LegalPageKind } from "@/types/legal-content";
import type { ConvenienceLocale } from "@/content/legal/convenience/types";
import { buildImprintAr, buildPrivacyAr, buildTermsAr } from "@/content/legal/convenience/locales/ar";
import { buildImprintEs, buildPrivacyEs, buildTermsEs } from "@/content/legal/convenience/locales/es";
import { buildImprintFa, buildPrivacyFa, buildTermsFa } from "@/content/legal/convenience/locales/fa";
import { buildImprintFr, buildPrivacyFr, buildTermsFr } from "@/content/legal/convenience/locales/fr";
import { buildImprintIt, buildPrivacyIt, buildTermsIt } from "@/content/legal/convenience/locales/it";
import { buildImprintNl, buildPrivacyNl, buildTermsNl } from "@/content/legal/convenience/locales/nl";
import { buildImprintPl, buildPrivacyPl, buildTermsPl } from "@/content/legal/convenience/locales/pl";

type Builder = (cfg: LegalBusinessConfig) => LegalDocument;

const registry: Record<
  ConvenienceLocale,
  Record<LegalPageKind, Builder>
> = {
  fr: {
    imprint: buildImprintFr,
    privacy: buildPrivacyFr,
    terms: buildTermsFr,
  },
  es: {
    imprint: buildImprintEs,
    privacy: buildPrivacyEs,
    terms: buildTermsEs,
  },
  it: {
    imprint: buildImprintIt,
    privacy: buildPrivacyIt,
    terms: buildTermsIt,
  },
  nl: {
    imprint: buildImprintNl,
    privacy: buildPrivacyNl,
    terms: buildTermsNl,
  },
  pl: {
    imprint: buildImprintPl,
    privacy: buildPrivacyPl,
    terms: buildTermsPl,
  },
  fa: {
    imprint: buildImprintFa,
    privacy: buildPrivacyFa,
    terms: buildTermsFa,
  },
  ar: {
    imprint: buildImprintAr,
    privacy: buildPrivacyAr,
    terms: buildTermsAr,
  },
};

export function buildConvenienceLegalDocument(
  kind: LegalPageKind,
  locale: ConvenienceLocale,
  cfg: LegalBusinessConfig,
): LegalDocument {
  return registry[locale][kind](cfg);
}

export function isConvenienceLegalLocale(
  locale: string,
): locale is ConvenienceLocale {
  return locale in registry;
}
