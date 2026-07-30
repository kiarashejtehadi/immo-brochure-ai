export const UI_LOCALES = ["en", "de", "fr", "es", "it", "nl", "fa", "ar", "pl"] as const;
export type UiLocale = (typeof UI_LOCALES)[number];

export const OUTPUT_LANGUAGE_OPTIONS = [
  { value: "English", locale: "en" as UiLocale },
  { value: "German", locale: "de" as UiLocale },
  { value: "French", locale: "fr" as UiLocale },
  { value: "Spanish", locale: "es" as UiLocale },
  { value: "Italian", locale: "it" as UiLocale },
  { value: "Dutch", locale: "nl" as UiLocale },
  { value: "Persian", locale: "fa" as UiLocale },
  { value: "Arabic", locale: "ar" as UiLocale },
  { value: "Polish", locale: "pl" as UiLocale },
] as const;

export type OutputLanguage = (typeof OUTPUT_LANGUAGE_OPTIONS)[number]["value"];

export type FeatureKey =
  | "Balcony Terrace"
  | "Fitted Kitchen"
  | "Elevator"
  | "Garden"
  | "Guest WC"
  | "Cellar"
  | "Wheelchair Accessible";

export type ToneKey = "Luxurious" | "Professional" | "Friendly";

export type UiCopy = {
  brand: string;
  pageTitle: string;
  uiLanguage: string;
  propertyDetails: string;
  propertyDetailsHint: string;
  photos: string;
  dropImages: string;
  photosSelected: string;
  remove: string;
  address: string;
  addressPlaceholder: string;
  price: string;
  currency: string;
  priceOnRequest: string;
  size: string;
  rooms: string;
  features: string;
  tone: string;
  targetOutputLanguage: string;
  generate: string;
  generating: string;
  downloadPdf: string;
  preparingPdf: string;
  pdfHint: string;
  pdfPreviewHint: string;
  preview: string;
  tabExpose: string;
  tabInstagram: string;
  noContent: string;
  noContentHint: string;
  creatingCopy: string;
  creatingCopyHint: string;
  generationFailed: string;
  generationFailedHint: string;
  exposeLabel: string;
  caption: string;
  copy: string;
  copied: string;
  pdfShort: string;
  featuresMap: Record<FeatureKey, string>;
  tonesMap: Record<ToneKey, string>;
  errors: {
    invalidResponse: string;
    serverError: string;
    generationFailed: string;
    emptyExpose: string;
    expectedCaptions: string;
    timeout: string;
    generic: string;
    pdfFailed: string;
  };
};

