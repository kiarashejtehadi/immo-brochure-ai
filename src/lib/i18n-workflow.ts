import type { UiLocale } from "@/lib/i18n";

export type WorkflowUiCopy = {
  complianceBadge: string;
  voiceFillButton: string;
  voiceFillListening: string;
  voiceFillProcessing: string;
  voiceFillUnsupported: string;
  voiceFillButtonTrial: string;
  copyMlsShort: string;
  copyInstagramHashtags: string;
  copyPlainText: string;
  copiedToClipboard: string;
};

const en: WorkflowUiCopy = {
  complianceBadge: "✓ Anti-Discrimination & Fair Housing Compliant",
  voiceFillButton: "🎙️ Fill with Voice",
  voiceFillListening: "Recording… tap to stop",
  voiceFillProcessing: "Processing voice…",
  voiceFillUnsupported: "Voice recording is not supported in this browser.",
  voiceFillButtonTrial: "🎙️ Dictate ({count} free left)",
  copyMlsShort: "Copy Short MLS Version",
  copyInstagramHashtags: "Copy Instagram & Hashtags",
  copyPlainText: "Copy Plain Text",
  copiedToClipboard: "Copied to clipboard!",
};

const de: WorkflowUiCopy = {
  complianceBadge: "✓ Antidiskriminierung & Fair-Housing-konform",
  voiceFillButton: "🎙️ Mit Sprache ausfüllen",
  voiceFillListening: "Aufnahme… zum Stoppen tippen",
  voiceFillProcessing: "Sprache wird verarbeitet…",
  voiceFillUnsupported: "Sprachaufnahme wird in diesem Browser nicht unterstützt.",
  voiceFillButtonTrial: "🎙️ Diktieren ({count} kostenlos übrig)",
  copyMlsShort: "Kurzversion MLS kopieren",
  copyInstagramHashtags: "Instagram & Hashtags kopieren",
  copyPlainText: "Klartext kopieren",
  copiedToClipboard: "In die Zwischenablage kopiert!",
};

const fr: WorkflowUiCopy = {
  complianceBadge: "✓ Conforme anti-discrimination & Fair Housing",
  voiceFillButton: "🎙️ Remplir à la voix",
  voiceFillListening: "Enregistrement… appuyez pour arrêter",
  voiceFillProcessing: "Traitement de la voix…",
  voiceFillUnsupported: "L'enregistrement vocal n'est pas pris en charge dans ce navigateur.",
  voiceFillButtonTrial: "🎙️ Dicter ({count} gratuits restants)",
  copyMlsShort: "Copier version MLS courte",
  copyInstagramHashtags: "Copier Instagram & hashtags",
  copyPlainText: "Copier texte brut",
  copiedToClipboard: "Copié dans le presse-papiers !",
};

const es: WorkflowUiCopy = {
  complianceBadge: "✓ Conforme anti-discriminación y Fair Housing",
  voiceFillButton: "🎙️ Rellenar con voz",
  voiceFillListening: "Grabando… toque para detener",
  voiceFillProcessing: "Procesando voz…",
  voiceFillUnsupported: "La grabación de voz no es compatible con este navegador.",
  voiceFillButtonTrial: "🎙️ Dictar ({count} gratis restantes)",
  copyMlsShort: "Copiar versión MLS corta",
  copyInstagramHashtags: "Copiar Instagram y hashtags",
  copyPlainText: "Copiar texto plano",
  copiedToClipboard: "¡Copiado al portapapeles!",
};

const it: WorkflowUiCopy = {
  complianceBadge: "✓ Conforme anti-discriminazione e Fair Housing",
  voiceFillButton: "🎙️ Compila con voce",
  voiceFillListening: "Registrazione… tocca per fermare",
  voiceFillProcessing: "Elaborazione voce…",
  voiceFillUnsupported: "La registrazione vocale non è supportata in questo browser.",
  voiceFillButtonTrial: "🎙️ Detta ({count} gratuiti rimasti)",
  copyMlsShort: "Copia versione MLS breve",
  copyInstagramHashtags: "Copia Instagram e hashtag",
  copyPlainText: "Copia testo semplice",
  copiedToClipboard: "Copiato negli appunti!",
};

