import type { UiLocale } from "@/lib/i18n";
import { DACH_LEGAL_DISCLAIMER } from "@/lib/listing-market-presets";

export type FormCopy = {
  exposeLanguage: string;
  exposeLanguageHint: string;
  sectionListingOverview: string;
  sectionSpecsPricing: string;
  sectionBuildingEnergy: string;
  sectionFeatures: string;
  sectionMedia: string;
  sectionAgentOutput: string;
  workflowStep1Title: string;
  workflowStep2Title: string;
  workflowStep3Title: string;
  workflowNext: string;
  workflowBack: string;
  workflowStep1Error: string;
  previewOutputsLabel: string;
  photoMoveEarlier: string;
  photoMoveLater: string;
  advancedOutputOptions: string;
  includeStandardLegalDisclaimer: string;
  includeStandardLegalDisclaimerHint: string;
  propertyType: string;
  propertyTypeApartment: string;
  propertyTypeHouse: string;
  propertyTypePenthouse: string;
  propertyTypeCommercial: string;
  propertyTypeLand: string;
  floorLevel: string;
  floorLevelPlaceholder: string;
  parking: string;
  parkingNone: string;
  parkingOutdoor: string;
  parkingGarage: string;
  parkingUnderground: string;
  parkingFee: string;
  condition: string;
  conditionFirstOccupancy: string;
  conditionModernized: string;
  conditionWellMaintained: string;
  conditionNeedsRenovation: string;
  epcSection: string;
  forRent: string;
  forSale: string;
  transactionBadgeRent: string;
  transactionBadgeSale: string;
  basics: string;
  rentDetails: string;
  saleDetails: string;
  netColdRent: string;
  utilityCharges: string;
  totalRent: string;
  securityDeposit: string;
  availableFrom: string;
  minimumLeaseTerm: string;
  petPolicy: string;
  purchasePrice: string;
  hoaFee: string;
  rentalYield: string;
  commissionTerms: string;
  energySection: string;
  energyExpand: string;
  certificateType: string;
  certConsumption: string;
  certDemand: string;
  certNa: string;
  energyValue: string;
  energyClass: string;
  heatingSource: string;
  constructionYear: string;
  heatingInstallYear: string;
  heatPump: string;
  districtHeating: string;
  gas: string;
  oil: string;
  electricity: string;
  solar: string;
  agentSection: string;
  agentName: string;
  agency: string;
  phone: string;
  email: string;
  legalDisclaimer: string;
  floorPlan: string;
  floorPlanHint: string;
  tabStory: string;
  tabLocation: string;
  tabSocial: string;
  tabReel: string;
  exportReel: string;
  exportingReel: string;
  reelHint: string;
  reelExportUnsupported: string;
  reelExportFailed: string;
  reelPerMonth: string;
  reelRoomsSuffix: string;
  reelProOnly: string;
  reelUpgradeBanner: string;
  reelDemoHint: string;
  reelSignInRequired: string;
  reelPaymentRequired: string;
  headline: string;
  summaryLabel: string;
  locationLabel: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialFacebook: string;
  fullDescriptionLabel: string;
  generationNotesLabel: string;
  generationNotesPlaceholder: string;
  previewHighlightsPlaceholder: string;
  stagingDisclaimerLabel: string;
  addCustomNote: string;
  customNoteTitlePlaceholder: string;
  customNoteBodyPlaceholder: string;
  removeCustomNote: string;
  defaultLegalDisclaimer: string;
  furnishingStatus: string;
  furnishingUnfurnished: string;
  furnishingPartially: string;
  furnishingFully: string;
  isStagedOrModel: string;
  isStagedOrModelHint: string;
  stagingDisclaimerUnfurnished: string;
  stagingDisclaimerPartially: string;
  resetToBrandingDefaults: string;
  hideExactHouseNumber: string;
  hideExactHouseNumberHint: string;
  targetMarketLabel: string;
  targetMarketDach: string;
  targetMarketGlobal: string;
  userRoleLabel: string;
  userRoleAgent: string;
  userRolePrivateSeller: string;
  commissionLabel: string;
  commissionPrivateSellerNote: string;
  commissionFreeRent: string;
  commissionRentCustom: string;
  commissionRentPlaceholder: string;
  commissionFree: string;
  commissionSaleCustom: string;
  commissionSalePlaceholder: string;
  commissionAddCustomFee: string;
  /** @deprecated Use commissionRentCustom / commissionSaleCustom */
  commissionLandlordPaid: string;
  /** @deprecated Use commissionSaleCustom */
  commissionBuyer: string;
  /** @deprecated Use commissionSalePlaceholder */
  commissionBuyerPlaceholder: string;
  globalPrice: string;
  bedrooms: string;
  bathrooms: string;
  agentCompanyAddress: string;
  agentLicenseId: string;
  fillDemoDachListing: string;
  dachForRent: string;
  dachForSale: string;
  dachHouseFee: string;
  dachDeposit: string;
  dachCertHeritage: string;
  woodPellets: string;
  energyValueKwh: string;
  globalEnergyExpand: string;
  dachConditionFirstOccupancy: string;
  dachConditionFullyRenovated: string;
  dachConditionRenovated: string;
  dachConditionMaintained: string;
  dachConditionNeedsRenovation: string;
  quickAutofillTitle: string;
  quickAutofillSubtitle: string;
  quickAutofillDropLabel: string;
  quickAutofillBrowse: string;
  quickAutofillVoiceCta: string;
  quickAutofillVoiceHint: string;
  quickAutofillTranscriptLabel: string;
  quickAutofillSuccessBadge: string;
  quickAutofillReset: string;
  quickAutofillResetHint: string;
  openImmoImportLabel: string;
  openImmoImportHint: string;
  openImmoImporting: string;
  openImmoImportSuccess: string;
  openImmoImportError: string;
  openImmoPickPropertyTitle: string;
  openImmoPickPropertyHint: string;
};

