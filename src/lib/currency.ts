import type { UiLocale } from "@/lib/i18n";

export const CURRENCY_CODES = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "CAD",
  "AUD",
  "AED",
  "SAR",
  "IRR",
  "TRY",
  "PLN",
] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

/** Currencies selectable when UI is English */
export const ENGLISH_CURRENCY_OPTIONS: CurrencyCode[] = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "CAD",
  "AUD",
  "AED",
  "SAR",
  "IRR",
  "TRY",
  "PLN",
];

const LOCALE_DEFAULT_CURRENCY: Record<UiLocale, CurrencyCode> = {
  en: "EUR",
  de: "EUR",
  fr: "EUR",
  es: "EUR",
  it: "EUR",
  nl: "EUR",
  pl: "PLN",
};

const INTL_LOCALE: Record<CurrencyCode, string> = {
  EUR: "de-DE",
  USD: "en-US",
  GBP: "en-GB",
  CHF: "de-CH",
  CAD: "en-CA",
  AUD: "en-AU",
  AED: "ar-AE",
  SAR: "ar-SA",
  IRR: "fa-IR",
  TRY: "tr-TR",
  PLN: "pl-PL",
};

export function getDefaultCurrencyForLocale(locale: UiLocale): CurrencyCode {
  return LOCALE_DEFAULT_CURRENCY[locale];
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (CURRENCY_CODES as readonly string[]).includes(value);
}

export function normalizeCurrency(
  value: string | undefined,
  fallback: CurrencyCode = "EUR",
): CurrencyCode {
  if (value && isCurrencyCode(value)) return value;
  return fallback;
}

export function formatPriceAmount(
  amount: string,
  currency: CurrencyCode,
  priceOnRequestLabel = "Price on request",
): string {
  const n = Number(amount);
  if (!amount.trim() || Number.isNaN(n)) return priceOnRequestLabel;
  try {
    return new Intl.NumberFormat(INTL_LOCALE[currency], {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "IRR" ? 0 : 0,
    }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

export function getCurrencyLabel(code: CurrencyCode): string {
  return code;
}

/** Stable labels for SSR (avoid Intl hydration mismatches in <option> text). */
export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  EUR: "Euro (EUR)",
  USD: "US Dollar (USD)",
  GBP: "British Pound (GBP)",
  CHF: "Swiss Franc (CHF)",
  CAD: "Canadian Dollar (CAD)",
  AUD: "Australian Dollar (AUD)",
  AED: "UAE Dirham (AED)",
  SAR: "Saudi Riyal (SAR)",
  IRR: "Iranian Rial (IRR)",
  TRY: "Turkish Lira (TRY)",
  PLN: "Polish Zloty (PLN)",
};
