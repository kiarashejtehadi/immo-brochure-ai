import type { UiLocale } from "@/lib/i18n";
import { interpolate } from "@/lib/i18n-billing";

export type BrandingCopy = {
  settingsTitle: string;
  settingsSubtitle: string;
  trialCreditsLeft: string;
  signInToManage: string;
  loadFailed: string;
  saved: string;
  saveFailed: string;
  logoUploaded: string;
  uploadFailed: string;
  loadingBranding: string;
  agencyLogo: string;
  agencyLogoAlt: string;
  noLogo: string;
  uploadLogo: string;
  uploadLogoPro: string;
  uploading: string;
  brandColor: string;
  agencyName: string;
  brokerName: string;
  phone: string;
  contactEmail: string;
  website: string;
  pdfWatermark: string;
  pdfWatermarkClean: string;
  pdfWatermarkTrial: string;
  viewPlans: string;
  saveContactBranding: string;
  saving: string;
};

const en: BrandingCopy = {
  settingsTitle: "Branding settings",
  settingsSubtitle:
    "Custom logo and colors apply to PDF brochures on Monthly & Yearly Pro plans.",
  trialCreditsLeft: "You have {count} free trial credits left (watermarked PDFs).",
  signInToManage: "Sign in to manage branding.",
  loadFailed: "Could not load branding.",
  saved: "Saved.",
  saveFailed: "Save failed.",
  logoUploaded: "Logo uploaded.",
  uploadFailed: "Upload failed.",
  loadingBranding: "Loading branding…",
  agencyLogo: "Agency logo",
  agencyLogoAlt: "Agency logo",
  noLogo: "No logo",
  uploadLogo: "Upload logo",
  uploadLogoPro: "Upload logo (Pro)",
  uploading: "Uploading…",
  brandColor: "Brand color",
  agencyName: "Agency name",
  brokerName: "Broker name",
  phone: "Phone",
  contactEmail: "Contact email",
  website: "Website",
  pdfWatermark: "PDF watermark",
  pdfWatermarkClean: "Your PDF exports are watermark-free.",
  pdfWatermarkTrial:
    "Trial PDFs include a watermark. Buy a credit pack or subscribe to export clean brochures.",
  viewPlans: "View plans",
  saveContactBranding: "Save contact & branding",
  saving: "Saving…",
};

const de: Partial<BrandingCopy> = {
  settingsTitle: "Branding-Einstellungen",
  settingsSubtitle:
    "Individuelles Logo und Farben gelten für PDF-Broschüren mit Monats- & Jahres-Pro-Tarif.",
  trialCreditsLeft: "Sie haben noch {count} kostenlose Test-Credits (PDFs mit Wasserzeichen).",
  signInToManage: "Melden Sie sich an, um Branding zu verwalten.",
  loadFailed: "Branding konnte nicht geladen werden.",
  saved: "Gespeichert.",
  saveFailed: "Speichern fehlgeschlagen.",
  logoUploaded: "Logo hochgeladen.",
  uploadFailed: "Upload fehlgeschlagen.",
  loadingBranding: "Branding wird geladen…",
  agencyLogo: "Agentur-Logo",
  agencyLogoAlt: "Agentur-Logo",
  noLogo: "Kein Logo",
  uploadLogo: "Logo hochladen",
  uploadLogoPro: "Logo hochladen (Pro)",
  uploading: "Wird hochgeladen…",
  brandColor: "Markenfarbe",
  agencyName: "Agenturname",
  brokerName: "Maklername",
  phone: "Telefon",
  contactEmail: "Kontakt-E-Mail",
  website: "Website",
  pdfWatermark: "PDF-Wasserzeichen",
  pdfWatermarkClean: "Ihre PDF-Exporte sind ohne Wasserzeichen.",
  pdfWatermarkTrial:
    "Test-PDFs enthalten ein Wasserzeichen. Credit-Paket oder Abo für saubere Broschüren.",
  viewPlans: "Tarife ansehen",
  saveContactBranding: "Kontakt & Branding speichern",
  saving: "Wird gespeichert…",
};

