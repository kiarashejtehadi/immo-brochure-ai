"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "inline" | "panel";

export function PricingLegalNotice({
  variant = "panel",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const t = useTranslations("checkout");
  const tf = useTranslations("footer");

  if (variant === "inline") {
    return (
      <p className={cn("text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400", className)}>
        {t("purchaseLegalInline")}{" "}
        <Link href="/terms" className="underline">
          {tf("terms")}
        </Link>{" "}
        &{" "}
        <Link href="/privacy" className="underline">
          {tf("privacy")}
        </Link>
        . {t("withdrawalInline")}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60",
        className,
      )}
    >
      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t("legalHeading")}</p>
      <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>
          {t("termsCheckbox")}{" "}
          <Link href="/terms" className="underline">
            {tf("terms")}
          </Link>{" "}
          /{" "}
          <Link href="/privacy" className="underline">
            {tf("privacy")}
          </Link>
        </li>
        <li>{t("withdrawalCheckbox")}</li>
      </ul>
      <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-500">{t("purchaseLegalHint")}</p>
    </div>
  );
}
