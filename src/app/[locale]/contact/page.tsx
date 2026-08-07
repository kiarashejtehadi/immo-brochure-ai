import { ContactForm } from "@/components/legal/contact-form";
import { CopyToastProvider } from "@/components/ui/copy-toast";
import type { AppLocale } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);
  const t = await getTranslations("contact");

  return (
    <CopyToastProvider>
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t("subtitle")}
          </p>
        </header>
        <ContactForm />
      </div>
    </CopyToastProvider>
  );
}
