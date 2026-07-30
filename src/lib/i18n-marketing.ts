import type { UiLocale } from "@/lib/i18n";

export type MarketingCopy = {
  heroPillTag: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCta: string;
  heroBadgePdf: string;
  heroBadgeBranding: string;
  heroBadgeLanguages: string;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  step1Title: string;
  step1Description: string;
  step2Title: string;
  step2Description: string;
  step3Title: string;
  step3Description: string;
};

const en: MarketingCopy = {
  heroPillTag: "✨ AI-Powered Real Estate Studio",
  heroHeadline: "Turn Listing Specs into Professional Exposés in 60 Seconds",
  heroSubheadline:
    "Upload photos, enter property details, and let AI generate polished listing descriptions, social captions, and print-ready PDF brochures tailored for real estate agents.",
  heroCta: "Create Exposé Now",
  heroBadgePdf: "Instant 3-Page PDF Generation",
  heroBadgeBranding: "Custom Agency Branding",
  heroBadgeLanguages: "Multi-language Support (EN / DE / FR)",
  howItWorksTitle: "How it works",
  howItWorksSubtitle: "From raw listing data to a client-ready exposé in three simple steps.",
  step1Title: "1. Fill Listing Basics",
  step1Description:
    "Enter property specs, pricing, and upload up to 5 photos or floor plans.",
  step2Title: "2. AI Content Engine",
  step2Description:
    "Our AI crafts professional exposé copy, location highlights, and social media captions instantly.",
  step3Title: "3. Download Branded PDF",
  step3Description:
    "Export a high-resolution, print-ready PDF brochure complete with your logo and broker contacts.",
};

const de: Partial<MarketingCopy> = {
  heroPillTag: "✨ KI-gestütztes Immobilien-Studio",
  heroHeadline: "Aus Objektdaten wird in 60 Sekunden ein professionelles Exposé",
  heroSubheadline:
    "Fotos hochladen, Objektdaten eingeben — unsere KI erstellt überzeugende Exposé-Texte, Social Captions und druckfertige PDF-Broschüren für Immobilienmakler.",
  heroCta: "Exposé jetzt erstellen",
  heroBadgePdf: "Sofortiges 3-seitiges PDF",
  heroBadgeBranding: "Individuelles Agentur-Branding",
  heroBadgeLanguages: "Mehrsprachig (DE / EN / FR)",
  howItWorksTitle: "So funktioniert's",
  howItWorksSubtitle: "In drei Schritten vom Listing zum kundenfertigen Exposé.",
  step1Title: "1. Objektdaten erfassen",
  step1Description:
    "Angaben zu Fläche, Preis und Ausstattung — plus bis zu 5 Fotos oder Grundrisse.",
  step2Title: "2. KI-Content-Engine",
  step2Description:
    "Die KI schreibt Exposé-Text, Lagebeschreibung und Social-Media-Captions in Sekunden.",
  step3Title: "3. Gebrandetes PDF laden",
  step3Description:
    "Export als hochauflösendes, druckfertiges PDF mit Logo und Maklerkontakten.",
};

const fr: Partial<MarketingCopy> = {
  heroPillTag: "✨ Studio immobilier propulsé par l'IA",
  heroHeadline: "Transformez une fiche bien en exposé pro en 60 secondes",
  heroSubheadline:
    "Importez vos photos, saisissez les détails du bien — l'IA génère descriptions, légendes réseaux sociaux et PDF prêt à imprimer pour agents immobiliers.",
  heroCta: "Créer un exposé",
  heroBadgePdf: "PDF 3 pages instantané",
  heroBadgeBranding: "Branding agence personnalisé",
  heroBadgeLanguages: "Multilingue (FR / EN / DE)",
  howItWorksTitle: "Comment ça marche",
  howItWorksSubtitle: "De la fiche brute à l'exposé client en trois étapes.",
  step1Title: "1. Saisir les bases",
  step1Description:
    "Caractéristiques, prix et jusqu'à 5 photos ou plans.",
  step2Title: "2. Moteur de contenu IA",
  step2Description:
    "L'IA rédige l'exposé, la localisation et les légendes sociales instantanément.",
  step3Title: "3. Télécharger le PDF brandé",
  step3Description:
    "Export PDF haute résolution avec logo et contacts du courtier.",
};

const marketingByLocale: Record<UiLocale, Partial<MarketingCopy>> = {
  en: {},
  de,
  fr,
  es: {},
  it: {},
  nl: {},
  fa: {},
  ar: {},
  pl: {},
};

export function getMarketingCopy(locale: UiLocale): MarketingCopy {
  return { ...en, ...marketingByLocale[locale] };
}

export function scrollToListingForm() {
  document.getElementById("listing-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
