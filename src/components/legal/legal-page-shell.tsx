import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

export async function LegalPageShell({
  children,
  lastUpdated,
}: {
  children: ReactNode;
  lastUpdated: string;
}) {
  const t = await getTranslations("legal");

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <p className="mb-6 text-xs text-zinc-500">
        {t("lastUpdated")}: {lastUpdated}
      </p>
      {children}
      <p className="mt-10 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-800">
        <Link href="/create" className="font-medium text-zinc-900 underline dark:text-zinc-100">
          ← {t("backToStudio")}
        </Link>
      </p>
    </div>
  );
}
