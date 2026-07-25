import { getLegalBusinessConfig } from "@/config/legal-business";
import {
  buildImprintDe,
  buildImprintEn,
  buildPrivacyDe,
  buildPrivacyEn,
  buildTermsDe,
  buildTermsEn,
} from "@/content/legal/documents";
import { bindingLegalLocales, type AppLocale } from "@/i18n/routing";
import type { LegalDocument, LegalPageKind } from "@/types/legal-content";

function resolveDocumentLocale(
  requested: AppLocale,
  kind: LegalPageKind,
): AppLocale {
  void kind;
  if (bindingLegalLocales.includes(requested)) {
    return requested;
  }
  return "en";
}

function build(kind: LegalPageKind, locale: AppLocale): LegalDocument {
  const cfg = getLegalBusinessConfig();
  switch (kind) {
    case "imprint":
      return locale === "de" ? buildImprintDe(cfg) : buildImprintEn(cfg);
    case "privacy":
      return locale === "de" ? buildPrivacyDe(cfg) : buildPrivacyEn(cfg);
    case "terms":
      return locale === "de" ? buildTermsDe(cfg) : buildTermsEn(cfg);
    default:
      return buildPrivacyEn(cfg);
  }
}

export function getLegalDocument(
  kind: LegalPageKind,
  requestedLocale: AppLocale,
): LegalDocument {
  const documentLocale = resolveDocumentLocale(requestedLocale, kind);
  const doc = build(kind, documentLocale);
  const showConvenienceNotice =
    requestedLocale !== documentLocale &&
    !bindingLegalLocales.includes(requestedLocale);

  return {
    ...doc,
    locale: documentLocale,
    showConvenienceNotice,
    bindingReferenceLocales: bindingLegalLocales,
  };
}

export function getConvenienceNotice(
  requestedLocale: AppLocale,
  documentLocale: AppLocale,
): { title: string; body: string } {
  if (requestedLocale === "de" && documentLocale === "de") {
    return {
      title: "Rechtlich bindende Fassung",
      body: "Diese deutsche Fassung ist zusammen mit der englischen Fassung rechtlich bindend.",
    };
  }
  if (requestedLocale === "en") {
    return {
      title: "Binding version",
      body: "This English text is legally binding together with the German master version where provided.",
    };
  }
  return {
    title: "Convenience translation",
    body: "This translated version is provided for convenience only. The English and German master texts are legally binding.",
  };
}
