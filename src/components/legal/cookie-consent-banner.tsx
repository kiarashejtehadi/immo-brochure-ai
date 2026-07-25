"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  isAnalyticsEnabledInDeployment,
  shouldShowCookieBanner,
  writeCookieConsent,
} from "@/lib/legal/cookie-consent";

export function CookieConsentBanner() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(shouldShowCookieBanner());
  }, []);

  if (!visible) return null;

  function acceptNecessaryOnly() {
    writeCookieConsent(false);
    setVisible(false);
  }

  const analyticsPossible = isAnalyticsEnabledInDeployment();

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p id="cookie-banner-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {t("bannerTitle")}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t("bannerBody")}
            {!analyticsPossible ? ` ${t("analyticsOffNotice")}` : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={acceptNecessaryOnly}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {t("acceptNecessary")}
          </button>
          <Link
            href="/cookie-preferences"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-900"
            onClick={() => setVisible(false)}
          >
            {t("manage")}
          </Link>
        </div>
      </div>
    </div>
  );
}
