"use client";

import { Link } from "@/i18n/navigation";
import { PricingSection } from "@/components/billing/pricing-section";
import { isBillingEnabled } from "@/lib/billing/config";
import { cn } from "@/lib/utils";

export function UpgradeProModal({
  open,
  onClose,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  locale: string;
}) {
  const billingEnabled = isBillingEnabled();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-pro-title"
    >
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="upgrade-pro-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Upgrade to Pro
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Unlock custom logo & brand colors, remove PDF watermarks, and unlimited generation with a
              monthly or yearly plan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
        {billingEnabled ? (
          <div className="mt-6">
            <PricingSection locale={locale} billingEnabled />
          </div>
        ) : (
          <p className="mt-4 text-sm text-amber-800 dark:text-amber-200">
            Billing is not enabled on this deployment.
          </p>
        )}
        <p className="mt-4 text-center text-xs text-zinc-500">
          Or{" "}
          <Link href="/checkout" className="underline" onClick={onClose}>
            open checkout
          </Link>
        </p>
      </div>
    </div>
  );
}

export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white",
        className,
      )}
    >
      Pro
    </span>
  );
}
