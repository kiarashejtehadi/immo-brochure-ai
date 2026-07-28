import { defineRouting } from "next-intl/routing";

export const appLocales = [
  "en",
  "de",
  "fr",
  "es",
  "it",
  "nl",
  "pl",
  "fa",
  "ar",
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
    "/imprint": {
      en: "/imprint",
      de: "/impressum",
      fr: "/mentions-legales",
      es: "/aviso-legal",
      it: "/note-legali",
      nl: "/colofon",
      pl: "/informacje-prawne",
      fa: "/imprint",
      ar: "/imprint",
    },
    "/privacy": {
      en: "/privacy",
      de: "/datenschutz",
      fr: "/confidentialite",
      es: "/privacidad",
      it: "/privacy",
      nl: "/privacy",
      pl: "/polityka-prywatnosci",
      fa: "/privacy",
      ar: "/privacy",
    },
    "/terms": {
      en: "/terms",
      de: "/agb",
      fr: "/conditions",
      es: "/terminos",
      it: "/termini",
      nl: "/voorwaarden",
      pl: "/regulamin",
      fa: "/terms",
      ar: "/terms",
    },
    "/checkout": {
      en: "/checkout",
      de: "/checkout",
      fr: "/checkout",
      es: "/checkout",
      it: "/checkout",
      nl: "/checkout",
      pl: "/checkout",
      fa: "/checkout",
      ar: "/checkout",
    },
    "/settings": {
      en: "/settings",
      de: "/settings",
      fr: "/settings",
      es: "/settings",
      it: "/settings",
      nl: "/settings",
      pl: "/settings",
      fa: "/settings",
      ar: "/settings",
    },
    "/cookie-preferences": {
      en: "/cookie-preferences",
      de: "/cookie-einstellungen",
      fr: "/cookies",
      es: "/cookies",
      it: "/cookie",
      nl: "/cookie-voorkeuren",
      pl: "/ustawienia-cookie",
      fa: "/cookie-preferences",
      ar: "/cookie-preferences",
    },
  },
});
