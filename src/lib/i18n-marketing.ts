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
  heroBadgeVoiceFill: string;
  heroBadgeGeocodedLocation: string;
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
  demoPreviewNotice: string;
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
  heroBadgeVoiceFill: "🎙️ Hands-free Voice Filling",
  heroBadgeGeocodedLocation: "📍 Geocoded Neighborhood Copy",
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
  demoPreviewNotice:
    "Sample preview — demo listing data (not saved). Sign up to generate your own exposé.",
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
  heroBadgeVoiceFill: "🎙️ Sprachgesteuertes Ausfüllen",
  heroBadgeGeocodedLocation: "📍 Geokodierte Lage-Texte",
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
  demoPreviewNotice:
    "Beispiel-Vorschau — Demo-Objektdaten (nicht gespeichert). Registrieren Sie sich für Ihr eigenes Exposé.",
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
  heroBadgeVoiceFill: "🎙️ Remplissage vocal mains libres",
  heroBadgeGeocodedLocation: "📍 Textes de quartier géocodés",
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
  demoPreviewNotice:
    "Aperçu exemple — données de démonstration (non enregistrées). Inscrivez-vous pour générer votre propre exposé.",
};

const es: Partial<MarketingCopy> = {
  navFeatures: "Funciones",
  navHowItWorks: "Cómo funciona",
  navPricing: "Precios",
  navSignIn: "Iniciar sesión",
  navTryFree: "Probar gratis (2 créditos)",
  heroPillTag: "✨ Estudio inmobiliario con IA",
  heroHeadline: "Convierta datos del inmueble en un exposé profesional en 60 segundos",
  heroSubheadline:
    "Suba fotos, introduzca los detalles — la IA genera descripciones, captions para redes y PDF listo para imprimir para agentes inmobiliarios.",
  heroCta: "Crear exposé ahora",
  heroCtaSample: "Ver exposé y reel de ejemplo",
  heroBadgePdf: "PDF de 3 páginas al instante",
  heroBadgeBranding: "Branding de agencia personalizado",
  heroBadgeLanguages:
    "Multilingüe (30+ idiomas: ES, EN, DE, FR, IT y más)",
  heroBadgeVision: "Análisis visual con IA (detalles extraídos de las fotos)",
  heroBadgeVideoReels: "Reels de vídeo HD de 15 s (Instagram / TikTok)",
  heroBadgeVoiceFill: "🎙️ Relleno por voz manos libres",
  heroBadgeGeocodedLocation: "📍 Textos de barrio geocodificados",
  howItWorksTitle: "Cómo funciona",
  howItWorksSubtitle: "De la ficha del inmueble al exposé listo para el cliente en tres pasos.",
  step1Title: "1. Datos básicos del inmueble",
  step1Description:
    "Introduzca características, precio y suba hasta 5 fotos o planos.",
  step2Title: "2. Motor de contenido IA",
  step2Description:
    "La IA redacta el exposé, la ubicación y los captions para redes al instante.",
  step3Title: "3. Descargar PDF con marca",
  step3Description:
    "Exporte un PDF de alta resolución con su logo y datos del agente.",
  comparisonTitle: "¿Por qué ImmoCaption AI y no ChatGPT genérico?",
  comparisonSubtitle:
    "ChatGPT devuelve texto sin formato. Nosotros entregamos folletos inmobiliarios con marca, listos para imprimir, en segundos.",
  comparisonGenericTitle: "Chatbots de IA general (ChatGPT / Gemini)",
  comparisonImmoBadge: "⚡ Diseñado para inmobiliarias",
  comparisonGenericItems: [
    "Hay que escribir prompts complejos manualmente",
    "Solo texto plano — sin diseño ni maquetación PDF",
    "Sin logo de agencia, branding ni colores personalizados",
    "Sin colocación automática de fotos o planos",
    "Prompt manual para reconocimiento visual de imágenes",
    "Sin exportación de reels de vídeo con marca",
    "10–15 minutos de copiar y pegar tedioso",
  ],
  comparisonImmoItems: [
    "Formulario estructurado para entrada rápida",
    "PDF de 3 páginas en alta resolución para impresión y portales",
    "Logo de agencia y colores de marca automáticos",
    "Colocación automática de fotos y planos",
    "Captions para redes + texto de ubicación al instante",
    "Reconocimiento visual (GPT Vision)",
    "Exportación de reels de vídeo con marca",
    "Listo en menos de 60 segundos",
  ],
  freeTrialBannerTitle: "2 créditos gratis — Sin tarjeta de crédito",
  freeTrialBannerCta: "Registro gratuito",
  purchaseSuccessMessage: "Compra realizada — ya puede crear su exposé.",
  demoPreviewNotice:
    "Vista previa de ejemplo — datos demo (no guardados). Regístrese para generar su propio exposé.",
};

