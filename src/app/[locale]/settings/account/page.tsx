import { AccountSettingsPage } from "@/components/settings/account-settings-page";
import { setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";

export default async function AccountSettingsRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <AccountSettingsPage locale={locale} />
    </div>
  );
}