const fr: Partial<BrandingCopy> = {
  settingsTitle: "Paramètres de branding",
  settingsSubtitle:
    "Logo et couleurs personnalisés pour les brochures PDF avec offres Pro mensuelle et annuelle.",
  trialCreditsLeft:
    "Il vous reste {count} crédits d'essai gratuits (PDF avec filigrane).",
  signInToManage: "Connectez-vous pour gérer le branding.",
  loadFailed: "Impossible de charger le branding.",
  saved: "Enregistré.",
  saveFailed: "Échec de l'enregistrement.",
  logoUploaded: "Logo téléversé.",
  uploadFailed: "Échec du téléversement.",
  loadingBranding: "Chargement du branding…",
  agencyLogo: "Logo agence",
  agencyLogoAlt: "Logo agence",
  noLogo: "Aucun logo",
  uploadLogo: "Téléverser le logo",
  uploadLogoPro: "Téléverser le logo (Pro)",
  uploading: "Téléversement…",
  brandColor: "Couleur de marque",
  agencyName: "Nom de l'agence",
  brokerName: "Nom du courtier",
  phone: "Téléphone",
  contactEmail: "E-mail de contact",
  website: "Site web",
  pdfWatermark: "Filigrane PDF",
  pdfWatermarkClean: "Vos exports PDF sont sans filigrane.",
  pdfWatermarkTrial:
    "Les PDF d'essai incluent un filigrane. Achetez un pack ou abonnez-vous pour des brochures propres.",
  viewPlans: "Voir les offres",
  saveContactBranding: "Enregistrer contact & branding",
  saving: "Enregistrement…",
};

const es: Partial<BrandingCopy> = {
  settingsTitle: "Configuración de branding",
  settingsSubtitle:
    "Logo y colores personalizados en PDF con planes Pro mensual y anual.",
  trialCreditsLeft:
    "Le quedan {count} créditos de prueba gratuitos (PDF con marca de agua).",
  signInToManage: "Inicie sesión para gestionar el branding.",
  loadFailed: "No se pudo cargar el branding.",
  saved: "Guardado.",
  saveFailed: "Error al guardar.",
  logoUploaded: "Logo subido.",
  uploadFailed: "Error al subir.",
  loadingBranding: "Cargando branding…",
  agencyLogo: "Logo de agencia",
  agencyLogoAlt: "Logo de agencia",
  noLogo: "Sin logo",
  uploadLogo: "Subir logo",
  uploadLogoPro: "Subir logo (Pro)",
  uploading: "Subiendo…",
  brandColor: "Color de marca",
  agencyName: "Nombre de agencia",
  brokerName: "Nombre del agente",
  phone: "Teléfono",
  contactEmail: "Correo de contacto",
  website: "Sitio web",
  pdfWatermark: "Marca de agua PDF",
  pdfWatermarkClean: "Sus exportaciones PDF están sin marca de agua.",
  pdfWatermarkTrial:
    "Los PDF de prueba incluyen marca de agua. Compre un pack o suscríbase para brochures limpios.",
  viewPlans: "Ver planes",
  saveContactBranding: "Guardar contacto y branding",
  saving: "Guardando…",
};

const it: Partial<BrandingCopy> = {
  settingsTitle: "Impostazioni branding",
  settingsSubtitle:
    "Logo e colori personalizzati per brochure PDF con piani Pro mensili e annuali.",
  trialCreditsLeft:
    "Hai {count} crediti di prova gratuiti rimanenti (PDF con watermark).",
  signInToManage: "Accedi per gestire il branding.",
  loadFailed: "Impossibile caricare il branding.",
  saved: "Salvato.",
  saveFailed: "Salvataggio non riuscito.",
  logoUploaded: "Logo caricato.",
  uploadFailed: "Caricamento non riuscito.",
  loadingBranding: "Caricamento branding…",
  agencyLogo: "Logo agenzia",
  agencyLogoAlt: "Logo agenzia",
  noLogo: "Nessun logo",
  uploadLogo: "Carica logo",
  uploadLogoPro: "Carica logo (Pro)",
  uploading: "Caricamento…",
  brandColor: "Colore brand",
  agencyName: "Nome agenzia",
  brokerName: "Nome agente",
  phone: "Telefono",
  contactEmail: "E-mail di contatto",
  website: "Sito web",
  pdfWatermark: "Watermark PDF",
  pdfWatermarkClean: "I tuoi export PDF sono senza watermark.",
  pdfWatermarkTrial:
    "I PDF di prova includono watermark. Acquista un pacchetto o abbonati per brochure pulite.",
  viewPlans: "Vedi piani",
  saveContactBranding: "Salva contatto e branding",
  saving: "Salvataggio…",
};

const nl: Partial<BrandingCopy> = {
  settingsTitle: "Branding-instellingen",
  settingsSubtitle:
    "Aangepast logo en kleuren voor PDF-brochures met maandelijkse & jaarlijkse Pro-abonnementen.",
  trialCreditsLeft: "U heeft nog {count} gratis proefcredits (PDF's met watermerk).",
  signInToManage: "Log in om branding te beheren.",
  loadFailed: "Branding kon niet worden geladen.",
  saved: "Opgeslagen.",
  saveFailed: "Opslaan mislukt.",
  logoUploaded: "Logo geüpload.",
  uploadFailed: "Upload mislukt.",
  loadingBranding: "Branding laden…",
  agencyLogo: "Bureau-logo",
  agencyLogoAlt: "Bureau-logo",
  noLogo: "Geen logo",
  uploadLogo: "Logo uploaden",
  uploadLogoPro: "Logo uploaden (Pro)",
  uploading: "Uploaden…",
  brandColor: "Huisstijlkleur",
  agencyName: "Bureaunaam",
  brokerName: "Makelaarsnaam",
  phone: "Telefoon",
  contactEmail: "Contact-e-mail",
  website: "Website",
  pdfWatermark: "PDF-watermerk",
  pdfWatermarkClean: "Uw PDF-exporten zijn zonder watermerk.",
  pdfWatermarkTrial:
    "Proef-PDF's bevatten een watermerk. Koop een pakket of abonneer voor schone brochures.",
  viewPlans: "Abonnementen bekijken",
  saveContactBranding: "Contact & branding opslaan",
  saving: "Opslaan…",
};

