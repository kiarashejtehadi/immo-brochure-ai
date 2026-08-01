import type { LegalBusinessConfig } from "@/config/legal-business";
import type { ConvenienceLocale } from "@/content/legal/convenience/types";

const choiceOfLaw: Record<ConvenienceLocale, string> = {
  fr: "Ce service est exploité depuis l'Allemagne et soumis au droit allemand, sans prejudice des droits impératifs des consommateurs de votre juridiction.",
  es: "Este servicio se opera desde Alemania bajo la ley alemana, sin perjuicio de los derechos imperativos de consumidores en su jurisdicción.",
  it: "Il servizio è gestito dalla Germania ed è soggetto al diritto tedesco, fatti salvi i diritti obbligatori dei consumatori nella vostra giurisdizione.",
  nl: "Deze dienst wordt vanuit Duitsland aangeboden onder Duits recht, onverminderd dwingende consumentenrechten in uw rechtsgebied.",
  pl: "Usługa jest prowadzona z Niemiec i podlega prawu niemieckiemu, z zastrzeżeniem bezwzględnie obowiązujących praw konsumenta w Twojej jurysdykcji.",
  fa: "این سرویس از آلمان و تحت قانون آلمان اداره می‌شود، بدون نقض حقوق اجباری مصرف‌کننده در حوزه قضایی شما.",
  ar: "تُشغَّل هذه الخدمة من ألمانيا وتخضع للقانون الألماني، دون الإخلال بالحقوق الإلزامية للمستهلكين في ولايتك القضائية.",
};

const privacyContact: Record<ConvenienceLocale, (cfg: LegalBusinessConfig) => string> = {
  fr: (cfg) =>
    `Demandes de confidentialité (§ 25 TDDDG, RGPD art. 13/14) : ${cfg.email}`,
  es: (cfg) =>
    `Consultas de privacidad (§ 25 TDDDG, RGPD art. 13/14): ${cfg.email}`,
  it: (cfg) =>
    `Richieste privacy (§ 25 TDDDG, GDPR art. 13/14): ${cfg.email}`,
  nl: (cfg) =>
    `Privacyverzoeken (§ 25 TDDDG, AVG art. 13/14): ${cfg.email}`,
  pl: (cfg) =>
    `Zapytania o prywatność (§ 25 TDDDG, RODO art. 13/14): ${cfg.email}`,
  fa: (cfg) =>
    `تماس حریم خصوصی (§ 25 TDDDG، GDPR مواد ۱۳/۱۴): ${cfg.email}`,
  ar: (cfg) =>
    `استفسارات الخصوصية (§ 25 TDDDG، GDPR المادتان 13/14): ${cfg.email}`,
};

const contactLabels: Record<
  ConvenienceLocale,
  { email: string; phone: string }
> = {
  fr: { email: "E-mail", phone: "Téléphone" },
  es: { email: "Correo electrónico", phone: "Teléfono" },
  it: { email: "E-mail", phone: "Telefono" },
  nl: { email: "E-mail", phone: "Telefoon" },
  pl: { email: "E-mail", phone: "Telefon" },
  fa: { email: "ایمیل", phone: "تلفن" },
  ar: { email: "البريد الإلكتروني", phone: "الهاتف" },
};

export function choiceOfLawClauseConvenience(locale: ConvenienceLocale): string {
  return choiceOfLaw[locale];
}

export function privacyContactTdddgConvenience(
  cfg: LegalBusinessConfig,
  locale: ConvenienceLocale,
): string {
  return privacyContact[locale](cfg);
}

export function controllerContactLinesConvenience(
  cfg: LegalBusinessConfig,
  locale: ConvenienceLocale,
): string[] {
  const labels = contactLabels[locale];
  return [
    cfg.operatorName,
    cfg.streetAddress,
    `${cfg.postalCode} ${cfg.city}, ${cfg.country}`,
    `${labels.email}: ${cfg.email}`,
    `${labels.phone}: ${cfg.phone}`,
  ];
}
