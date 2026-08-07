import { defineRouting } from "next-intl/routing";

export const appLocales = [
  "en",
  "de",
  "fr",
  "es",
  "it",
  "nl",
  "pl",
] as const;

export type AppLocale = (typeof appLocales)[number];

/** Locales with fully reviewed, legally binding master legal texts. */
export const bindingLegalLocales: AppLocale[] = ["en", "de"];

export const routing = defineRouting({
  locales: [...appLocales],
  defaultLocale: "en",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/create": "/create",
    "/imprint": {
      en: "/imprint",
      de: "/impressum",
      fr: "/mentions-legales",
      es: "/aviso-legal",
      it: "/note-legali",
      nl: "/colofon",
      pl: "/informacje-prawne",
    },
    "/privacy": {
      en: "/privacy",
      de: "/datenschutz",
      fr: "/confidentialite",
      es: "/privacidad",
      it: "/privacy",
      nl: "/privacy",
      pl: "/polityka-prywatnosci",
    },
    "/terms": {
      en: "/terms",
      de: "/agb",
      fr: "/conditions",
      es: "/terminos",
      it: "/termini",
      nl: "/voorwaarden",
      pl: "/regulamin",
    },
    "/checkout": {
      en: "/checkout",
      de: "/checkout",
      fr: "/checkout",
      es: "/checkout",
      it: "/checkout",
      nl: "/checkout",
      pl: "/checkout",
    },
    "/pricing": {
      en: "/pricing",
      de: "/pricing",
      fr: "/pricing",
      es: "/pricing",
      it: "/pricing",
      nl: "/pricing",
      pl: "/pricing",
    },
    "/settings": {
      en: "/settings",
      de: "/settings",
      fr: "/settings",
      es: "/settings",
      it: "/settings",
      nl: "/settings",
      pl: "/settings",
    },
    "/settings/account": {
      en: "/settings/account",
      de: "/settings/account",
      fr: "/settings/account",
      es: "/settings/account",
      it: "/settings/account",
      nl: "/settings/account",
      pl: "/settings/account",
    },
    "/cookie-preferences": {
      en: "/cookie-preferences",
      de: "/cookie-einstellungen",
      fr: "/cookies",
      es: "/cookies",
      it: "/cookie",
      nl: "/cookie-voorkeuren",
      pl: "/ustawienia-cookie",
    },
  },
});
