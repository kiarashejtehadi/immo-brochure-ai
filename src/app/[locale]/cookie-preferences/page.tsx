import { CookiePreferencesForm } from "@/components/legal/cookie-preferences-form";
import { setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";

export default async function CookiePreferencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
      <CookiePreferencesForm />
    </div>
  );
}
