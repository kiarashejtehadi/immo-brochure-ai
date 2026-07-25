import type { AbstractIntlMessages } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing, type AppLocale } from "@/i18n/routing";

function mergeMessages(
  base: AbstractIntlMessages,
  override: AbstractIntlMessages,
): AbstractIntlMessages {
  const out: AbstractIntlMessages = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = base[key];
    const overrideVal = override[key];
    if (
      overrideVal &&
      typeof overrideVal === "object" &&
      !Array.isArray(overrideVal) &&
      baseVal &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      out[key] = mergeMessages(
        baseVal as AbstractIntlMessages,
        overrideVal as AbstractIntlMessages,
      );
    } else {
      out[key] = overrideVal;
    }
  }
  return out;
}

async function loadMessages(locale: AppLocale): Promise<AbstractIntlMessages> {
  const en = (await import("../../messages/en.json")).default as AbstractIntlMessages;
  if (locale === "en") {
    return en;
  }
  if (locale === "de") {
    return (await import("../../messages/de.json")).default as AbstractIntlMessages;
  }
  try {
    const partial = (await import(`../../messages/${locale}.json`))
      .default as AbstractIntlMessages;
    return mergeMessages(en, partial);
  } catch {
    return en;
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await loadMessages(locale as AppLocale),
  };
});
