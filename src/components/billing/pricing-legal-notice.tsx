"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "inline" | "panel";

export function PricingLegalNotice({
  variant = "panel",
  className,
  termsAccepted,
  withdrawalAccepted,
  onTermsAcceptedChange,
  onWithdrawalAcceptedChange,
  highlightMissing = false,
}: {
  variant?: Variant;
  className?: string;
  termsAccepted?: boolean;
  withdrawalAccepted?: boolean;
  onTermsAcceptedChange?: (accepted: boolean) => void;
  onWithdrawalAcceptedChange?: (accepted: boolean) => void;
  highlightMissing?: boolean;
}) {
  const t = useTranslations("checkout");
  const tf = useTranslations("footer");
  const interactive = onTermsAcceptedChange != null && onWithdrawalAcceptedChange != null;

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
      id="pricing-legal-notice"
      className={cn(
        "rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 transition dark:border-zinc-800 dark:bg-zinc-900/60",
        highlightMissing && "border-amber-400 ring-2 ring-amber-400/40 dark:border-amber-600",
        className,
      )}
    >
      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t("legalHeading")}</p>
      <ul className="mt-2 space-y-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>
          {interactive ? (
            <label className="flex cursor-pointer gap-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => onTermsAcceptedChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300"
              />
              <span>
                {t("termsCheckbox")}{" "}
                <Link href="/terms" className="underline">
                  {tf("terms")}
                </Link>{" "}
                /{" "}
                <Link href="/privacy" className="underline">
                  {tf("privacy")}
                </Link>
              </span>
            </label>
          ) : (
            <>
              {t("termsCheckbox")}{" "}
              <Link href="/terms" className="underline">
                {tf("terms")}
              </Link>{" "}
              /{" "}
              <Link href="/privacy" className="underline">
                {tf("privacy")}
              </Link>
            </>
          )}
        </li>
        <li>
          {interactive ? (
            <label className="flex cursor-pointer gap-2">
              <input
                type="checkbox"
                checked={withdrawalAccepted}
                onChange={(e) => onWithdrawalAcceptedChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300"
              />
              <span>{t("withdrawalCheckbox")}</span>
            </label>
          ) : (
            t("withdrawalCheckbox")
          )}
        </li>
      </ul>
      {highlightMissing ? (
        <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300" role="alert">
          {t("payDisabledHint")}
        </p>
      ) : (
        <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-500">{t("purchaseLegalHint")}</p>
      )}
    </div>
  );
}
