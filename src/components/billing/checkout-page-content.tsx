import { CheckoutReturnRedirect } from "@/components/billing/checkout-return-redirect";
import { AccountBar } from "@/components/billing/account-bar";
import { BillingAccountSummary } from "@/components/billing/billing-account-summary";
import { PricingSection } from "@/components/billing/pricing-section";
import { isBillingEnabled } from "@/lib/billing/config";
import { getBillingCopy } from "@/lib/i18n-billing";
import type { UiLocale } from "@/lib/i18n";
import { Link } from "@/i18n/navigation";

export function CheckoutPageContent({ locale }: { locale: string }) {
  const billingEnabled = isBillingEnabled();
  const copy = getBillingCopy(locale as UiLocale);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-6 py-10">
      <CheckoutReturnRedirect />
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <Link href="/create" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
            {copy.backToStudio}
          </Link>
        </div>
        <AccountBar locale={locale} />
      </header>
      <BillingAccountSummary locale={locale} />
      <PricingSection locale={locale} billingEnabled={billingEnabled} />
    </div>
  );
}
