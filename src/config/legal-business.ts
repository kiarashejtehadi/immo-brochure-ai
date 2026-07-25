/**
 * Operator / imprint data — set via environment variables in production.
 * Never commit real personal addresses to git; use Vercel env vars.
 */
export type LegalBusinessConfig = {
  operatorName: string;
  legalForm: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  vatId: string;
  contentOfficer: string;
  jurisdictionCity: string;
  lastUpdated: string;
};

function env(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : fallback;
}

export function getLegalBusinessConfig(): LegalBusinessConfig {
  return {
    operatorName: env("LEGAL_OPERATOR_NAME", "[Your full legal name or company name]"),
    legalForm: env("LEGAL_LEGAL_FORM", "Einzelunternehmen / sole proprietorship"),
    streetAddress: env(
      "LEGAL_STREET_ADDRESS",
      "[Street and number — no P.O. Box]",
    ),
    postalCode: env("LEGAL_POSTAL_CODE", "[PLZ / ZIP]"),
    city: env("LEGAL_CITY", "[City]"),
    country: env("LEGAL_COUNTRY", "Germany"),
    email: env("LEGAL_CONTACT_EMAIL", "legal@immocaption.example"),
    phone: env("LEGAL_CONTACT_PHONE", "[+49 …]"),
    vatId: env("LEGAL_VAT_ID", "[USt-IdNr. if applicable, else “not applicable”]"),
    contentOfficer: env(
      "LEGAL_CONTENT_OFFICER",
      "[Name and address of responsible person per § 18 Abs. 2 MStV]",
    ),
    jurisdictionCity: env("LEGAL_JURISDICTION_CITY", "[Your city, Germany]"),
    lastUpdated: env("LEGAL_LAST_UPDATED", "2026-07-26"),
  };
}
