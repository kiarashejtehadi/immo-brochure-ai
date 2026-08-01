import type { UiLocale } from "@/lib/i18n";

export type MarketingCopy = {
  brandName: string;
  navFeatures: string;
  navHowItWorks: string;
  navPricing: string;
  navSignIn: string;
  navTryFree: string;
  heroPillTag: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCta: string;
  heroCtaSample: string;
  heroBadgePdf: string;
  heroBadgeBranding: string;
  heroBadgeLanguages: string;
  heroBadgeVision: string;
  heroBadgeVideoReels: string;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  step1Title: string;
  step1Description: string;
  step2Title: string;
  step2Description: string;
  step3Title: string;
  step3Description: string;
  comparisonTitle: string;
  comparisonSubtitle: string;
  comparisonGenericTitle: string;
  comparisonImmoTitle: string;
  comparisonImmoBadge: string;
  comparisonGenericItems: readonly string[];
  comparisonImmoItems: readonly string[];
  freeTrialBannerTitle: string;
  freeTrialBannerCta: string;
  purchaseSuccessMessage: string;
};

const en: MarketingCopy = {
  brandName: "ImmoCaption AI",
  navFeatures: "Features",
  navHowItWorks: "How It Works",
  navPricing: "Pricing",
  navSignIn: "Sign In",
  navTryFree: "Try Free (2 Credits)",
  heroPillTag: "✨ AI-Powered Real Estate Studio",
  heroHeadline: "Turn Listing Specs into Professional Exposés in 60 Seconds",
  heroSubheadline:
    "Upload photos, enter property details, and let AI generate polished listing descriptions, social captions, and print-ready PDF brochures tailored for real estate agents.",
  heroCta: "Create Exposé Now",
  heroCtaSample: "See Sample Exposé & Reel",
  heroBadgePdf: "Instant 3-Page PDF Generation",
  heroBadgeBranding: "Custom Agency Branding",
  heroBadgeLanguages:
    "Multi-language Support (30+ Languages: EN, DE, FR, ES, IT & more)",
  heroBadgeVision: "AI Vision Analysis (Extracts visual details directly from photos)",
  heroBadgeVideoReels: "15s HD Social Media Video Reels (Instagram / TikTok ready)",
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
  comparisonTitle: "Why ImmoCaption AI vs. Generic ChatGPT?",
  comparisonSubtitle:
    "ChatGPT gives you unformatted plain text. We deliver print-ready, branded real estate brochures in seconds.",
  comparisonGenericTitle: "General AI Chatbots (ChatGPT / Gemini)",
  comparisonImmoTitle: "ImmoCaption AI",
  comparisonImmoBadge: "⚡ Built for Real Estate",
  comparisonGenericItems: [
    "Requires writing complex prompts manually",
    "Outputs plain text only—no PDF design or layout",
    "No agency logo, branding, or color customization",
    "Cannot format floor plans or property photo grids",
    "Manual prompt required for visual image recognition",
    "No branded video reels export",
    "Requires 10–15 minutes of tedious copy-pasting",
  ],
  comparisonImmoItems: [
    "Fill-in-the-blank structured form for quick input",
    "Generates a 3-page high-res print & portal PDF",
    "Automatic agency logo & custom brand colors",
    "Automated photo placement & floor plan layout",
    "Instant social media captions + location story",
    "Visual Image Recognition (GPT Vision)",
    "Branded Video Reels Export",
    "Done in under 60 seconds",
  ],
  freeTrialBannerTitle: "Get 2 Free Credits — No Credit Card Required",
  freeTrialBannerCta: "Sign Up Free",
  purchaseSuccessMessage: "Purchase successful — you're ready to create your exposé.",
};

