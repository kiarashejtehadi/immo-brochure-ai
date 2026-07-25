"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  isAnalyticsEnabledInDeployment,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/legal/cookie-consent";

export function CookiePreferencesForm() {
  const t = useTranslations("cookies");
  const [analytics, setAnalytics] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = readCookieConsent();
    if (existing) setAnalytics(existing.analytics);
  }, []);

  function save() {
    writeCookieConsent(analytics);
    setSaved(true);
  }

  const analyticsDeploy = isAnalyticsEnabledInDeployment();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {t("preferencesTitle")}
      </h1>
      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
          {t("necessaryTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {t("necessaryDesc")}
        </p>
      </section>
      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
              {t("analyticsTitle")}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t("analyticsDesc")}
            </p>
            {!analyticsDeploy ? (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                {t("analyticsOffNotice")}
              </p>
            ) : null}
          </div>
          <input
            type="checkbox"
            checked={analytics}
            disabled={!analyticsDeploy}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="mt-1 h-4 w-4"
            aria-label={t("analyticsTitle")}
          />
        </div>
      </section>
      <button
        type="button"
        onClick={save}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        {t("save")}
      </button>
      {saved ? (
        <p className="text-sm text-green-700 dark:text-green-400" role="status">
          OK
        </p>
      ) : null}
    </div>
  );
}
