"use client";

import { useState } from "react";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { AuthEmailModal } from "@/components/billing/auth-email-modal";
import type { MarketingCopy } from "@/lib/i18n-marketing";
import { scrollToSection } from "@/lib/i18n-marketing";
import { LOCALE_LABELS, UI_LOCALES, type UiLocale } from "@/lib/i18n";
import { btnPrimary } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "features", labelKey: "navFeatures" as const },
  { id: "how-it-works", labelKey: "navHowItWorks" as const },
  { id: "pricing", labelKey: "navPricing" as const },
];

export function MarketingNavbar({
  copy,
  locale,
  onSignIn,
}: {
  copy: MarketingCopy;
  locale: UiLocale;
  onSignIn?: () => void;
}) {
  const [authOpen, setAuthOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  function handleSignIn() {
    if (onSignIn) {
      onSignIn();
      return;
    }
    setAuthOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <div className="min-w-0">
            <Link
              href="/"
              className="truncate text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              {copy.brandName}
            </Link>
          </div>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Marketing"
          >
            {NAV_ITEMS.map(({ id, labelKey }) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                {copy[labelKey]}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <label className="sr-only" htmlFor="marketing-nav-locale">
              Language
            </label>
            <select
              id="marketing-nav-locale"
              value={locale}
              onChange={(e) =>
                router.replace(pathname, { locale: e.target.value as UiLocale })
              }
              className="hidden rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs md:block dark:border-zinc-700 dark:bg-zinc-900"
            >
              {UI_LOCALES.map((loc) => (
                <option key={loc} value={loc}>
                  {LOCALE_LABELS[loc]}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSignIn}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              {copy.navSignIn}
            </button>

            <Link href="/create" className={cn(btnPrimary, "px-4 py-2 text-sm shadow-sm")}>
              {copy.navTryFree}
            </Link>
          </div>
        </div>

        <nav
          className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-6 pb-3 md:hidden"
          aria-label="Marketing mobile"
        >
          {NAV_ITEMS.map(({ id, labelKey }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className="shrink-0 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            >
              {copy[labelKey]}
            </button>
          ))}
          <Link
            href="/create"
            className="ml-auto shrink-0 rounded-full border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            {copy.navTryFree}
          </Link>
          <label className="sr-only" htmlFor="marketing-nav-locale-mobile">
            Language
          </label>
          <select
            id="marketing-nav-locale-mobile"
            value={locale}
            onChange={(e) =>
              router.replace(pathname, { locale: e.target.value as UiLocale })
            }
            className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {UI_LOCALES.map((loc) => (
              <option key={loc} value={loc}>
                {LOCALE_LABELS[loc]}
              </option>
            ))}
          </select>
        </nav>
      </header>

      <AuthEmailModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}