const de: Partial<MarketingCopy> = {
  brandName: "ImmoCaption AI",
  navFeatures: "Funktionen",
  navHowItWorks: "So funktioniert's",
  navPricing: "Preise",
  navSignIn: "Anmelden",
  navTryFree: "Gratis testen (2 Credits)",
  heroPillTag: "✨ KI-gestütztes Immobilien-Studio",
  heroHeadline: "Aus Objektdaten wird in 60 Sekunden ein professionelles Exposé",
  heroSubheadline:
    "Fotos hochladen, Objektdaten eingeben — unsere KI erstellt überzeugende Exposé-Texte, Social Captions und druckfertige PDF-Broschüren für Immobilienmakler.",
  heroCta: "Exposé jetzt erstellen",
  heroCtaSample: "Beispiel-Exposé & Reel ansehen",
  heroBadgePdf: "Sofortiges 3-seitiges PDF",
  heroBadgeBranding: "Individuelles Agentur-Branding",
  heroBadgeLanguages:
    "Mehrsprachig (30+ Sprachen: DE, EN, FR, ES, IT & mehr)",
  heroBadgeVision: "KI-Bildanalyse (Visuelle Details direkt aus Fotos)",
  heroBadgeVideoReels: "15s HD Social-Media-Video-Reels (Instagram / TikTok)",
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
  comparisonTitle: "Warum ImmoCaption AI statt generischem ChatGPT?",
  comparisonSubtitle:
    "ChatGPT liefert unformatierten Fließtext. Wir erstellen in Sekunden druckfertige, gebrandete Immobilien-Exposés.",
  comparisonGenericTitle: "Allgemeine KI-Chatbots (ChatGPT / Gemini)",
  comparisonImmoTitle: "ImmoCaption AI",
  comparisonImmoBadge: "⚡ Für Immobilienprofis gebaut",
  comparisonGenericItems: [
    "Komplexe Prompts müssen manuell formuliert werden",
    "Nur Fließtext — kein PDF-Layout oder Design",
    "Kein Agentur-Logo, Branding oder Farbanpassung",
    "Keine automatische Foto- oder Grundriss-Platzierung",
    "Manueller Prompt für visuelle Bilderkennung nötig",
    "Kein gebrandeter Video-Reels-Export",
    "10–15 Minuten Copy-Paste-Aufwand",
  ],
  comparisonImmoItems: [
    "Strukturiertes Formular statt Prompt-Engineering",
    "3-seitiges PDF in Druck- & Portalqualität",
    "Automatisches Logo & individuelle Markenfarben",
    "Automatische Foto- und Grundriss-Layouts",
    "Sofort Social Captions + Lage-Story",
    "Visuelle Bilderkennung (GPT Vision)",
    "Gebrandeter Video-Reels-Export",
    "Fertig in unter 60 Sekunden",
  ],
  freeTrialBannerTitle: "2 Gratis-Credits — Keine Kreditkarte nötig",
  freeTrialBannerCta: "Kostenlos registrieren",
  purchaseSuccessMessage: "Kauf erfolgreich — Sie können jetzt Ihr Exposé erstellen.",
};

const fr: Partial<MarketingCopy> = {
  brandName: "ImmoCaption AI",
  navFeatures: "Fonctionnalités",
  navHowItWorks: "Comment ça marche",
  navPricing: "Tarifs",
  navSignIn: "Connexion",
  navTryFree: "Essai gratuit (2 crédits)",
  heroPillTag: "✨ Studio immobilier propulsé par l'IA",
  heroHeadline: "Transformez une fiche bien en exposé pro en 60 secondes",
  heroSubheadline:
    "Importez vos photos, saisissez les détails du bien — l'IA génère descriptions, légendes réseaux sociaux et PDF prêt à imprimer pour agents immobiliers.",
  heroCta: "Créer un exposé",
  heroCtaSample: "Voir un exposé & reel exemple",
  heroBadgePdf: "PDF 3 pages instantané",
  heroBadgeBranding: "Branding agence personnalisé",
  heroBadgeLanguages:
    "Multilingue (30+ langues : FR, EN, DE, ES, IT & plus)",
  heroBadgeVision: "Analyse visuelle IA (Détails extraits des photos)",
  heroBadgeVideoReels: "Reels vidéo HD 15 s (Instagram / TikTok)",
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
  comparisonTitle: "Pourquoi ImmoCaption AI plutôt que ChatGPT générique ?",
  comparisonSubtitle:
    "ChatGPT produit du texte brut. Nous livrons des brochures immobilières brandées, prêtes à imprimer, en quelques secondes.",
  comparisonGenericTitle: "Chatbots IA généralistes (ChatGPT / Gemini)",
  comparisonImmoTitle: "ImmoCaption AI",
  comparisonImmoBadge: "⚡ Conçu pour l'immobilier",
  comparisonGenericItems: [
    "Prompts complexes à rédiger manuellement",
    "Texte brut uniquement — pas de mise en page PDF",
    "Pas de logo agence, branding ni couleurs personnalisées",
    "Pas de grilles photos ou plans automatiques",
    "Prompt manuel requis pour la reconnaissance visuelle",
    "Pas d'export de reels vidéo brandés",
    "10–15 minutes de copier-coller fastidieux",
  ],
  comparisonImmoItems: [
    "Formulaire structuré — saisie rapide",
    "PDF 3 pages haute résolution pour print & portails",
    "Logo agence & couleurs de marque automatiques",
    "Placement photos & plan intégré automatiquement",
    "Légendes réseaux sociaux + texte local instantanés",
    "Reconnaissance visuelle (GPT Vision)",
    "Export de reels vidéo brandés",
    "Prêt en moins de 60 secondes",
  ],
  freeTrialBannerTitle: "2 crédits gratuits — Sans carte bancaire",
  freeTrialBannerCta: "Inscription gratuite",
  purchaseSuccessMessage: "Achat réussi — vous pouvez créer votre exposé.",
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

export function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