const it: Partial<MarketingCopy> = {
  navFeatures: "Funzionalità",
  navHowItWorks: "Come funziona",
  navPricing: "Prezzi",
  navSignIn: "Accedi",
  navTryFree: "Prova gratis (2 crediti)",
  heroPillTag: "✨ Studio immobiliare con IA",
  heroHeadline: "Da scheda immobile a exposé professionale in 60 secondi",
  heroSubheadline:
    "Carica foto, inserisci i dettagli — l'IA genera descrizioni, caption social e PDF pronto per la stampa per agenti immobiliari.",
  heroCta: "Crea exposé ora",
  heroCtaSample: "Vedi exposé e reel di esempio",
  heroBadgePdf: "PDF 3 pagine istantaneo",
  heroBadgeBranding: "Branding agenzia personalizzato",
  heroBadgeLanguages:
    "Multilingue (30+ lingue: IT, EN, DE, FR, ES e altro)",
  heroBadgeVision: "Analisi visiva IA (dettagli estratti dalle foto)",
  heroBadgeVideoReels: "Reel video HD 15 s (Instagram / TikTok)",
  heroBadgeVoiceFill: "🎙️ Compilazione vocale hands-free",
  heroBadgeGeocodedLocation: "📍 Testi di quartiere geocodificati",
  howItWorksTitle: "Come funziona",
  howItWorksSubtitle: "Dalla scheda grezza all'exposé pronto per il cliente in tre passi.",
  step1Title: "1. Dati base dell'immobile",
  step1Description:
    "Inserisci caratteristiche, prezzo e carica fino a 5 foto o planimetrie.",
  step2Title: "2. Motore contenuti IA",
  step2Description:
    "L'IA scrive exposé, posizione e caption social all'istante.",
  step3Title: "3. Scarica PDF brandizzato",
  step3Description:
    "Esporta un PDF ad alta risoluzione con logo e contatti dell'agente.",
  comparisonTitle: "Perché ImmoCaption AI invece di ChatGPT generico?",
  comparisonSubtitle:
    "ChatGPT restituisce testo non formattato. Noi consegniamo brochure immobiliari brandizzate, pronte per la stampa, in pochi secondi.",
  comparisonGenericTitle: "Chatbot IA generici (ChatGPT / Gemini)",
  comparisonImmoBadge: "⚡ Creato per il settore immobiliare",
  comparisonGenericItems: [
    "Prompt complessi da scrivere manualmente",
    "Solo testo — nessun layout o design PDF",
    "Nessun logo agenzia, branding o colori personalizzati",
    "Nessun posizionamento automatico di foto o planimetrie",
    "Prompt manuale per il riconoscimento visivo",
    "Nessuna esportazione reel video brandizzati",
    "10–15 minuti di copia-incolla noioso",
  ],
  comparisonImmoItems: [
    "Modulo strutturato per inserimento rapido",
    "PDF 3 pagine ad alta risoluzione per stampa e portali",
    "Logo agenzia e colori di marca automatici",
    "Posizionamento automatico di foto e planimetrie",
    "Caption social + testo location istantanei",
    "Riconoscimento visivo (GPT Vision)",
    "Esportazione reel video brandizzati",
    "Pronto in meno di 60 secondi",
  ],
  freeTrialBannerTitle: "2 crediti gratis — Nessuna carta di credito",
  freeTrialBannerCta: "Registrati gratis",
  purchaseSuccessMessage: "Acquisto completato — puoi creare il tuo exposé.",
  demoPreviewNotice:
    "Anteprima esempio — dati demo (non salvati). Registrati per generare il tuo exposé.",
};