const en: FormCopy = {
  exposeLanguage: "Exposé language",
  exposeLanguageHint:
    "Language for AI-generated exposé text, social captions, and PDF output.",
  sectionListingOverview: "Listing overview",
  sectionSpecsPricing: "Key specifications & pricing",
  sectionBuildingEnergy: "Building, energy & parking",
  sectionFeatures: "Features & amenities",
  sectionMedia: "Media uploads",
  sectionAgentOutput: "Agent & contact",
  workflowStep1Title: "Property Info",
  workflowStep2Title: "Specs & Media",
  workflowStep3Title: "Generate & Export",
  workflowNext: "Next",
  workflowBack: "Back",
  workflowStep1Error:
    "Select a property type and enter a street or postal code with city before continuing.",
  previewOutputsLabel: "Preview outputs",
  photoMoveEarlier: "Move earlier",
  photoMoveLater: "Move later",
  advancedOutputOptions: "Advanced / output options",
  includeStandardLegalDisclaimer: "Include standard legal disclaimer",
  includeStandardLegalDisclaimerHint:
    "Shown on the PDF contact page. You can edit the text below before generating.",
  propertyType: "Property type",
  propertyTypeApartment: "Apartment",
  propertyTypeHouse: "House",
  propertyTypePenthouse: "Penthouse",
  propertyTypeCommercial: "Commercial",
  propertyTypeLand: "Land",
  floorLevel: "Floor level",
  floorLevelPlaceholder: "e.g. 2nd floor",
  parking: "Parking",
  parkingNone: "None",
  parkingOutdoor: "Outdoor space",
  parkingGarage: "Garage",
  parkingUnderground: "Underground / Tiefgarage",
  parkingFee: "Parking fee",
  condition: "Condition",
  conditionFirstOccupancy: "First occupancy",
  conditionModernized: "Modernized / renovated",
  conditionWellMaintained: "Well maintained",
  conditionNeedsRenovation: "Needs renovation",
  epcSection: "Energy performance certificate (EPC)",
  forRent: "For Rent",
  forSale: "For Sale",
  transactionBadgeRent: "FOR RENT",
  transactionBadgeSale: "FOR SALE",
  basics: "Core listing data",
  rentDetails: "Rental terms",
  saleDetails: "Purchase & investment",
  netColdRent: "Net cold rent",
  utilityCharges: "Utility charges",
  totalRent: "Total rent",
  securityDeposit: "Security deposit",
  availableFrom: "Available from",
  minimumLeaseTerm: "Minimum lease term",
  petPolicy: "Pet policy",
  purchasePrice: "Purchase price",
  hoaFee: "HOA / monthly maintenance fee",
  rentalYield: "Rental yield / existing income",
  commissionTerms: "Commission / brokerage terms",
  energySection: "Energy performance certificate (EPC)",
  energyExpand: "Energy & building data",
  certificateType: "Certificate type",
  certConsumption: "Consumption certificate",
  certDemand: "Demand certificate",
  certNa: "Not applicable",
  energyValue: "Energy value (e.g. 120 kWh/m²a)",
  energyClass: "Energy efficiency class",
  heatingSource: "Heating source",
  constructionYear: "Construction year",
  heatingInstallYear: "Heating installation year",
  heatPump: "Heat pump",
  districtHeating: "District heating",
  gas: "Gas",
  oil: "Oil",
  electricity: "Electricity",
  solar: "Solar",
  agentSection: "Agent & legal",
  agentName: "Agent name",
  agency: "Agency",
  phone: "Phone",
  email: "Email",
  legalDisclaimer: "Legal disclaimer / imprint text",
  floorPlan: "Floor plan image",
  floorPlanHint: "Optional — shown on PDF page 3",
  tabStory: "Exposé story",
  tabLocation: "Location",
  tabSocial: "Social media",
  tabReel: "Video reel",
  exportReel: "Export MP4 reel",
  exportingReel: "Rendering reel…",
  reelHint: "15-second vertical reel (1080×1920) for Instagram Reels and TikTok. Export requires Chrome or Edge.",
  reelExportUnsupported:
    "Your browser cannot export MP4 reels. Try Chrome or Edge on desktop.",
  reelExportFailed: "Reel export failed. Please try again.",
  reelPerMonth: " / month",
  reelRoomsSuffix: "rooms",
  reelProOnly: "Video Reels are exclusive to Monthly and Yearly Pro plans.",
  reelUpgradeBanner:
    "Upgrade to Monthly or Yearly Pro to export watermark-free video reels with your custom logo.",
  reelDemoHint:
    "Demo preview includes a watermark. Export is available on all plans; upgrade to Pro for watermark-free reels with your agency branding.",
  reelSignInRequired: "Sign in to export video reels.",
  reelPaymentRequired: "Active subscription or credits required to export video reels.",
  headline: "Headline",
  summaryLabel: "Key highlights",
  locationLabel: "Neighborhood & location",
  socialInstagram: "Instagram",
  socialLinkedin: "LinkedIn",
  socialFacebook: "Facebook / WhatsApp",
  fullDescriptionLabel: "Full description",
  generationNotesLabel: "Additional Notes / Custom Details (Optional)",
  generationNotesPlaceholder:
    "e.g., Seller prefers quiet inquiries, recent roof renovation in 2023, special parking rules...",
  previewHighlightsPlaceholder: "One highlight per line",
  stagingDisclaimerLabel: "Staging disclaimer",
  addCustomNote: "+ Add Custom Note",
  customNoteTitlePlaceholder: "Note from Agent",
  customNoteBodyPlaceholder: "Custom paragraph or bullet points for the PDF…",
  removeCustomNote: "Remove note",
  defaultLegalDisclaimer:
    "All information is provided without guarantee. This exposé does not constitute a binding offer. Agent and agency details apply per local imprint requirements.",
  furnishingStatus: "Furnishing status",
  furnishingUnfurnished: "Unfurnished",
  furnishingPartially: "Partially furnished",
  furnishingFully: "Fully furnished",
  isStagedOrModel: "Photos show staging / model unit",
  isStagedOrModelHint:
    "Check if photos include virtual staging, sample decor, or a show apartment that is not delivered as shown.",
  stagingDisclaimerUnfurnished:
    "Note: Interior furniture shown is for staging/visualization purposes only; the unit is offered unfurnished.",
  stagingDisclaimerPartially:
    "Note: Interior furniture shown is for staging purposes only. The unit is delivered partially furnished with built-in fixtures as specified.",
  resetToBrandingDefaults: "Reset to account branding defaults",
  hideExactHouseNumber: "Hide exact house number in public text & PDF output",
  hideExactHouseNumberHint:
    "When checked, the street name (e.g. Otto-Suhr-Allee) remains visible, but the house number (e.g. 27) is hidden from generated texts and PDFs while still used internally for accurate transit & location AI detection.",
  targetMarketLabel: "Target market",
  targetMarketDach: "🇩🇪 DACH (DE / AT / CH)",
  targetMarketGlobal: "🌐 Global / Standard",
  userRoleLabel: "Your role",
  userRoleAgent: "Real estate agent / broker",
  userRolePrivateSeller: "Private seller / landlord",
  commissionLabel: "Commission / agent fee (Provision)",
  commissionPrivateSellerNote: "Commission-free (Direct from owner)",
  commissionFreeRent: "Commission-free for tenant",
  commissionRentCustom: "Custom tenant commission / note",
  commissionRentPlaceholder: "e.g. 2 cold rents + VAT",
  commissionFree: "Commission-free",
  commissionSaleCustom: "Buyer commission / note",
  commissionSalePlaceholder: "e.g. 3.57% incl. VAT",
  commissionAddCustomFee: "+ Add custom fee / note",
  commissionLandlordPaid: "Commission paid by landlord (Provision trägt Vermieter)",
  commissionBuyer: "Buyer commission",
  commissionBuyerPlaceholder: "e.g. 3.57% incl. VAT",
  globalPrice: "Price",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  agentCompanyAddress: "Company address (Impressum)",
  agentLicenseId: "License / § 34c GewO ID (optional)",
  fillDemoDachListing: "Fill demo DACH listing",
  dachForRent: "For rent (Miete)",
  dachForSale: "For sale (Kauf)",
  dachHouseFee: "HOA fee / Hausgeld (€/month)",
  dachDeposit: "Deposit (Kaution)",
  dachCertHeritage: "Not required / heritage protection (Denkmalschutz)",
  woodPellets: "Wood pellets (Holzpellets)",
  energyValueKwh: "Final energy demand / consumption (kWh/(m²·a))",
  globalEnergyExpand: "Advanced specifications (energy certificate)",
  dachConditionFirstOccupancy: "First occupancy (Erstbezug)",
  dachConditionFullyRenovated: "Fully renovated (Vollständig saniert)",
  dachConditionRenovated: "Renovated (Saniert)",
  dachConditionMaintained: "Well maintained (Gepflegt)",
  dachConditionNeedsRenovation: "Needs renovation (Renovierungsbedürftig)",
  quickAutofillTitle: "Speed up creation with auto-fill",
  quickAutofillSubtitle:
    "Upload an OpenImmo export or dictate details with your voice to pre-fill the form.",
  quickAutofillDropLabel: "Drop OpenImmo XML/ZIP here",
  quickAutofillBrowse: "Browse files",
  quickAutofillVoiceCta: "Dictate property details",
  quickAutofillVoiceHint: "Tap the microphone and describe the property — we'll fill matching fields.",
  quickAutofillTranscriptLabel: "Transcript preview",
  quickAutofillSuccessBadge: "✓ {count} fields auto-filled. Please verify below.",
  quickAutofillReset: "Clear form",
  quickAutofillResetHint: "Remove all prefilled listing fields and start over.",
  openImmoImportLabel: "📁 Import OpenImmo XML / ZIP (1-Click)",
  openImmoImportHint: "Drop an OpenImmo export (.xml or .zip) to auto-fill the form.",
  openImmoImporting: "Importing OpenImmo file…",
  openImmoImportSuccess: "Import successful! The form has been filled automatically.",
  openImmoImportError: "Could not import OpenImmo file. Please check the file and try again.",
  openImmoPickPropertyTitle: "Select a property to import",
  openImmoPickPropertyHint: "This file contains multiple listings. Choose one to fill the form.",
};

