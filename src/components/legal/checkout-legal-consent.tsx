"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function CheckoutLegalConsent({
  onProceed,
  paymentConfigured,
}: {
  onProceed?: () => void;
  paymentConfigured: boolean;
}) {
  const t = useTranslations("checkout");
  const tf = useTranslations("footer");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [withdrawalAccepted, setWithdrawalAccepted] = useState(false);
  const canPay = termsAccepted && withdrawalAccepted;

  return (
    <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>
      </div>

      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {t("planLabel")}
      </p>

      <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
        <label className="flex cursor-pointer gap-3">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300"
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
        <label className="flex cursor-pointer gap-3">
          <input
            type="checkbox"
            checked={withdrawalAccepted}
            onChange={(e) => setWithdrawalAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300"
          />
          <span>{t("withdrawalCheckbox")}</span>
        </label>
      </div>

      {!canPay ? (
        <p className="text-xs text-zinc-500">{t("payDisabledHint")}</p>
      ) : null}

      <button
        type="button"
        disabled={!canPay || !paymentConfigured}
        onClick={() => {
          if (canPay && paymentConfigured) onProceed?.();
        }}
        className={cn(
          "w-full rounded-lg py-3 text-sm font-semibold transition",
          canPay && paymentConfigured
            ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            : "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800",
        )}
      >
        {t("payButton")}
      </button>

      {!paymentConfigured ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          {t("paymentNotConfigured")}
        </p>
      ) : null}
    </div>
  );
}
