import type { LegalBusinessConfig } from "@/config/legal-business";

/** Binding international choice-of-law notice (English master). */
export function choiceOfLawClauseEn(): string {
  return "This service is operated from Germany under German law, without prejudice to mandatory local consumer rights in your jurisdiction.";
}

export function choiceOfLawClauseDe(): string {
  return "Dieser Dienst wird von Deutschland aus betrieben; es gilt deutsches Recht unter Wahrung zwingender verbraucherschützender Vorschriften Ihres Aufenthaltsstaates, soweit anwendbar.";
}

export function operatorAddressLine(cfg: LegalBusinessConfig): string {
  return `${cfg.streetAddress}, ${cfg.postalCode} ${cfg.city}, ${cfg.country}`;
}

export function controllerContactLines(
  cfg: LegalBusinessConfig,
  lang: "en" | "de",
): string[] {
  if (lang === "de") {
    return [
      cfg.operatorName,
      cfg.streetAddress,
      `${cfg.postalCode} ${cfg.city}, ${cfg.country}`,
      `E-Mail: ${cfg.email}`,
      `Telefon: ${cfg.phone}`,
    ];
  }
  return [
    cfg.operatorName,
    cfg.streetAddress,
    `${cfg.postalCode} ${cfg.city}, ${cfg.country}`,
    `Email: ${cfg.email}`,
    `Phone: ${cfg.phone}`,
  ];
}

export function privacyContactTdddg(cfg: LegalBusinessConfig, lang: "en" | "de"): string {
  if (lang === "de") {
    return `Kontakt für Datenschutzanfragen (§ 25 TDDDG, Art. 13/14 DSGVO): ${cfg.email}`;
  }
  return `Privacy inquiries (§ 25 TDDDG German TDDPA, GDPR Art. 13/14): ${cfg.email}`;
}