const de: Partial<FormCopy> = {
  ...en,
  exposeLanguage: "Exposé-Sprache",
  exposeLanguageHint:
    "Sprache für KI-generiertes Exposé, Social-Media-Texte und PDF-Inhalt.",
  sectionListingOverview: "Objektübersicht",
  sectionSpecsPricing: "Kernangaben & Preise",
  sectionBuildingEnergy: "Gebäude, Energie & Parken",
  sectionFeatures: "Ausstattung & Merkmale",
  sectionMedia: "Medien-Uploads",
  sectionAgentOutput: "Makler & Kontakt",
  workflowStep1Title: "Objektinfo",
  workflowStep2Title: "Details & Medien",
  workflowStep3Title: "Generieren & Export",
  workflowNext: "Weiter",
  workflowBack: "Zurück",
  workflowStep1Error:
    "Bitte Objektart wählen und Straße oder PLZ mit Ort eingeben, bevor Sie fortfahren.",
  previewOutputsLabel: "Vorschau-Ausgaben",
  photoMoveEarlier: "Nach vorne",
  photoMoveLater: "Nach hinten",
  advancedOutputOptions: "Erweitert / Ausgabeoptionen",
  includeStandardLegalDisclaimer:
    "Standard-Haftungsausschluss einbinden",
  includeStandardLegalDisclaimerHint:
    "Erscheint auf der PDF-Kontaktseite. Text vor dem Generieren anpassbar.",
  propertyType: "Objektart",
  propertyTypeApartment: "Wohnung",
  propertyTypeHouse: "Haus",
  propertyTypePenthouse: "Penthouse",
  propertyTypeCommercial: "Gewerbe",
  propertyTypeLand: "Grundstück",
  floorLevel: "Etage",
  floorLevelPlaceholder: "z. B. 2. OG",
  parking: "Stellplatz",
  parkingNone: "Keiner",
  parkingOutdoor: "Außenstellplatz",
  parkingGarage: "Garage",
  parkingUnderground: "Tiefgarage",
  parkingFee: "Stellplatzgebühr",
  condition: "Zustand",
  conditionFirstOccupancy: "Erstbezug",
  conditionModernized: "Modernisiert / saniert",
  conditionWellMaintained: "Gepflegt",
  conditionNeedsRenovation: "Renovierungsbedürftig",
  epcSection: "Energieausweis (GEG)",
  forRent: "Zur Miete",
  forSale: "Zum Kauf",
  transactionBadgeRent: "ZUR MIETE",
  transactionBadgeSale: "ZUM KAUF",
  basics: "Objektdaten",
  rentDetails: "Mietkonditionen",
  saleDetails: "Kauf & Rendite",
  netColdRent: "Nettokaltmiete",
  utilityCharges: "Nebenkosten",
  totalRent: "Warmmiete / Gesamtmiete",
  securityDeposit: "Kaution",
  availableFrom: "Verfügbar ab",
  minimumLeaseTerm: "Mindestmietdauer",
  petPolicy: "Haustierregelung",
  purchasePrice: "Kaufpreis",
  hoaFee: "Hausgeld",
  rentalYield: "Mietrendite / Ist-Miete",
  commissionTerms: "Provision / Maklerbedingungen",
  energySection: "Energieausweis (GEG)",
  energyExpand: "Energie & Gebäude",
  certificateType: "Ausweisart",
  certConsumption: "Verbrauchsausweis",
  certDemand: "Bedarfsausweis",
  certNa: "Nicht erforderlich",
  energyValue: "Energiekennwert (z. B. 120 kWh/m²a)",
  energyClass: "Effizienzklasse",
  heatingSource: "Wesentlicher Energieträger",
  constructionYear: "Baujahr",
  heatingInstallYear: "Baujahr Heizung",
  heatPump: "Wärmepumpe",
  districtHeating: "Fernwärme",
  gas: "Gas",
  oil: "Öl",
  electricity: "Strom",
  solar: "Solar",
  agentSection: "Kontakt & Rechtliches",
  agentName: "Ansprechpartner",
  agency: "Firma",
  phone: "Telefon",
  email: "E-Mail",
  legalDisclaimer: "Rechtlicher Hinweis / Impressum",
  floorPlan: "Grundriss",
  floorPlanHint: "Optional — PDF Seite 3",
  tabStory: "Exposé",
  tabLocation: "Lage",
  tabSocial: "Social Media",
  tabReel: "Video-Reel",
  exportReel: "MP4-Reel exportieren",
  exportingReel: "Reel wird gerendert…",
  reelHint:
    "15-Sekunden-Reel im Hochformat (1080×1920) für Instagram & TikTok. Export in Chrome oder Edge.",
  reelExportUnsupported:
    "Ihr Browser kann kein MP4-Reel exportieren. Bitte Chrome oder Edge am Desktop nutzen.",
  reelExportFailed: "Reel-Export fehlgeschlagen. Bitte erneut versuchen.",
  reelPerMonth: " / Monat",
  reelRoomsSuffix: "Zimmer",
  reelProOnly: "Video-Reels sind exklusiv für Monats- und Jahres-Pro-Tarife.",
  reelUpgradeBanner:
    "Upgrade auf Monats- oder Jahres-Pro für wasserzeichenfreie Video-Reels mit Ihrem Logo.",
  reelDemoHint:
    "Demo-Vorschau mit Wasserzeichen. Export auf allen Tarifen; Pro entfernt Wasserzeichen und fügt Agentur-Branding hinzu.",
  reelSignInRequired: "Melden Sie sich an, um Video-Reels zu exportieren.",
  reelPaymentRequired: "Aktives Abo oder Credits erforderlich für den Reel-Export.",
  headline: "Überschrift",
  summaryLabel: "Highlights",
  locationLabel: "Lage & Umgebung",
  fullDescriptionLabel: "Ausführliche Beschreibung",
  generationNotesLabel: "Zusätzliche Hinweise / Details (Optional)",
  generationNotesPlaceholder:
    "z. B. Verkäufer wünscht diskrete Anfragen, Dachsanierung 2023, besondere Stellplatzregelung …",
  previewHighlightsPlaceholder: "Ein Highlight pro Zeile",
  stagingDisclaimerLabel: "Staging-Hinweis",
  addCustomNote: "+ Eigene Notiz hinzufügen",
  customNoteTitlePlaceholder: "Hinweis vom Makler",
  customNoteBodyPlaceholder: "Eigener Absatz oder Stichpunkte für das PDF …",
  removeCustomNote: "Notiz entfernen",
  defaultLegalDisclaimer:
    "Alle Angaben ohne Gewähr. Dieses Exposé stellt kein bindendes Angebot dar. Angaben zu Makler und Firma gemäß Impressum.",
  furnishingStatus: "Möblierungsstatus",
  furnishingUnfurnished: "Unmöbliert",
  furnishingPartially: "Teilmöbliert",
  furnishingFully: "Voll möbliert",
  isStagedOrModel: "Fotos zeigen Staging / Musterwohnung",
  isStagedOrModelHint:
    "Aktivieren, wenn Fotos Virtual Staging, Beispiel-Dekor oder eine nicht übernommene Musterwohnung zeigen.",
  stagingDisclaimerUnfurnished:
    "Hinweis: Gezeigte Einrichtung dient nur Staging/Visualisierung; das Objekt wird unmöbliert übergeben.",
  stagingDisclaimerPartially:
    "Hinweis: Gezeigte Einrichtung dient nur Staging-Zwecken. Das Objekt wird teilmöbliert mit den angegebenen Einbauten übergeben.",
  resetToBrandingDefaults: "Auf Konto-Branding zurücksetzen",
  hideExactHouseNumber:
    "Genaue Hausnummer in Texten & PDF ausblenden",
  hideExactHouseNumberHint:
    "Wenn aktiviert, bleibt der Straßenname (z. B. Otto-Suhr-Allee) sichtbar, die Hausnummer (z. B. 27) wird jedoch in generierten Texten und PDFs ausgeblendet — intern weiter für präzise KI-Lage- und Verkehrsanalyse genutzt.",
  targetMarketLabel: "Zielmarkt",
  targetMarketDach: "🇩🇪 DACH (DE / AT / CH)",
  targetMarketGlobal: "🌐 Global / Standard",
  userRoleLabel: "Ihre Rolle",
  userRoleAgent: "Immobilienmakler / Broker",
  userRolePrivateSeller: "Privatverkäufer / Vermieter",
  commissionLabel: "Provision / Agenturgebühr",
  commissionPrivateSellerNote: "Provisionsfrei (Direkt vom Eigentümer)",
  commissionFreeRent: "Provisionsfrei für Mieter",
  commissionRentCustom: "Individuelle Mieterprovision / Hinweis",
  commissionRentPlaceholder: "z. B. 2 Nettokaltmieten zzgl. MwSt.",
  commissionFree: "Provisionsfrei",
  commissionSaleCustom: "Käuferprovision / Hinweis",
  commissionSalePlaceholder: "z. B. 3,57 % inkl. MwSt.",
  commissionAddCustomFee: "+ Individuelle Provision / Hinweis hinzufügen",
  commissionLandlordPaid: "Provision trägt Vermieter",
  commissionBuyer: "Käuferprovision",
  commissionBuyerPlaceholder: "z. B. 3,57 % inkl. MwSt.",
  globalPrice: "Preis",
  bedrooms: "Schlafzimmer",
  bathrooms: "Badezimmer",
  agentCompanyAddress: "Firmenadresse (Impressum)",
  agentLicenseId: "Erlaubnis / § 34c GewO (optional)",
  fillDemoDachListing: "Demo-DACH-Listing ausfüllen",
  dachForRent: "Zur Miete (Miete)",
  dachForSale: "Zum Kauf (Kauf)",
  dachHouseFee: "Hausgeld / Wohngeld (€/Monat)",
  dachDeposit: "Kaution",
  dachCertHeritage: "Nicht erforderlich / Denkmalschutz",
  woodPellets: "Holzpellets",
  energyValueKwh: "Endenergiebedarf / -verbrauch (kWh/(m²·a))",
  globalEnergyExpand: "Erweiterte Angaben (Energieausweis)",
  dachConditionFirstOccupancy: "Erstbezug",
  dachConditionFullyRenovated: "Vollständig saniert",
  dachConditionRenovated: "Saniert",
  dachConditionMaintained: "Gepflegt",
  dachConditionNeedsRenovation: "Renovierungsbedürftig",
  quickAutofillTitle: "Schneller starten mit Auto-Ausfüllen",
  quickAutofillSubtitle:
    "OpenImmo-Export hochladen oder Details per Sprache diktieren, um das Formular vorzubefüllen.",
  quickAutofillDropLabel: "OpenImmo XML/ZIP hier ablegen",
  quickAutofillBrowse: "Dateien durchsuchen",
  quickAutofillVoiceCta: "Objektdetails diktieren",
  quickAutofillVoiceHint:
    "Mikrofon tippen und Objekt beschreiben — passende Felder werden ausgefüllt.",
  quickAutofillTranscriptLabel: "Transkript-Vorschau",
  quickAutofillSuccessBadge: "✓ {count} Felder automatisch ausgefüllt. Bitte unten prüfen.",
  quickAutofillReset: "Formular leeren",
  quickAutofillResetHint: "Alle ausgefüllten Objektfelder entfernen und neu beginnen.",
  openImmoImportLabel: "📁 OpenImmo XML / ZIP importieren (1-Klick)",
  openImmoImportHint: "OpenImmo-Export (.xml oder .zip) ablegen, um das Formular automatisch auszufüllen.",
  openImmoImporting: "OpenImmo-Datei wird importiert…",
  openImmoImportSuccess: "Import erfolgreich! Formular wurde automatisch ausgefüllt.",
  openImmoImportError: "OpenImmo-Import fehlgeschlagen. Bitte Datei prüfen und erneut versuchen.",
  openImmoPickPropertyTitle: "Objekt zum Import auswählen",
  openImmoPickPropertyHint: "Diese Datei enthält mehrere Objekte. Wählen Sie eines aus, um das Formular auszufüllen.",
};