const nl: Partial<MarketingCopy> = {
  navFeatures: "Functies",
  navHowItWorks: "Hoe het werkt",
  navPricing: "Prijzen",
  navSignIn: "Inloggen",
  navTryFree: "Gratis proberen (2 credits)",
  heroPillTag: "✨ AI-gestuurd vastgoedstudio",
  heroHeadline: "Van woninggegevens naar professionele exposé in 60 seconden",
  heroSubheadline:
    "Upload foto's, voer details in — AI genereert beschrijvingen, social captions en printklare PDF-brochures voor makelaars.",
  heroCta: "Exposé nu maken",
  heroCtaSample: "Voorbeeld-exposé & reel bekijken",
  heroBadgePdf: "Direct 3-pagina PDF",
  heroBadgeBranding: "Aangepaste makelaarsbranding",
  heroBadgeLanguages:
    "Meertalig (30+ talen: NL, EN, DE, FR, ES & meer)",
  heroBadgeVision: "AI-beeldanalyse (visuele details uit foto's)",
  heroBadgeVideoReels: "15s HD social media video-reels (Instagram / TikTok)",
  heroBadgeVoiceFill: "🎙️ Invullen met spraak (hands-free)",
  heroBadgeGeocodedLocation: "📍 Geocodeerde buurtteksten",
  howItWorksTitle: "Hoe het werkt",
  howItWorksSubtitle: "Van ruwe listing naar klantklare exposé in drie stappen.",
  step1Title: "1. Basisgegevens invullen",
  step1Description:
    "Voer specificaties, prijs in en upload tot 5 foto's of plattegronden.",
  step2Title: "2. AI-contentengine",
  step2Description:
    "Onze AI schrijft exposétekst, locatiebeschrijving en social captions direct.",
  step3Title: "3. Gebrande PDF downloaden",
  step3Description:
    "Exporteer een hoge-resolutie, printklare PDF met logo en makelaarscontact.",
  comparisonTitle: "Waarom ImmoCaption AI vs. generieke ChatGPT?",
  comparisonSubtitle:
    "ChatGPT levert onopgemaakte platte tekst. Wij leveren printklare, gebrande vastgoedbrochures in seconden.",
  comparisonGenericTitle: "Algemene AI-chatbots (ChatGPT / Gemini)",
  comparisonImmoBadge: "⚡ Gebouwd voor vastgoed",
  comparisonGenericItems: [
    "Complexe prompts handmatig schrijven",
    "Alleen platte tekst — geen PDF-design of layout",
    "Geen makelaarslogo, branding of kleuraanpassing",
    "Geen automatische foto- of plattegrondindeling",
    "Handmatige prompt voor visuele beeldherkenning",
    "Geen gebrande video-reel export",
    "10–15 minuten vervelend kopiëren-plakken",
  ],
  comparisonImmoItems: [
    "Gestructureerd invulformulier voor snelle invoer",
    "3-pagina hoge-resolutie PDF voor print & portalen",
    "Automatisch makelaarslogo & huisstijlkleuren",
    "Automatische fotoplaatsing & plattegrondlayout",
    "Direct social captions + locatieverhaal",
    "Visuele beeldherkenning (GPT Vision)",
    "Gebrande video-reel export",
    "Klaar in minder dan 60 seconden",
  ],
  freeTrialBannerTitle: "2 gratis credits — Geen creditcard nodig",
  freeTrialBannerCta: "Gratis registreren",
  purchaseSuccessMessage: "Aankoop geslaagd — u kunt nu uw exposé maken.",
  demoPreviewNotice:
    "Voorbeeldweergave — demogegevens (niet opgeslagen). Meld u aan om uw eigen exposé te maken.",
};


