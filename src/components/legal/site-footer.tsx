"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 text-sm text-zinc-600 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between dark:text-zinc-400">
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/imprint" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            {t("imprint")}
          </Link>
          <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            {t("privacy")}
          </Link>
          <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            {t("terms")}
          </Link>
          <Link
            href="/cookie-preferences"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {t("cookies")}
          </Link>
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            {t("studio")}
          </Link>
        </nav>
        <p className="text-xs">
          © {year} ImmoCaption AI — {t("rights")}
        </p>
      </div>
    </footer>
  );
}