const pl: Partial<BrandingCopy> = {
  settingsTitle: "Ustawienia brandingu",
  settingsSubtitle:
    "Własne logo i kolory w PDF z planami Pro miesięcznymi i rocznymi.",
  trialCreditsLeft:
    "Pozostało {count} darmowych kredytów próbnych (PDF ze znakiem wodnym).",
  signInToManage: "Zaloguj się, aby zarządzać brandingiem.",
  loadFailed: "Nie można załadować brandingu.",
  saved: "Zapisano.",
  saveFailed: "Zapis nie powiódł się.",
  logoUploaded: "Logo przesłane.",
  uploadFailed: "Przesyłanie nie powiodło się.",
  loadingBranding: "Ładowanie brandingu…",
  agencyLogo: "Logo agencji",
  agencyLogoAlt: "Logo agencji",
  noLogo: "Brak logo",
  uploadLogo: "Prześlij logo",
  uploadLogoPro: "Prześlij logo (Pro)",
  uploading: "Przesyłanie…",
  brandColor: "Kolor marki",
  agencyName: "Nazwa agencji",
  brokerName: "Imię pośrednika",
  phone: "Telefon",
  contactEmail: "E-mail kontaktowy",
  website: "Strona www",
  pdfWatermark: "Znak wodny PDF",
  pdfWatermarkClean: "Eksport PDF jest bez znaku wodnego.",
  pdfWatermarkTrial:
    "PDF próbne mają znak wodny. Kup pakiet lub subskrybuj, aby eksportować czyste broszury.",
  viewPlans: "Zobacz plany",
  saveContactBranding: "Zapisz kontakt i branding",
  saving: "Zapisywanie…",
};

const fa: Partial<BrandingCopy> = {
  settingsTitle: "تنظیمات برندسازی",
  settingsSubtitle:
    "لوگو و رنگ سفارشی برای بروشور PDF در طرح‌های Pro ماهانه و سالانه.",
  trialCreditsLeft:
    "{count} اعتبار آزمایشی رایگان باقی مانده (PDF با واترمارک).",
  signInToManage: "برای مدیریت برندسازی وارد شوید.",
  loadFailed: "بارگذاری برندسازی ممکن نشد.",
  saved: "ذخیره شد.",
  saveFailed: "ذخیره ناموفق بود.",
  logoUploaded: "لوگو بارگذاری شد.",
  uploadFailed: "بارگذاری ناموفق بود.",
  loadingBranding: "در حال بارگذاری برندسازی…",
  agencyLogo: "لوگوی آژانس",
  agencyLogoAlt: "لوگوی آژانس",
  noLogo: "بدون لوگو",
  uploadLogo: "بارگذاری لوگو",
  uploadLogoPro: "بارگذاری لوگو (Pro)",
  uploading: "در حال بارگذاری…",
  brandColor: "رنگ برند",
  agencyName: "نام آژانس",
  brokerName: "نام مشاور",
  phone: "تلفن",
  contactEmail: "ایمیل تماس",
  website: "وب‌سایت",
  pdfWatermark: "واترمارک PDF",
  pdfWatermarkClean: "خروجی PDF شما بدون واترمارک است.",
  pdfWatermarkTrial:
    "PDF آزمایشی واترمارک دارد. بسته اعتبار یا اشتراک برای بروشور تمیز.",
  viewPlans: "مشاهده طرح‌ها",
  saveContactBranding: "ذخیره تماس و برندسازی",
  saving: "در حال ذخیره…",
};

