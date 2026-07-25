import { getConvenienceNotice } from "@/lib/legal/get-legal-document";
import type { LegalDocument } from "@/types/legal-content";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LegalConvenienceNotice({
  requestedLocale,
  document,
}: {
  requestedLocale: AppLocale;
  document: LegalDocument;
}) {
  if (!document.showConvenienceNotice) return null;
  const notice = getConvenienceNotice(requestedLocale, document.locale);
  return (
    <div
      role="note"
      className={cn(
        "mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950",
        "dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
      )}
    >
      <p className="font-semibold">{notice.title}</p>
      <p className="mt-1 leading-relaxed">{notice.body}</p>
    </div>
  );
}
