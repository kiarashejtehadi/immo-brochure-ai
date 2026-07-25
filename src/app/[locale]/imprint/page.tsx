import { LegalConvenienceNotice } from "@/components/legal/legal-convenience-notice";
import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { getLegalDocument } from "@/lib/legal/get-legal-document";
import type { AppLocale } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

export default async function ImprintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const doc = getLegalDocument("imprint", locale as AppLocale);

  return (
    <LegalPageShell lastUpdated={doc.lastUpdated}>
      <LegalConvenienceNotice requestedLocale={locale as AppLocale} document={doc} />
      <LegalDocumentView document={doc} />
    </LegalPageShell>
  );
}