const fr: Partial<FormCopy> = {
  exposeLanguage: "Langue de l'exposé",
  exposeLanguageHint:
    "Langue du texte d'exposé, des légendes sociales et du contenu PDF générés par l'IA.",
  sectionListingOverview: "Aperçu du bien",
  sectionSpecsPricing: "Caractéristiques clés & tarification",
  sectionBuildingEnergy: "Bâtiment, énergie & stationnement",
  sectionFeatures: "Équipements & atouts",
  sectionMedia: "Téléversement de médias",
  sectionAgentOutput: "Agent & paramètres de sortie",
  propertyType: "Type de bien",
  propertyTypeApartment: "Appartement",
  propertyTypeHouse: "Maison",
  propertyTypePenthouse: "Penthouse",
  propertyTypeCommercial: "Local commercial",
  propertyTypeLand: "Terrain",
  floorLevel: "Étage",
  floorLevelPlaceholder: "ex. 2e étage",
  parking: "Stationnement",
  parkingNone: "Aucun",
  parkingOutdoor: "Extérieur",
  parkingGarage: "Garage",
  parkingUnderground: "Souterrain",
  parkingFee: "Frais de parking (facultatif)",
  condition: "État",
  conditionFirstOccupancy: "Première occupation",
  conditionModernized: "Rénové / modernisé",
  conditionWellMaintained: "Bien entretenu",
  conditionNeedsRenovation: "Travaux à prévoir",
  epcSection: "Diagnostic de performance énergétique (DPE)",
  forRent: "À louer",
  forSale: "À vendre",
  transactionBadgeRent: "À LOUER",
  transactionBadgeSale: "À VENDRE",
  basics: "Données principales",
  rentDetails: "Conditions de location",
  saleDetails: "Achat & investissement",
  netColdRent: "Loyer net (charges non comprises)",
  utilityCharges: "Charges locatives",
  totalRent: "Loyer total",
  securityDeposit: "Dépôt de garantie",
  availableFrom: "Disponible à partir du",
  minimumLeaseTerm: "Durée minimale du bail",
  petPolicy: "Politique animaux",
  purchasePrice: "Prix d'achat",
  hoaFee: "Charges de copropriété",
  rentalYield: "Rendement locatif / revenus actuels",
  commissionTerms: "Honoraires / conditions de mandat",
  energySection: "Diagnostic de performance énergétique (DPE)",
  energyExpand: "Énergie & bâtiment",
  certificateType: "Type de certificat",
  certConsumption: "Certificat consommation",
  certDemand: "Certificat demande",
  certNa: "Non applicable",
  energyValue: "Valeur énergétique (ex. 120 kWh/m²a)",
  energyClass: "Classe énergétique",
  heatingSource: "Source de chauffage",
  constructionYear: "Année de construction",
  heatingInstallYear: "Année d'installation du chauffage",
  heatPump: "Pompe à chaleur",
  districtHeating: "Chauffage urbain",
  gas: "Gaz",
  oil: "Fioul",
  electricity: "Électricité",
  solar: "Solaire",
  agentSection: "Contact & mentions légales",
  agentName: "Nom de l'agent",
  agency: "Agence",
  phone: "Téléphone",
  email: "E-mail",
  legalDisclaimer: "Mentions légales / disclaimer",
  floorPlan: "Plan d'étage",
  floorPlanHint: "Facultatif — page 3 du PDF",
  tabStory: "Description",
  tabLocation: "Emplacement",
  tabSocial: "Réseaux sociaux",
  tabReel: "Reel vidéo",
  exportReel: "Exporter le reel MP4",
  exportingReel: "Rendu du reel…",
  reelHint:
    "Reel vertical 15 s (1080×1920) pour Instagram et TikTok. Export via Chrome ou Edge.",
  reelExportUnsupported:
    "Votre navigateur ne peut pas exporter de reel MP4. Essayez Chrome ou Edge.",
  reelExportFailed: "Échec de l'export du reel. Réessayez.",
  reelPerMonth: " / mois",
  reelRoomsSuffix: "pièces",
  reelProOnly: "Les reels vidéo sont réservés aux offres Pro mensuelles et annuelles.",
  reelUpgradeBanner:
    "Passez au Pro mensuel ou annuel pour exporter des reels sans filigrane avec votre logo.",
  reelDemoHint:
    "Aperçu démo avec filigrane. Export sur tous les forfaits ; le Pro supprime le filigrane et ajoute votre branding.",
  reelSignInRequired: "Connectez-vous pour exporter des reels vidéo.",
  reelPaymentRequired: "Abonnement actif ou crédits requis pour exporter des reels.",
  headline: "Titre",
  summaryLabel: "Points clés",
  locationLabel: "Quartier & localisation",
  socialInstagram: "Instagram",
  socialLinkedin: "LinkedIn",
  socialFacebook: "Facebook / WhatsApp",
  fullDescriptionLabel: "Description complète",
  defaultLegalDisclaimer:
    "Informations sans garantie. Cet exposé ne constitue pas une offre ferme. Coordonnées agent et agence selon mentions légales locales.",
  furnishingStatus: "Statut du meublé",
  furnishingUnfurnished: "Non meublé",
  furnishingPartially: "Partiellement meublé",
  furnishingFully: "Entièrement meublé",
  isStagedOrModel: "Photos avec staging / logement témoin",
  isStagedOrModelHint:
    "Cochez si les photos incluent du staging virtuel, une déco d'exemple ou un logement témoin non livré tel quel.",
  stagingDisclaimerUnfurnished:
    "Note : Le mobilier visible sert uniquement au staging/visualisation ; le bien est proposé non meublé.",
  stagingDisclaimerPartially:
    "Note : Le mobilier visible sert uniquement au staging. Le bien est livré partiellement meublé avec les équipements intégrés indiqués.",
};

