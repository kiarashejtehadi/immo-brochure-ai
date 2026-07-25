import "@/app/globals.css";
import { fontClassNames } from "@/lib/fonts";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CookieConsentBanner } from "@/components/legal/cookie-consent-banner";
import { SiteFooter } from "@/components/legal/site-footer";
import { routing, type AppLocale } from "@/i18n/routing";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const rtl = locale === "fa" || locale === "ar";

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"} className={fontClassNames}>
      <body className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        <NextIntlClientProvider messages={messages}>
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