const pl: Partial<MarketingCopy> = {
  navFeatures: "Funkcje",
  navHowItWorks: "Jak to działa",
  navPricing: "Cennik",
  navSignIn: "Zaloguj się",
  navTryFree: "Wypróbuj za darmo (2 kredyty)",
  heroPillTag: "✨ Studio nieruchomości z AI",
  heroHeadline: "Z danych oferty do profesjonalnego exposé w 60 sekund",
  heroSubheadline:
    "Prześlij zdjęcia, wprowadź szczegóły — AI generuje opisy, captiony social media i PDF gotowy do druku dla agentów nieruchomości.",
  heroCta: "Utwórz exposé",
  heroCtaSample: "Zobacz przykładowe exposé i reel",
  heroBadgePdf: "Natychmiastowy PDF 3-stronicowy",
  heroBadgeBranding: "Własny branding agencji",
  heroBadgeLanguages:
    "Wielojęzyczność (30+ języków: PL, EN, DE, FR, ES i więcej)",
  heroBadgeVision: "Analiza wizualna AI (szczegóły wyciągnięte ze zdjęć)",
  heroBadgeVideoReels: "15s HD video reels (Instagram / TikTok)",
  heroBadgeVoiceFill: "🎙️ Wypełnianie głosem (hands-free)",
  heroBadgeGeocodedLocation: "📍 Geokodowane opisy okolicy",
  howItWorksTitle: "Jak to działa",
  howItWorksSubtitle: "Od surowych danych oferty do exposé dla klienta w trzech krokach.",
  step1Title: "1. Podstawowe dane oferty",
  step1Description:
    "Wprowadź parametry, cenę i prześlij do 5 zdjęć lub planów.",
  step2Title: "2. Silnik treści AI",
  step2Description:
    "AI tworzy tekst exposé, opis lokalizacji i captiony social media natychmiast.",
  step3Title: "3. Pobierz PDF z brandingiem",
  step3Description:
    "Eksportuj PDF w wysokiej rozdzielczości z logo i danymi pośrednika.",
  comparisonTitle: "Dlaczego ImmoCaption AI zamiast ogólnego ChatGPT?",
  comparisonSubtitle:
    "ChatGPT daje zwykły tekst. My dostarczamy gotowe do druku, brandowane broszury nieruchomości w sekundy.",
  comparisonGenericTitle: "Ogólne chatboty AI (ChatGPT / Gemini)",
  comparisonImmoBadge: "⚡ Stworzone dla nieruchomości",
  comparisonGenericItems: [
    "Wymaga ręcznego pisania skomplikowanych promptów",
    "Tylko zwykły tekst — bez layoutu PDF",
    "Bez logo agencji, brandingu ani kolorów",
    "Bez automatycznego układu zdjęć i planów",
    "Ręczny prompt do rozpoznawania obrazów",
    "Brak eksportu brandowanych video reels",
    "10–15 minut żmudnego kopiowania",
  ],
  comparisonImmoItems: [
    "Ustrukturyzowany formularz do szybkiego wprowadzania",
    "3-stronicowy PDF w wysokiej rozdzielczości do druku i portali",
    "Automatyczne logo agencji i kolory marki",
    "Automatyczne rozmieszczenie zdjęć i planów",
    "Natychmiast captiony social + opis lokalizacji",
    "Rozpoznawanie wizualne (GPT Vision)",
    "Eksport brandowanych video reels",
    "Gotowe w mniej niż 60 sekund",
  ],
  freeTrialBannerTitle: "2 darmowe kredyty — Bez karty kredytowej",
  freeTrialBannerCta: "Zarejestruj się za darmo",
  purchaseSuccessMessage: "Zakup zakończony — możesz teraz utworzyć exposé.",
  demoPreviewNotice:
    "Podgląd przykładu — dane demo (niezapisane). Zarejestruj się, aby wygenerować własne exposé.",
};

const marketingByLocale: Record<UiLocale, Partial<MarketingCopy>> = {
  en: {},
  de,
  fr,
  es,
  it,
  nl,
  pl,
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