const es: Partial<FormCopy> = {
  exposeLanguage: "Idioma del exposé",
  exposeLanguageHint:
    "Idioma del exposé, captions y contenido PDF generados por IA.",
  sectionListingOverview: "Resumen del inmueble",
  sectionSpecsPricing: "Datos clave y precio",
  sectionBuildingEnergy: "Edificio, energía y aparcamiento",
  sectionFeatures: "Características y equipamiento",
  sectionMedia: "Subida de medios",
  sectionAgentOutput: "Agente y configuración de salida",
  propertyType: "Tipo de inmueble",
  propertyTypeApartment: "Piso",
  propertyTypeHouse: "Casa",
  propertyTypePenthouse: "Ático",
  propertyTypeCommercial: "Local comercial",
  propertyTypeLand: "Terreno",
  floorLevel: "Planta",
  floorLevelPlaceholder: "p. ej. 2.ª planta",
  parking: "Aparcamiento",
  parkingNone: "Ninguno",
  parkingOutdoor: "Exterior",
  parkingGarage: "Garaje",
  parkingUnderground: "Subterráneo",
  parkingFee: "Tarifa aparcamiento (opcional)",
  condition: "Estado",
  conditionFirstOccupancy: "Primera ocupación",
  conditionModernized: "Modernizado",
  conditionWellMaintained: "Bien conservado",
  conditionNeedsRenovation: "Necesita reforma",
  epcSection: "Certificado energético",
  forRent: "Alquiler",
  forSale: "Venta",
  transactionBadgeRent: "EN ALQUILER",
  transactionBadgeSale: "EN VENTA",
  basics: "Datos principales",
  rentDetails: "Condiciones de alquiler",
  saleDetails: "Compra e inversión",
  netColdRent: "Alquiler neto (sin gastos)",
  utilityCharges: "Gastos de comunidad / servicios",
  totalRent: "Alquiler total",
  securityDeposit: "Fianza",
  availableFrom: "Disponible desde",
  minimumLeaseTerm: "Duración mínima del contrato",
  petPolicy: "Política de mascotas",
  purchasePrice: "Precio de compra",
  hoaFee: "Gastos de comunidad (propiedad)",
  rentalYield: "Rentabilidad / ingresos por alquiler",
  commissionTerms: "Comisión / condiciones de agencia",
  energySection: "Certificado de eficiencia energética (CEE)",
  energyExpand: "Energía y edificio",
  certificateType: "Tipo de certificado",
  certConsumption: "Certificado de consumo",
  certDemand: "Certificado de demanda",
  certNa: "No aplica",
  energyValue: "Valor energético (ej. 120 kWh/m²a)",
  energyClass: "Clase energética",
  heatingSource: "Fuente de calefacción",
  constructionYear: "Año de construcción",
  heatingInstallYear: "Año de instalación de calefacción",
  heatPump: "Bomba de calor",
  districtHeating: "Calefacción urbana",
  gas: "Gas",
  oil: "Gasóleo",
  electricity: "Electricidad",
  solar: "Solar",
  agentSection: "Agente y aviso legal",
  agentName: "Nombre del agente",
  agency: "Agencia",
  phone: "Teléfono",
  email: "Correo electrónico",
  legalDisclaimer: "Aviso legal / texto de exención",
  floorPlan: "Plano de planta",
  floorPlanHint: "Opcional — página 3 del PDF",
  tabStory: "Descripción",
  tabLocation: "Ubicación",
  tabSocial: "Redes sociales",
  tabReel: "Reel de vídeo",
  exportReel: "Exportar reel MP4",
  exportingReel: "Renderizando reel…",
  reelHint:
    "Reel vertical de 15 s (1080×1920) para Instagram y TikTok. Exportar en Chrome o Edge.",
  reelExportUnsupported:
    "Su navegador no puede exportar reels MP4. Pruebe Chrome o Edge.",
  reelExportFailed: "Error al exportar el reel. Inténtelo de nuevo.",
  reelPerMonth: " / mes",
  reelRoomsSuffix: "habitaciones",
  reelProOnly: "Los reels de vídeo son exclusivos de los planes Pro mensual y anual.",
  reelUpgradeBanner:
    "Pase a Pro mensual o anual para exportar reels sin marca de agua con su logo.",
  reelDemoHint:
    "La vista previa demo incluye marca de agua. La exportación está disponible en todos los planes; actualice a Pro para reels sin marca de agua con branding de agencia.",
  reelSignInRequired: "Inicie sesión para exportar reels de vídeo.",
  reelPaymentRequired: "Se requiere suscripción activa o créditos para exportar reels.",
  headline: "Titular",
  summaryLabel: "Puntos destacados",
  locationLabel: "Barrio y entorno",
  socialInstagram: "Instagram",
  socialLinkedin: "LinkedIn",
  socialFacebook: "Facebook / WhatsApp",
  fullDescriptionLabel: "Descripción completa",
  defaultLegalDisclaimer:
    "Información sin garantía. Este exposé no constituye una oferta vinculante. Datos de agente y agencia según requisitos legales locales.",
};