const ar: Partial<BrandingCopy> = {
  settingsTitle: "إعدادات العلامة التجارية",
  settingsSubtitle:
    "الشعار والألوان المخصصة لكتيبات PDF في خطط Pro الشهرية والسنوية.",
  trialCreditsLeft:
    "لديك {count} رصيد تجريبي مجاني متبقٍ (PDF بعلامة مائية).",
  signInToManage: "سجّل الدخول لإدارة العلامة التجارية.",
  loadFailed: "تعذّر تحميل العلامة التجارية.",
  saved: "تم الحفظ.",
  saveFailed: "فشل الحفظ.",
  logoUploaded: "تم رفع الشعار.",
  uploadFailed: "فشل الرفع.",
  loadingBranding: "جارٍ تحميل العلامة التجارية…",
  agencyLogo: "شعار الوكالة",
  agencyLogoAlt: "شعار الوكالة",
  noLogo: "لا يوجد شعار",
  uploadLogo: "رفع الشعار",
  uploadLogoPro: "رفع الشعار (Pro)",
  uploading: "جارٍ الرفع…",
  brandColor: "لون العلامة",
  agencyName: "اسم الوكالة",
  brokerName: "اسم الوسيط",
  phone: "الهاتف",
  contactEmail: "البريد للتواصل",
  website: "الموقع",
  pdfWatermark: "علامة PDF المائية",
  pdfWatermarkClean: "تصدير PDF خالٍ من العلامة المائية.",
  pdfWatermarkTrial:
    "PDF التجريبي يتضمن علامة مائية. اشترِ حزمة أو اشترك لتصدير كتيبات نظيفة.",
  viewPlans: "عرض الخطط",
  saveContactBranding: "حفظ التواصل والعلامة التجارية",
  saving: "جارٍ الحفظ…",
};

const brandingTranslations: Partial<Record<UiLocale, Partial<BrandingCopy>>> = {
  de,
  fr,
  es,
  it,
  nl,
  pl,
  fa,
  ar,
};

export function getBrandingCopy(locale: UiLocale): BrandingCopy {
  return { ...en, ...(brandingTranslations[locale] ?? {}) };
}

export function formatTrialCreditsLeft(locale: UiLocale, count: number): string {
  return interpolate(getBrandingCopy(locale).trialCreditsLeft, { count });
}

export function getBrandingFieldLabels(locale: UiLocale) {
  const copy = getBrandingCopy(locale);
  return {
    agencyName: copy.agencyName,
    brokerName: copy.brokerName,
    contactPhone: copy.phone,
    contactEmail: copy.contactEmail,
    website: copy.website,
  } as const;
}

export type BrandKitCopy = {
  title: string;
  subtitle: string;
  agencyLogo: string;
  agencyLogoAlt: string;
  noLogo: string;
  uploadLogo: string;
  uploadLogoPro: string;
  logoHint: string;
  agentAvatar: string;
  agentAvatarAlt: string;
  noAvatar: string;
  uploadAvatar: string;
  uploadAvatarPro: string;
  avatarHint: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontModern: string;
  fontClassic: string;
  fontMinimal: string;
  customLegalImprint: string;
  customLegalImprintPlaceholder: string;
  customLegalImprintHint: string;
  saveBrandKit: string;
  saving: string;
  logoUploaded: string;
  avatarUploaded: string;
  uploadFailed: string;
  uploading: string;
};

const brandKitEn: BrandKitCopy = {
  title: "Agency Brand Kit",
  subtitle: "Logo, colors, typography, and legal imprint applied to your PDF brochures.",
  agencyLogo: "Agency logo",
  agencyLogoAlt: "Agency logo",
  noLogo: "No logo",
  uploadLogo: "Upload logo",
  uploadLogoPro: "Upload logo (Pro)",
  logoHint: "PNG or SVG, max 2 MB.",
  agentAvatar: "Agent avatar",
  agentAvatarAlt: "Agent photo",
  noAvatar: "No photo",
  uploadAvatar: "Upload photo",
  uploadAvatarPro: "Upload photo (Pro)",
  avatarHint: "JPEG or PNG for the contact section.",
  primaryColor: "Primary color",
  accentColor: "Accent color",
  fontFamily: "Font style",
  fontModern: "Modern",
  fontClassic: "Classic",
  fontMinimal: "Minimal",
  customLegalImprint: "Custom legal imprint",
  customLegalImprintPlaceholder: "Agency disclaimer shown on page 3 of every PDF…",
  customLegalImprintHint: "Overrides the per-listing legal disclaimer when set.",
  saveBrandKit: "Save brand kit",
  saving: "Saving…",
  logoUploaded: "Logo uploaded.",
  avatarUploaded: "Photo uploaded.",
  uploadFailed: "Upload failed.",
  uploading: "Uploading…",
};

const brandKitDe: Partial<BrandKitCopy> = {
  title: "Agentur Brand Kit",
  subtitle: "Logo, Farben, Typografie und Impressum für Ihre PDF-Broschüren.",
  primaryColor: "Primärfarbe",
  accentColor: "Akzentfarbe",
  fontFamily: "Schriftstil",
  customLegalImprint: "Individuelles Impressum",
  saveBrandKit: "Brand Kit speichern",
};

export function getBrandKitCopy(locale: UiLocale): BrandKitCopy {
  const partial = locale === "de" ? brandKitDe : {};
  return { ...brandKitEn, ...partial };
}
