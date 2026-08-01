import type { UiLocale } from "@/lib/i18n";

export type WorkflowUiCopy = {
  complianceBadge: string;
  voiceListening: string;
  voiceUnsupported: string;
  voiceDictation: string;
  copyMlsShort: string;
  copyInstagramHashtags: string;
  copyPlainText: string;
  copiedToClipboard: string;
};

const en: WorkflowUiCopy = {
  complianceBadge: "✓ Anti-Discrimination & Fair Housing Compliant",
  voiceListening: "Listening…",
  voiceUnsupported: "Voice input is not supported in this browser. Try Chrome or Edge.",
  voiceDictation: "Dictate with microphone",
  copyMlsShort: "Copy Short MLS Version",
  copyInstagramHashtags: "Copy Instagram & Hashtags",
  copyPlainText: "Copy Plain Text",
  copiedToClipboard: "Copied to clipboard!",
};

const de: WorkflowUiCopy = {
  complianceBadge: "✓ Antidiskriminierung & Fair-Housing-konform",
  voiceListening: "Hört zu…",
  voiceUnsupported:
    "Spracheingabe wird in diesem Browser nicht unterstützt. Chrome oder Edge verwenden.",
  voiceDictation: "Per Mikrofon diktieren",
  copyMlsShort: "Kurzversion MLS kopieren",
  copyInstagramHashtags: "Instagram & Hashtags kopieren",
  copyPlainText: "Klartext kopieren",
  copiedToClipboard: "In die Zwischenablage kopiert!",
};

const fr: WorkflowUiCopy = {
  complianceBadge: "✓ Conforme anti-discrimination & Fair Housing",
  voiceListening: "Écoute…",
  voiceUnsupported:
    "La saisie vocale n'est pas prise en charge dans ce navigateur. Essayez Chrome ou Edge.",
  voiceDictation: "Dicter au microphone",
  copyMlsShort: "Copier version MLS courte",
  copyInstagramHashtags: "Copier Instagram & hashtags",
  copyPlainText: "Copier texte brut",
  copiedToClipboard: "Copié dans le presse-papiers !",
};

const es: WorkflowUiCopy = {
  complianceBadge: "✓ Conforme anti-discriminación y Fair Housing",
  voiceListening: "Escuchando…",
  voiceUnsupported:
    "La entrada de voz no es compatible con este navegador. Pruebe Chrome o Edge.",
  voiceDictation: "Dictar con micrófono",
  copyMlsShort: "Copiar versión MLS corta",
  copyInstagramHashtags: "Copiar Instagram y hashtags",
  copyPlainText: "Copiar texto plano",
  copiedToClipboard: "¡Copiado al portapapeles!",
};

const it: WorkflowUiCopy = {
  complianceBadge: "✓ Conforme anti-discriminazione e Fair Housing",
  voiceListening: "In ascolto…",
  voiceUnsupported:
    "Input vocale non supportato in questo browser. Prova Chrome o Edge.",
  voiceDictation: "Dettare con microfono",
  copyMlsShort: "Copia versione MLS breve",
  copyInstagramHashtags: "Copia Instagram e hashtag",
  copyPlainText: "Copia testo semplice",
  copiedToClipboard: "Copiato negli appunti!",
};

const nl: WorkflowUiCopy = {
  complianceBadge: "✓ Anti-discriminatie & Fair Housing conform",
  voiceListening: "Luisteren…",
  voiceUnsupported:
    "Spraakinvoer wordt niet ondersteund in deze browser. Probeer Chrome of Edge.",
  voiceDictation: "Dicteren met microfoon",
  copyMlsShort: "Korte MLS-versie kopiëren",
  copyInstagramHashtags: "Instagram & hashtags kopiëren",
  copyPlainText: "Platte tekst kopiëren",
  copiedToClipboard: "Gekopieerd naar klembord!",
};

const pl: WorkflowUiCopy = {
  complianceBadge: "✓ Zgodne z antydyskryminacją i Fair Housing",
  voiceListening: "Nasłuchiwanie…",
  voiceUnsupported:
    "Wprowadzanie głosowe nie jest obsługiwane w tej przeglądarce. Użyj Chrome lub Edge.",
  voiceDictation: "Dyktuj mikrofonem",
  copyMlsShort: "Kopiuj krótką wersję MLS",
  copyInstagramHashtags: "Kopiuj Instagram i hashtagi",
  copyPlainText: "Kopiuj zwykły tekst",
  copiedToClipboard: "Skopiowano do schowka!",
};

const fa: WorkflowUiCopy = {
  complianceBadge: "✓ مطابق با ضد تبعیض و Fair Housing",
  voiceListening: "در حال گوش دادن…",
  voiceUnsupported:
    "ورودی صوتی در این مرورگر پشتیبانی نمی‌شود. Chrome یا Edge را امتحان کنید.",
  voiceDictation: "دیکته با میکروفون",
  copyMlsShort: "کپی نسخه کوتاه MLS",
  copyInstagramHashtags: "کپی اینستاگرام و هشتگ‌ها",
  copyPlainText: "کپی متن ساده",
  copiedToClipboard: "در کلیپ‌بورد کپی شد!",
};

const ar: WorkflowUiCopy = {
  complianceBadge: "✓ متوافق مع مكافحة التمييز وFair Housing",
  voiceListening: "جارٍ الاستماع…",
  voiceUnsupported:
    "الإدخال الصوتي غير مدعوم في هذا المتصفح. جرّب Chrome أو Edge.",
  voiceDictation: "إملاء بالميكروفون",
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