const it: Partial<FormCopy> = {
  exposeLanguage: "Lingua dell'exposé",
  exposeLanguageHint:
    "Lingua di testi exposé, caption social e PDF generati dall'IA.",
  sectionListingOverview: "Panoramica immobile",
  sectionSpecsPricing: "Dati principali e prezzo",
  sectionBuildingEnergy: "Edificio, energia e parcheggio",
  sectionFeatures: "Caratteristiche e dotazioni",
  sectionMedia: "Caricamento media",
  sectionAgentOutput: "Agente e impostazioni output",
  propertyType: "Tipo di immobile",
  propertyTypeApartment: "Appartamento",
  propertyTypeHouse: "Casa",
  propertyTypePenthouse: "Attico",
  propertyTypeCommercial: "Commerciale",
  propertyTypeLand: "Terreno",
  floorLevel: "Piano",
  floorLevelPlaceholder: "es. 2° piano",
  parking: "Parcheggio",
  parkingNone: "Nessuno",
  parkingOutdoor: "Esterno",
  parkingGarage: "Garage",
  parkingUnderground: "Interrato",
  parkingFee: "Costo parcheggio (opzionale)",
  condition: "Stato",
  conditionFirstOccupancy: "Prima occupazione",
  conditionModernized: "Ristrutturato",
  conditionWellMaintained: "Ben mantenuto",
  conditionNeedsRenovation: "Da ristrutturare",
  epcSection: "Certificazione energetica",
  forRent: "Affitto",
  forSale: "Vendita",
  transactionBadgeRent: "IN AFFITTO",
  transactionBadgeSale: "IN VENDITA",
  basics: "Dati principali",
  rentDetails: "Condizioni di affitto",
  saleDetails: "Acquisto e investimento",
  netColdRent: "Canone netto (spese escluse)",
  utilityCharges: "Spese condominiali / utenze",
  totalRent: "Canone totale",
  securityDeposit: "Deposito cauzionale",
  availableFrom: "Disponibile dal",
  minimumLeaseTerm: "Durata minima del contratto",
  petPolicy: "Politica animali domestici",
  purchasePrice: "Prezzo di acquisto",
  hoaFee: "Spese condominiali mensili",
  rentalYield: "Rendimento / reddito da locazione",
  commissionTerms: "Provvigione / condizioni agenzia",
  energySection: "Certificazione energetica (APE)",
  energyExpand: "Energia e immobile",
  certificateType: "Tipo certificato",
  certConsumption: "Certificato consumo",
  certDemand: "Certificato fabbisogno",
  certNa: "Non applicabile",
  energyValue: "Valore energetico (es. 120 kWh/m²a)",
  energyClass: "Classe energetica",
  heatingSource: "Fonte di riscaldamento",
  constructionYear: "Anno di costruzione",
  heatingInstallYear: "Anno installazione riscaldamento",
  heatPump: "Pompa di calore",
  districtHeating: "Teleriscaldamento",
  gas: "Gas",
  oil: "Gasolio",
  electricity: "Elettricità",
  solar: "Solare",
  agentSection: "Agente e note legali",
  agentName: "Nome agente",
  agency: "Agenzia",
  phone: "Telefono",
  email: "E-mail",
  legalDisclaimer: "Disclaimer legale / imprint",
  floorPlan: "Planimetria",
  floorPlanHint: "Facoltativo — pagina 3 del PDF",
  tabStory: "Descrizione",
  tabLocation: "Posizione",
  tabSocial: "Social media",
  tabReel: "Reel video",
  exportReel: "Esporta reel MP4",
  exportingReel: "Rendering reel…",
  reelHint:
    "Reel verticale 15 s (1080×1920) per Instagram e TikTok. Esporta con Chrome o Edge.",
  reelExportUnsupported:
    "Il browser non può esportare reel MP4. Prova Chrome o Edge.",
  reelExportFailed: "Esportazione reel non riuscita. Riprova.",
  reelPerMonth: " / mese",
  reelRoomsSuffix: "locali",
  reelProOnly: "I reel video sono esclusivi dei piani Pro mensili e annuali.",
  reelUpgradeBanner:
    "Passa a Pro mensile o annuale per esportare reel senza watermark con il tuo logo.",
  reelDemoHint:
    "L'anteprima demo include un watermark. L'esportazione è disponibile su tutti i piani; passa a Pro per reel senza watermark con branding agenzia.",
  reelSignInRequired: "Accedi per esportare reel video.",
  reelPaymentRequired: "Abbonamento attivo o crediti richiesti per esportare reel.",
  headline: "Titolo",
  summaryLabel: "Punti salienti",
  locationLabel: "Quartiere e zona",
  socialInstagram: "Instagram",
  socialLinkedin: "LinkedIn",
  socialFacebook: "Facebook / WhatsApp",
  fullDescriptionLabel: "Descrizione completa",
  defaultLegalDisclaimer:
    "Informazioni senza garanzia. Questo exposé non costituisce un'offerta vincolante. Dati agente e agenzia secondo imprint locale.",
};