export const translations: Record<UiLocale, UiCopy> = {
  en: {
    brand: "ImmoCaption AI",
    pageTitle: "Exposé & caption studio",
    uiLanguage: "UI language",
    propertyDetails: "Property details",
    propertyDetailsHint: "Upload up to 5 photos and fill in the listing basics.",
    photos: "Photos (max 5)",
    dropImages: "Drop images here or browse",
    photosSelected: "selected · JPG, PNG, WebP",
    remove: "Remove",
    address: "Address",
    addressPlaceholder: "12 Example Street, 10115 Berlin",
    price: "Price",
    currency: "Currency",
    priceOnRequest: "Price on request",
    size: "Size (m²)",
    rooms: "Number of rooms",
    features: "Features",
    tone: "Tone",
    targetOutputLanguage: "Target output language",
    generate: "Generate Exposé & Captions",
    generating: "Generating…",
    downloadPdf: "Download PDF Exposé",
    preparingPdf: "Preparing PDF…",
    pdfHint: "PDF download unlocks after you generate the exposé.",
    pdfPreviewHint:
      "Generate the exposé first — then download a 3-page PDF with photos, specs, and contact details.",
    preview: "Preview",
    tabExpose: "Exposé Description",
    tabInstagram: "Instagram Captions",
    noContent: "No content yet",
    noContentHint:
      "Complete the form and click Generate for a full exposé, location text, and three social captions.",
    creatingCopy: "Creating your copy…",
    creatingCopyHint:
      "This usually takes 5–20 seconds. Large photos are compressed first.",
    generationFailed: "Generation failed",
    generationFailedHint: "Fix the issue above and click Generate again.",
    exposeLabel: "Exposé",
    caption: "Caption",
    copy: "Copy to Clipboard",
    copied: "Copied!",
    pdfShort: "PDF",
    featuresMap: {
      "Balcony Terrace": "Balcony / Terrace",
      "Fitted Kitchen": "Fitted kitchen (EBK)",
      Elevator: "Elevator",
      Garden: "Garden",
      "Guest WC": "Guest WC",
      Cellar: "Cellar",
      "Wheelchair Accessible": "Wheelchair accessible",
    },
    tonesMap: {
      Luxurious: "Luxurious",
      Professional: "Professional",
      Friendly: "Friendly",
    },
    errors: {
      invalidResponse: "Invalid response from server",
      serverError: "Server error. Restart the dev server and try again.",
      generationFailed: "Generation failed",
      emptyExpose: "Empty exposé returned from API",
      expectedCaptions: "Expected two Instagram captions from API",
      timeout:
        "Request timed out after 90 seconds. Try again with fewer photos or check your network.",
      generic: "Something went wrong",
      pdfFailed: "PDF could not be created",
    },
  },
  de: {
    brand: "ImmoCaption AI",
    pageTitle: "Exposé- & Caption-Studio",
    uiLanguage: "Oberflächensprache",
    propertyDetails: "Objektdaten",
    propertyDetailsHint:
      "Laden Sie bis zu 5 Fotos hoch und ergänzen Sie die Angaben.",
    photos: "Fotos (max. 5)",
    dropImages: "Bilder hier ablegen oder auswählen",
    photosSelected: "ausgewählt · JPG, PNG, WebP",
    remove: "Entfernen",
    address: "Adresse",
    addressPlaceholder: "Musterstraße 12, 10115 Berlin",
    price: "Preis",
    currency: "Währung",
    priceOnRequest: "Preis auf Anfrage",
    size: "Fläche (m²)",
    rooms: "Zimmer",
    features: "Ausstattung",
    tone: "Tonfall",
    targetOutputLanguage: "Zielsprache für Texte",
    generate: "Exposé & Captions erstellen",
    generating: "Wird erstellt…",
    downloadPdf: "PDF-Exposé herunterladen",
    preparingPdf: "PDF wird erstellt…",
    pdfHint: "PDF-Download ist nach der Exposé-Erstellung verfügbar.",
    pdfPreviewHint:
      "Zuerst Exposé erstellen — danach 3-seitiges PDF mit Fotos, Daten und Kontakt.",
    preview: "Vorschau",
    tabExpose: "Exposé-Text",
    tabInstagram: "Instagram-Captions",
    noContent: "Noch kein Inhalt",
    noContentHint:
      "Formular ausfüllen und generieren — Exposé, Lagebeschreibung und drei Social-Media-Texte.",
    creatingCopy: "Texte werden erstellt…",
    creatingCopyHint:
      "Dauert meist 5–20 Sekunden. Große Fotos werden zuerst komprimiert.",
    generationFailed: "Erstellung fehlgeschlagen",
    generationFailedHint:
      "Fehler beheben und erneut auf Generieren klicken.",
    exposeLabel: "Exposé",
    caption: "Caption",
    copy: "In Zwischenablage",
    copied: "Kopiert!",
    pdfShort: "PDF",
    featuresMap: {
      "Balcony Terrace": "Balkon / Terrasse",
      "Fitted Kitchen": "Einbauküche (EBK)",
      Elevator: "Aufzug",
      Garden: "Garten",
      "Guest WC": "Gäste-WC",
      Cellar: "Keller",
      "Wheelchair Accessible": "Barrierefrei",
    },
    tonesMap: {
      Luxurious: "Luxuriös",
      Professional: "Professionell",
      Friendly: "Freundlich",
    },
    errors: {
      invalidResponse: "Ungültige Serverantwort",
      serverError: "Serverfehler. Dev-Server neu starten und erneut versuchen.",
      generationFailed: "Erstellung fehlgeschlagen",
      emptyExpose: "Leeres Exposé von der API erhalten",
      expectedCaptions: "Zwei Instagram-Captions erwartet",
      timeout:
        "Zeitüberschreitung nach 90 Sekunden. Weniger Fotos oder Netzwerk prüfen.",
      generic: "Etwas ist schiefgelaufen",
      pdfFailed: "PDF konnte nicht erstellt werden",
    },
  },
  fr: {
    brand: "ImmoCaption AI",
    pageTitle: "Studio exposé & légendes",
    uiLanguage: "Langue de l'interface",
    propertyDetails: "Détails du bien",
    propertyDetailsHint:
      "Ajoutez jusqu'à 5 photos et renseignez les informations.",
    photos: "Photos (max. 5)",
    dropImages: "Déposer des images ou parcourir",
    photosSelected: "sélectionnées · JPG, PNG, WebP",
    remove: "Supprimer",
    address: "Adresse",
    addressPlaceholder: "12 rue Exemple, 75001 Paris",
    price: "Prix",
    currency: "Devise",
    priceOnRequest: "Prix sur demande",
    size: "Surface (m²)",
    rooms: "Nombre de pièces",
    features: "Équipements",
    tone: "Ton",
    targetOutputLanguage: "Langue de sortie",
    generate: "Générer exposé & légendes",
    generating: "Génération…",
    downloadPdf: "Télécharger l'exposé PDF",
    preparingPdf: "Préparation du PDF…",
    pdfHint: "Le PDF est disponible après la génération de l'exposé.",
    pdfPreviewHint:
      "Générez d'abord l'exposé — puis un PDF de 3 pages avec photos et contact.",
    preview: "Aperçu",
    tabExpose: "Description exposé",
    tabInstagram: "Légendes Instagram",
    noContent: "Pas encore de contenu",
    noContentHint:
      "Remplissez le formulaire pour l'exposé, la localisation et trois légendes réseaux sociaux.",
    creatingCopy: "Création du contenu…",
    creatingCopyHint:
      "Comptez 5–20 secondes. Les grandes photos sont compressées.",
    generationFailed: "Échec de la génération",
    generationFailedHint: "Corrigez le problème et relancez la génération.",
    exposeLabel: "Exposé",
    caption: "Légende",
    copy: "Copier",
    copied: "Copié !",
    pdfShort: "PDF",
    featuresMap: {
      "Balcony Terrace": "Balcon / Terrasse",
      "Fitted Kitchen": "Cuisine équipée (EBK)",
      Elevator: "Ascenseur",
      Garden: "Jardin",
      "Guest WC": "WC invités",
      Cellar: "Cave",
      "Wheelchair Accessible": "Accessible PMR",
    },
    tonesMap: {
      Luxurious: "Luxueux",
      Professional: "Professionnel",
      Friendly: "Convivial",
    },
    errors: {
      invalidResponse: "Réponse serveur invalide",
      serverError: "Erreur serveur. Redémarrez et réessayez.",
      generationFailed: "Échec de la génération",
      emptyExpose: "Exposé vide reçu",
      expectedCaptions: "Deux légendes Instagram attendues",
      timeout: "Délai dépassé (90 s). Réessayez avec moins de photos.",
      generic: "Une erreur est survenue",
      pdfFailed: "Impossible de créer le PDF",
    },
  },
  es: {
    brand: "ImmoCaption AI",
    pageTitle: "Estudio de exposé y captions",
    uiLanguage: "Idioma de la interfaz",
    propertyDetails: "Datos del inmueble",
    propertyDetailsHint: "Sube hasta 5 fotos y completa los datos básicos.",
    photos: "Fotos (máx. 5)",
    dropImages: "Suelta imágenes aquí o explora",
    photosSelected: "seleccionadas · JPG, PNG, WebP",
    remove: "Quitar",
    address: "Dirección",
    addressPlaceholder: "Calle Ejemplo 12, 28001 Madrid",
    price: "Precio",
    currency: "Moneda",
    priceOnRequest: "Precio a consultar",
    size: "Superficie (m²)",
    rooms: "Habitaciones",
    features: "Características",
    tone: "Tono",
    targetOutputLanguage: "Idioma de salida",
    generate: "Generar exposé y captions",
    generating: "Generando…",
    downloadPdf: "Descargar exposé PDF",
    preparingPdf: "Preparando PDF…",
    pdfHint: "El PDF se activa tras generar el exposé.",
    pdfPreviewHint:
      "Genera el exposé primero — luego un PDF de 3 páginas con fotos y contacto.",
    preview: "Vista previa",
    tabExpose: "Descripción del exposé",
    tabInstagram: "Captions de Instagram",
    noContent: "Sin contenido aún",
    noContentHint:
      "Completa el formulario para el exposé, la ubicación y tres textos para redes sociales.",
    creatingCopy: "Creando textos…",
    creatingCopyHint: "Suele tardar 5–20 segundos. Se comprimen fotos grandes.",
    generationFailed: "Error al generar",
    generationFailedHint: "Corrige el error y vuelve a generar.",
    exposeLabel: "Exposé",
    caption: "Caption",
    copy: "Copiar",
    copied: "¡Copiado!",
    pdfShort: "PDF",
    featuresMap: {
      "Balcony Terrace": "Balcón / Terraza",
      "Fitted Kitchen": "Cocina equipada (EBK)",
      Elevator: "Ascensor",
      Garden: "Jardín",
      "Guest WC": "Aseo de invitados",
      Cellar: "Sótano",
      "Wheelchair Accessible": "Accesible silla de ruedas",
    },
    tonesMap: {
      Luxurious: "Lujoso",
      Professional: "Profesional",
      Friendly: "Cercano",
    },
    errors: {
      invalidResponse: "Respuesta del servidor no válida",
      serverError: "Error del servidor. Reinicia e inténtalo de nuevo.",
      generationFailed: "Error al generar",
      emptyExpose: "Exposé vacío recibido",
      expectedCaptions: "Se esperaban dos captions",
      timeout: "Tiempo agotado (90 s). Prueba con menos fotos.",
      generic: "Algo salió mal",
      pdfFailed: "No se pudo crear el PDF",
    },
  },
  it: {
    brand: "ImmoCaption AI",
    pageTitle: "Studio exposé e caption",
    uiLanguage: "Lingua interfaccia",
    propertyDetails: "Dettagli immobile",
    propertyDetailsHint: "Carica fino a 5 foto e inserisci i dati base.",
    photos: "Foto (max 5)",
    dropImages: "Trascina immagini o sfoglia",
    photosSelected: "selezionate · JPG, PNG, WebP",
    remove: "Rimuovi",
    address: "Indirizzo",
    addressPlaceholder: "Via Esempio 12, 20121 Milano",
    price: "Prezzo",
    currency: "Valuta",
    priceOnRequest: "Prezzo su richiesta",
    size: "Superficie (m²)",
    rooms: "Locali",
    features: "Caratteristiche",
    tone: "Tono",
    targetOutputLanguage: "Lingua di output",
    generate: "Genera exposé e caption",
    generating: "Generazione…",
    downloadPdf: "Scarica exposé PDF",
    preparingPdf: "Preparazione PDF…",
    pdfHint: "Il PDF è disponibile dopo la generazione dell'exposé.",
    pdfPreviewHint:
      "Genera prima l'exposé — poi un PDF di 3 pagine con foto e contatti.",
    preview: "Anteprima",
    tabExpose: "Descrizione exposé",
    tabInstagram: "Caption Instagram",
    noContent: "Nessun contenuto",
    noContentHint:
      "Compila il modulo per exposé, posizione e tre caption social.",
    creatingCopy: "Creazione testi…",
    creatingCopyHint: "Di solito 5–20 secondi. Le foto grandi vengono compresse.",
    generationFailed: "Generazione non riuscita",
    generationFailedHint: "Correggi l'errore e riprova.",
    exposeLabel: "Exposé",
    caption: "Caption",
    copy: "Copia",
    copied: "Copiato!",
    pdfShort: "PDF",
    featuresMap: {
      "Balcony Terrace": "Balcone / Terrazza",
      "Fitted Kitchen": "Cucina attrezzata (EBK)",
      Elevator: "Ascensore",
      Garden: "Giardino",
      "Guest WC": "WC ospiti",
      Cellar: "Cantina",
      "Wheelchair Accessible": "Accessibile disabili",
    },
    tonesMap: {
      Luxurious: "Lussuoso",
      Professional: "Professionale",
      Friendly: "Amichevole",
    },
    errors: {
      invalidResponse: "Risposta server non valida",
      serverError: "Errore server. Riavvia e riprova.",
      generationFailed: "Generazione non riuscita",
      emptyExpose: "Exposé vuoto ricevuto",
      expectedCaptions: "Attese due caption Instagram",
      timeout: "Timeout (90 s). Riprova con meno foto.",
      generic: "Qualcosa è andato storto",
      pdfFailed: "Impossibile creare il PDF",
    },
  },
  nl: {
    brand: "ImmoCaption AI",
    pageTitle: "Exposé- & captionstudio",
    uiLanguage: "Taal interface",
    propertyDetails: "Objectgegevens",
    propertyDetailsHint: "Upload max. 5 foto's en vul de basisgegevens in.",
    photos: "Foto's (max. 5)",
    dropImages: "Sleep afbeeldingen hierheen of blader",
    photosSelected: "geselecteerd · JPG, PNG, WebP",
    remove: "Verwijderen",
    address: "Adres",
    addressPlaceholder: "Voorbeeldstraat 12, 1012 AB Amsterdam",
    price: "Prijs",
    currency: "Valuta",
    priceOnRequest: "Prijs op aanvraag",
    size: "Oppervlakte (m²)",
    rooms: "Kamers",
    features: "Voorzieningen",
    tone: "Toon",
    targetOutputLanguage: "Doeltaal voor teksten",
    generate: "Exposé & captions genereren",
    generating: "Bezig…",
    downloadPdf: "PDF-exposé downloaden",
    preparingPdf: "PDF voorbereiden…",
    pdfHint: "PDF beschikbaar na het genereren van het exposé.",
    pdfPreviewHint:
      "Genereer eerst het exposé — daarna een 3-pagina PDF met foto's en contact.",
    preview: "Voorbeeld",
    tabExpose: "Exposétekst",
    tabInstagram: "Instagram-captions",
    noContent: "Nog geen inhoud",
    noContentHint:
      "Vul het formulier in voor exposé, locatie en drie socialmediatexten.",
    creatingCopy: "Teksten worden gemaakt…",
    creatingCopyHint: "Meestal 5–20 seconden. Grote foto's worden gecomprimeerd.",
    generationFailed: "Genereren mislukt",
    generationFailedHint: "Los het probleem op en probeer opnieuw.",
    exposeLabel: "Exposé",
    caption: "Caption",
    copy: "Kopiëren",
    copied: "Gekopieerd!",
    pdfShort: "PDF",
    featuresMap: {
      "Balcony Terrace": "Balkon / Terras",
      "Fitted Kitchen": "Inbouwkeuken (EBK)",
      Elevator: "Lift",
      Garden: "Tuin",
      "Guest WC": "Gasttoilet",
      Cellar: "Kelder",
      "Wheelchair Accessible": "Rolstoeltoegankelijk",
    },
    tonesMap: {
      Luxurious: "Luxueus",
      Professional: "Professioneel",
      Friendly: "Vriendelijk",
    },
    errors: {
      invalidResponse: "Ongeldig serverantwoord",
      serverError: "Serverfout. Herstart en probeer opnieuw.",
      generationFailed: "Genereren mislukt",
      emptyExpose: "Leeg exposé ontvangen",
      expectedCaptions: "Twee Instagram-captions verwacht",
      timeout: "Time-out na 90 s. Probeer met minder foto's.",
      generic: "Er ging iets mis",
      pdfFailed: "PDF kon niet worden gemaakt",
    },
  },
  fa: {
    brand: "ImmoCaption AI",
    pageTitle: "استودیو exposé و کپشن",
    uiLanguage: "زبان رابط کاربری",
    propertyDetails: "جزئیات ملک",
    propertyDetailsHint: "حداکثر ۵ عکس بارگذاری کنید و اطلاعات پایه را وارد کنید.",
    photos: "عکس‌ها (حداکثر ۵)",
    dropImages: "تصاویر را اینجا رها کنید یا انتخاب کنید",
    photosSelected: "انتخاب‌شده · JPG, PNG, WebP",
    remove: "حذف",
    address: "آدرس",
    addressPlaceholder: "تهران، خیابان نمونه، پلاک ۱۲",
    price: "قیمت",
    currency: "ارز",
    priceOnRequest: "قیمت توافقی",
    size: "متراژ (m²)",
    rooms: "تعداد اتاق",
    features: "امکانات",
    tone: "لحن",
    targetOutputLanguage: "زبان خروجی متن",
    generate: "ساخت exposé و کپشن",
    generating: "در حال ساخت…",
    downloadPdf: "دانلود PDF exposé",
    preparingPdf: "در حال آماده‌سازی PDF…",
    pdfHint: "پس از ساخت exposé می‌توانید PDF را دانلود کنید.",
    pdfPreviewHint:
      "ابتدا exposé را بسازید — سپس PDF سه‌صفحه‌ای با عکس‌ها و تماس را دانلود کنید.",
    preview: "پیش‌نمایش",
    tabExpose: "متن exposé",
    tabInstagram: "کپشن اینستاگرام",
    noContent: "هنوز محتوایی نیست",
    noContentHint:
      "فرم را تکمیل کنید تا exposé، متن موقعیت مکانی و سه کپشن شبکه‌های اجتماعی ساخته شود.",
    creatingCopy: "در حال نوشتن متن…",
    creatingCopyHint: "معمولاً ۵–۲۰ ثانیه. عکس‌های بزرگ ابتدا فشرده می‌شوند.",
    generationFailed: "ساخت ناموفق بود",
    generationFailedHint: "مشکل را برطرف کنید و دوباره تلاش کنید.",
    exposeLabel: "Exposé",
    caption: "کپشن",
    copy: "کپی",
    copied: "کپی شد!",
    pdfShort: "PDF",
    featuresMap: {
      "Balcony Terrace": "بالکن / تراس",
      "Fitted Kitchen": "آشپزخانه مجهز (EBK)",
      Elevator: "آسانسور",
      Garden: "باغ",
      "Guest WC": "سرویس مهمان",
      Cellar: "انباری",
      "Wheelchair Accessible": "دسترس‌پذیر ویلچر",
    },
    tonesMap: {
      Luxurious: "لوکس",
      Professional: "حرفه‌ای",
      Friendly: "صمیمی",
    },
    errors: {
      invalidResponse: "پاسخ سرور نامعتبر است",
      serverError: "خطای سرور. سرور را راه‌اندازی مجدد کنید.",
      generationFailed: "ساخت ناموفق بود",
      emptyExpose: "exposé خالی دریافت شد",
      expectedCaptions: "دو کپشن اینستاگرام مورد انتظار بود",
      timeout: "زمان درخواست (۹۰ ثانیه) تمام شد.",
      generic: "خطایی رخ داد",
      pdfFailed: "ساخت PDF ممکن نشد",
    },
  },
  ar: {
    brand: "ImmoCaption AI",
    pageTitle: "استوديو الوصف والتعليقات",
    uiLanguage: "لغة الواجهة",
    propertyDetails: "تفاصيل العقار",
    propertyDetailsHint: "ارفع حتى 5 صور وأدخل البيانات الأساسية.",
    photos: "الصور (حد أقصى 5)",
    dropImages: "اسحب الصور هنا أو تصفح",
    photosSelected: "محددة · JPG, PNG, WebP",
    remove: "إزالة",
    address: "العنوان",
    addressPlaceholder: "الرياض، شارع المثال 12",
    price: "السعر",
    currency: "العملة",
    priceOnRequest: "السعر عند الطلب",
    size: "المساحة (m²)",
    rooms: "عدد الغرف",
    features: "المميزات",
    tone: "النبرة",
    targetOutputLanguage: "لغة النص الناتج",
    generate: "إنشاء الوصف والتعليقات",
    generating: "جارٍ الإنشاء…",
    downloadPdf: "تنزيل PDF للوصف",
    preparingPdf: "جارٍ تجهيز PDF…",
    pdfHint: "يتاح التنزيل بعد إنشاء الوصف.",
    pdfPreviewHint:
      "أنشئ الوصف أولاً — ثم نزّل PDF من 3 صفحات بالصور وبيانات التواصل.",
    preview: "معاينة",
    tabExpose: "وصف العقار",
    tabInstagram: "تعليقات إنستغرام",
    noContent: "لا يوجد محتوى بعد",
    noContentHint:
      "أكمل النموذج للحصول على الوصف وموقع الحي وثلاثة نصوص لوسائل التواصل.",
    creatingCopy: "جارٍ كتابة النص…",
    creatingCopyHint: "عادة 5–20 ثانية. تُضغط الصور الكبيرة أولاً.",
    generationFailed: "فشل الإنشاء",
    generationFailedHint: "أصلح المشكلة ثم حاول مرة أخرى.",
    exposeLabel: "الوصف",
    caption: "تعليق",
    copy: "نسخ",
    copied: "تم النسخ!",
    pdfShort: "PDF",
    featuresMap: {
      "Balcony Terrace": "شرفة / تراس",
      "Fitted Kitchen": "مطبخ مجهز (EBK)",
      Elevator: "مصعد",
      Garden: "حديقة",
      "Guest WC": "دورة مياه للضيوف",
      Cellar: "قبو",
      "Wheelchair Accessible": "مناسب للكراسي المتحركة",
    },
    tonesMap: {
      Luxurious: "فاخر",
      Professional: "احترافي",
      Friendly: "ودود",
    },
    errors: {
      invalidResponse: "استجابة خادم غير صالحة",
      serverError: "خطأ في الخادم. أعد التشغيل وحاول مجدداً.",
      generationFailed: "فشل الإنشاء",
      emptyExpose: "وصف فارغ من الخادم",
      expectedCaptions: "مطلوب تعليقان لإنستغرام",
      timeout: "انتهت المهلة (90 ثانية).",
      generic: "حدث خطأ ما",
      pdfFailed: "تعذّر إنشاء PDF",
    },
  },
  pl: {
    brand: "ImmoCaption AI",
    pageTitle: "Studio exposé i opisów",
    uiLanguage: "Język interfejsu",
    propertyDetails: "Dane nieruchomości",
    propertyDetailsHint: "Prześlij do 5 zdjęć i uzupełnij podstawowe informacje.",
    photos: "Zdjęcia (maks. 5)",
    dropImages: "Upuść zdjęcia tutaj lub wybierz pliki",
    photosSelected: "wybrane · JPG, PNG, WebP",
    remove: "Usuń",
    address: "Adres",
    addressPlaceholder: "ul. Przykładowa 12, 00-001 Warszawa",
    price: "Cena",
    currency: "Waluta",
    priceOnRequest: "Cena do uzgodnienia",
    size: "Powierzchnia (m²)",
    rooms: "Liczba pokoi",
    features: "Udogodnienia",
    tone: "Ton",
    targetOutputLanguage: "Język treści",
    generate: "Generuj exposé i opisy",
    generating: "Generowanie…",
    downloadPdf: "Pobierz PDF exposé",
    preparingPdf: "Przygotowywanie PDF…",
    pdfHint: "Pobieranie PDF dostępne po wygenerowaniu exposé.",
    pdfPreviewHint:
      "Najpierw wygeneruj exposé — potem pobierz 3-stronicowy PDF ze zdjęciami i kontaktem.",
    preview: "Podgląd",
    tabExpose: "Opis exposé",
    tabInstagram: "Opisy Instagram",
    noContent: "Brak treści",
    noContentHint:
      "Uzupełnij formularz, aby otrzymać exposé, opis lokalizacji i trzy opisy social media.",
    creatingCopy: "Tworzenie treści…",
    creatingCopyHint: "Zwykle 5–20 sekund. Duże zdjęcia są najpierw kompresowane.",
    generationFailed: "Generowanie nie powiodło się",
    generationFailedHint: "Popraw błąd i spróbuj ponownie.",
    exposeLabel: "Exposé",
    caption: "Opis",
    copy: "Kopiuj",
    copied: "Skopiowano!",
    pdfShort: "PDF",
    featuresMap: {
      "Balcony Terrace": "Balkon / Taras",
      "Fitted Kitchen": "Kuchnia w zabudowie (EBK)",
      Elevator: "Winda",
      Garden: "Ogród",
      "Guest WC": "Toaleta gościnna",
      Cellar: "Piwnica",
      "Wheelchair Accessible": "Dostępne dla wózków",
    },
    tonesMap: {
      Luxurious: "Luksusowy",
      Professional: "Profesjonalny",
      Friendly: "Przyjazny",
    },
    errors: {
      invalidResponse: "Nieprawidłowa odpowiedź serwera",
      serverError: "Błąd serwera. Uruchom ponownie i spróbuj jeszcze raz.",
      generationFailed: "Generowanie nie powiodło się",
      emptyExpose: "Otrzymano pusty exposé",
      expectedCaptions: "Oczekiwano opisów social media",
      timeout: "Przekroczono limit czasu (90 s). Spróbuj z mniejszą liczbą zdjęć.",
      generic: "Coś poszło nie tak",
      pdfFailed: "Nie udało się utworzyć PDF",
    },
  },
};

export function getUiCopy(locale: UiLocale): UiCopy {
  return translations[locale];
}

export const RTL_UI_LOCALES: UiLocale[] = ["fa", "ar"];

export function isRtlUiLocale(locale: UiLocale): boolean {
  return RTL_UI_LOCALES.includes(locale);
}

export const LOCALE_LABELS: Record<UiLocale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
  fa: "فارسی",
  ar: "العربية",
  pl: "Polski",
};
