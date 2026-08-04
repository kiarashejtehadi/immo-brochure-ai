import { getLegalBusinessConfig } from "@/config/legal-business";
import {
  buildConvenienceLegalDocument,
  isConvenienceLegalLocale,
} from "@/content/legal/convenience";
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

function buildBinding(kind: LegalPageKind, locale: "en" | "de"): LegalDocument {
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
  const cfg = getLegalBusinessConfig();

  if (bindingLegalLocales.includes(requestedLocale)) {
    const doc = buildBinding(kind, requestedLocale as "en" | "de");
    return {
      ...doc,
      locale: requestedLocale,
      showConvenienceNotice: false,
      bindingReferenceLocales: bindingLegalLocales,
    };
  }

  if (isConvenienceLegalLocale(requestedLocale)) {
    return buildConvenienceLegalDocument(kind, requestedLocale, cfg);
  }

  const doc = buildBinding(kind, "en");
  return {
    ...doc,
    locale: "en",
    showConvenienceNotice: true,
    bindingReferenceLocales: bindingLegalLocales,
  };
}

const convenienceNoticeCopy: Partial<
  Record<AppLocale, { title: string; body: string }>
> = {
  fr: {
    title: "Traduction de convenance",
    body: "Ce texte est une traduction de convenance. Les versions juridiquement contraignantes sont l'anglais (en) et l'allemand (de).",
  },
  es: {
    title: "Traducción de cortesía",
    body: "Este texto es una traducción de cortesía. Las versiones legalmente vinculantes son inglés (en) y alemán (de).",
  },
  it: {
    title: "Traduzione di cortesia",
    body: "Questo testo è una traduzione di cortesia. Le versioni legalmente vincolanti sono inglese (en) e tedesco (de).",
  },
  nl: {
    title: "Vertaling voor het gemak",
    body: "Deze tekst is een vertaling voor het gemak. De juridisch bindende versies zijn Engels (en) en Duits (de).",
  },
  pl: {
    title: "Tłumaczenie pomocnicze",
    body: "Ten tekst jest tłumaczeniem pomocniczym. Wersje prawnie wiążące to angielski (en) i niemiecki (de).",
  },
};

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
  return (
    convenienceNoticeCopy[requestedLocale] ?? {
      title: "Convenience translation",
      body: "This page is a convenience translation. The legally binding master texts are English (en) and German (de).",
    }
  );
}