const nl: Partial<FormCopy> = {
  exposeLanguage: "Exposé-taal",
  exposeLanguageHint:
    "Taal voor AI-gegenereerde exposétekst, social captions en PDF-inhoud.",
  sectionListingOverview: "Woningoverzicht",
  sectionSpecsPricing: "Kernspecificaties & prijs",
  sectionBuildingEnergy: "Gebouw, energie & parkeren",
  sectionFeatures: "Kenmerken & voorzieningen",
  sectionMedia: "Media-uploads",
  sectionAgentOutput: "Makelaar & outputinstellingen",
  propertyType: "Woningtype",
  propertyTypeApartment: "Appartement",
  propertyTypeHouse: "Huis",
  propertyTypePenthouse: "Penthouse",
  propertyTypeCommercial: "Commercieel",
  propertyTypeLand: "Grond",
  floorLevel: "Verdieping",
  floorLevelPlaceholder: "bijv. 2e verdieping",
  parking: "Parkeren",
  parkingNone: "Geen",
  parkingOutdoor: "Buiten",
  parkingGarage: "Garage",
  parkingUnderground: "Ondergronds",
  parkingFee: "Parkeerkosten (optioneel)",
  condition: "Staat",
  conditionFirstOccupancy: "Eerste bewoning",
  conditionModernized: "Gemoderniseerd",
  conditionWellMaintained: "Goed onderhouden",
  conditionNeedsRenovation: "Renovatie nodig",
  epcSection: "Energiecertificaat",
  forRent: "Huur",
  forSale: "Koop",
  transactionBadgeRent: "TE HUUR",
  transactionBadgeSale: "TE KOOP",
  basics: "Kerengegevens",
  rentDetails: "Huurvoorwaarden",
  saleDetails: "Koop & investering",
  netColdRent: "Netto kale huur",
  utilityCharges: "Servicekosten",
  totalRent: "Totale huur",
  securityDeposit: "Waarborgsom",
  availableFrom: "Beschikbaar vanaf",
  minimumLeaseTerm: "Minimale huurtermijn",
  petPolicy: "Huisdierenbeleid",
  purchasePrice: "Koopprijs",
  hoaFee: "VvE / maandelijkse servicekosten",
  rentalYield: "Rendement / huidige huurinkomsten",
  commissionTerms: "Courtage / makelaarsvoorwaarden",
  energySection: "Energielabel (EPC)",
  energyExpand: "Energie & gebouw",
  certificateType: "Type certificaat",
  certConsumption: "Verbruikscertificaat",
  certDemand: "Vraagcertificaat",
  certNa: "Niet van toepassing",
  energyValue: "Energiewaarde (bijv. 120 kWh/m²a)",
  energyClass: "Energielabel",
  heatingSource: "Warmtebron",
  constructionYear: "Bouwjaar",
  heatingInstallYear: "Installatiejaar verwarming",
  heatPump: "Warmtepomp",
  districtHeating: "Stadsverwarming",
  gas: "Gas",
  oil: "Olie",
  electricity: "Elektriciteit",
  solar: "Zonne-energie",
  agentSection: "Makelaar & juridisch",
  agentName: "Naam makelaar",
  agency: "Kantoor",
  phone: "Telefoon",
  email: "E-mail",
  legalDisclaimer: "Juridische disclaimer / imprint",
  floorPlan: "Plattegrond",
  floorPlanHint: "Optioneel — PDF pagina 3",
  tabStory: "Verhaal",
  tabLocation: "Locatie",
  tabSocial: "Social media",
  tabReel: "Video-reel",
  exportReel: "MP4-reel exporteren",
  exportingReel: "Reel renderen…",
  reelHint:
    "15 seconden verticaal reel (1080×1920) voor Instagram en TikTok. Export in Chrome of Edge.",
  reelExportUnsupported:
    "Uw browser kan geen MP4-reels exporteren. Probeer Chrome of Edge.",
  reelExportFailed: "Reel-export mislukt. Probeer opnieuw.",
  reelPerMonth: " / maand",
  reelRoomsSuffix: "kamers",
  reelProOnly: "Video-reels zijn exclusief voor maandelijkse en jaarlijkse Pro-abonnementen.",
  reelUpgradeBanner:
    "Upgrade naar maandelijks of jaarlijks Pro om watermerkvrije reels met uw logo te exporteren.",
  reelDemoHint:
    "Demovoorbeeld bevat een watermerk. Export is beschikbaar op alle plannen; upgrade naar Pro voor watermerkvrije reels met makelaarsbranding.",
  reelSignInRequired: "Log in om video-reels te exporteren.",
  reelPaymentRequired: "Actief abonnement of credits vereist om reels te exporteren.",
  headline: "Kop",
  summaryLabel: "Belangrijkste punten",
  locationLabel: "Buurt & ligging",
  socialInstagram: "Instagram",
  socialLinkedin: "LinkedIn",
  socialFacebook: "Facebook / WhatsApp",
  fullDescriptionLabel: "Volledige beschrijving",
  defaultLegalDisclaimer:
    "Informatie zonder garantie. Dit exposé is geen bindend aanbod. Makelaar- en kantoorgegevens volgens lokaal imprint.",
};