const nl: WorkflowUiCopy = {
  complianceBadge: "✓ Anti-discriminatie & Fair Housing conform",
  voiceFillButton: "🎙️ Invullen met spraak",
  voiceFillListening: "Opnemen… tik om te stoppen",
  voiceFillProcessing: "Spraak verwerken…",
  voiceFillUnsupported: "Spraakopname wordt niet ondersteund in deze browser.",
  voiceFillButtonTrial: "🎙️ Dicteren ({count} gratis over)",
  copyMlsShort: "Korte MLS-versie kopiëren",
  copyInstagramHashtags: "Instagram & hashtags kopiëren",
  copyPlainText: "Platte tekst kopiëren",
  copiedToClipboard: "Gekopieerd naar klembord!",
};

const pl: WorkflowUiCopy = {
  complianceBadge: "✓ Zgodne z antydyskryminacją i Fair Housing",
  voiceFillButton: "🎙️ Wypełnij głosem",
  voiceFillListening: "Nagrywanie… dotknij, aby zatrzymać",
  voiceFillProcessing: "Przetwarzanie mowy…",
  voiceFillUnsupported: "Nagrywanie głosu nie jest obsługiwane w tej przeglądarce.",
  voiceFillButtonTrial: "🎙️ Dyktuj ({count} darmowych pozostało)",
  copyMlsShort: "Kopiuj krótką wersję MLS",
  copyInstagramHashtags: "Kopiuj Instagram i hashtagi",
  copyPlainText: "Kopiuj zwykły tekst",
  copiedToClipboard: "Skopiowano do schowka!",
};

const fa: WorkflowUiCopy = {
  complianceBadge: "✓ مطابق با ضد تبعیض و Fair Housing",
  voiceFillButton: "🎙️ پر کردن با صدا",
  voiceFillListening: "در حال ضبط… برای توقف ضربه بزنید",
  voiceFillProcessing: "در حال پردازش صدا…",
  voiceFillUnsupported: "ضبط صدا در این مرورگر پشتیبانی نمی‌شود.",
  voiceFillButtonTrial: "🎙️ دیکته ({count} رایگان باقی‌مانده)",
  copyMlsShort: "کپی نسخه کوتاه MLS",
  copyInstagramHashtags: "کپی اینستاگرام و هشتگ‌ها",
  copyPlainText: "کپی متن ساده",
  copiedToClipboard: "در کلیپ‌بورد کپی شد!",
};

const ar: WorkflowUiCopy = {
  complianceBadge: "✓ متوافق مع مكافحة التمييز وFair Housing",
  voiceFillButton: "🎙️ تعبئة بالصوت",
  voiceFillListening: "جارٍ التسجيل… اضغط للإيقاف",
  voiceFillProcessing: "جارٍ معالجة الصوت…",
  voiceFillUnsupported: "تسجيل الصوت غير مدعوم في هذا المتصفح.",
  voiceFillButtonTrial: "🎙️ إملاء ({count} مجانية متبقية)",
  copyMlsShort: "نسخ نسخة MLS قصيرة",
  copyInstagramHashtags: "نسخ Instagram والهاشتags",
  copyPlainText: "نسخ نص عادي",
  copiedToClipboard: "تم النسخ إلى الحافظة!",
};

const byLocale: Record<UiLocale, WorkflowUiCopy> = {
  en,
  de,
  fr,
  es,
  it,
  nl,
  pl,
  fa,
  ar,
};

export function getWorkflowUiCopy(locale: UiLocale): WorkflowUiCopy {
  return byLocale[locale] ?? en;
}