const pl: Partial<FormCopy> = {
  exposeLanguage: "Język exposé",
  exposeLanguageHint:
    "Język wygenerowanego exposé, opisów social media i treści PDF.",
  sectionListingOverview: "Przegląd oferty",
  sectionSpecsPricing: "Kluczowe parametry i cena",
  sectionBuildingEnergy: "Budynek, energia i parking",
  sectionFeatures: "Wyposażenie i udogodnienia",
  sectionMedia: "Przesyłanie mediów",
  sectionAgentOutput: "Pośrednik i ustawienia wyjścia",
  propertyType: "Typ nieruchomości",
  propertyTypeApartment: "Mieszkanie",
  propertyTypeHouse: "Dom",
  propertyTypePenthouse: "Penthouse",
  propertyTypeCommercial: "Lokal użytkowy",
  propertyTypeLand: "Działka",
  floorLevel: "Piętro",
  floorLevelPlaceholder: "np. 2. piętro",
  parking: "Parking",
  parkingNone: "Brak",
  parkingOutdoor: "Na zewnątrz",
  parkingGarage: "Garaż",
  parkingUnderground: "Podziemny",
  parkingFee: "Opłata parkingowa (opcjonalnie)",
  condition: "Stan",
  conditionFirstOccupancy: "Pierwsze zamieszkanie",
  conditionModernized: "Po modernizacji",
  conditionWellMaintained: "Dobrze utrzymany",
  conditionNeedsRenovation: "Do remontu",
  epcSection: "Certyfikat energetyczny",
  forRent: "Wynajem",
  forSale: "Sprzedaż",
  transactionBadgeRent: "DO WYNAJĘCIA",
  transactionBadgeSale: "NA SPRZEDAŻ",
  basics: "Dane podstawowe",
  rentDetails: "Warunki najmu",
  saleDetails: "Zakup i inwestycja",
  netColdRent: "Czynsz netto (bez mediów)",
  utilityCharges: "Opłaty eksploatacyjne / media",
  totalRent: "Czynsz całkowity",
  securityDeposit: "Kaucja",
  availableFrom: "Dostępne od",
  minimumLeaseTerm: "Minimalny okres najmu",
  petPolicy: "Zasady dot. zwierząt",
  purchasePrice: "Cena zakupu",
  hoaFee: "Czynsz administracyjny / opłaty wspólnoty",
  rentalYield: "Stopa zwrotu / obecny dochód z najmu",
  commissionTerms: "Prowizja / warunki pośrednika",
  energySection: "Świadectwo charakterystyki energetycznej",
  energyExpand: "Energia i budynek",
  certificateType: "Rodzaj świadectwa",
  certConsumption: "Świadectwo zużycia energii",
  certDemand: "Świadectwo zapotrzebowania",
  certNa: "Nie dotyczy",
  energyValue: "Wartość energetyczna (np. 120 kWh/m²a)",
  energyClass: "Klasa energetyczna",
  heatingSource: "Źródło ogrzewania",
  constructionYear: "Rok budowy",
  heatingInstallYear: "Rok instalacji ogrzewania",
  heatPump: "Pompa ciepła",
  districtHeating: "Ciepło sieciowe",
  gas: "Gaz",
  oil: "Olej",
  electricity: "Prąd",
  solar: "Energia słoneczna",
  agentSection: "Pośrednik i informacje prawne",
  agentName: "Imię i nazwisko pośrednika",
  agency: "Biuro nieruchomości",
  phone: "Telefon",
  email: "E-mail",
  legalDisclaimer: "Klauzula prawna / imprint",
  floorPlan: "Rzut piętra",
  floorPlanHint: "Opcjonalnie — strona 3 PDF",
  tabStory: "Opis",
  tabLocation: "Lokalizacja",
  tabSocial: "Media społecznościowe",
  tabReel: "Wideo reel",
  exportReel: "Eksportuj reel MP4",
  exportingReel: "Renderowanie reela…",
  reelHint:
    "15-sekundowy pionowy reel (1080×1920) na Instagram i TikTok. Eksport w Chrome lub Edge.",
  reelExportUnsupported:
    "Twoja przeglądarka nie obsługuje eksportu reel MP4. Użyj Chrome lub Edge.",
  reelExportFailed: "Eksport reela nie powiódł się. Spróbuj ponownie.",
  reelPerMonth: " / mies.",
  reelRoomsSuffix: "pokoje",
  reelProOnly: "Reels wideo są dostępne tylko w planach Pro miesięcznym i rocznym.",
  reelUpgradeBanner:
    "Przejdź na Pro miesięczny lub roczny, aby eksportować reels bez znaku wodnego z własnym logo.",
  reelDemoHint:
    "Podgląd demo zawiera znak wodny. Eksport dostępny we wszystkich planach; ulepsz do Pro dla reels bez znaku wodnego z brandingiem agencji.",
  reelSignInRequired: "Zaloguj się, aby eksportować reels wideo.",
  reelPaymentRequired: "Aktywna subskrypcja lub kredyty wymagane do eksportu reels.",
  headline: "Nagłówek",
  summaryLabel: "Najważniejsze atuty",
  locationLabel: "Okolica i lokalizacja",
  socialInstagram: "Instagram",
  socialLinkedin: "LinkedIn",
  socialFacebook: "Facebook / WhatsApp",
  fullDescriptionLabel: "Pełny opis",
  defaultLegalDisclaimer:
    "Informacje bez gwarancji. Niniejsze exposé nie stanowi wiążącej oferty. Dane pośrednika i biura zgodnie z lokalnymi wymogami.",
};

export const formTranslations: Record<UiLocale, Partial<FormCopy>> & { en: FormCopy } = {
  en,
  de,
  fr,
  es,
  it,
  nl,
  pl,
};

export function getFormCopy(locale: UiLocale): FormCopy {
  return { ...en, ...(formTranslations[locale] ?? {}) };
}

const ALL_DEFAULT_LEGAL_DISCLAIMERS = new Set([
  ...Object.values(formTranslations).map((t) => t.defaultLegalDisclaimer),
  DACH_LEGAL_DISCLAIMER,
]);

/** True if the text is still one of the built-in locale defaults (not user-written). */
export function isKnownDefaultLegalDisclaimer(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return ALL_DEFAULT_LEGAL_DISCLAIMERS.has(trimmed);
}

export function resolveLegalDisclaimer(
  text: string,
  locale: UiLocale,
): string {
  if (isKnownDefaultLegalDisclaimer(text)) {
    return getFormCopy(locale).defaultLegalDisclaimer;
  }
  return text.trim();
}
