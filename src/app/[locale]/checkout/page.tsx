import { CheckoutReturnRedirect } from "@/components/billing/checkout-return-redirect";
import { AccountBar } from "@/components/billing/account-bar";
import { BillingAccountSummary } from "@/components/billing/billing-account-summary";
import { CheckoutLegalConsent } from "@/components/legal/checkout-legal-consent";
import { PricingSection } from "@/components/billing/pricing-section";
import { isBillingEnabled, isLemonSqueezyConfigured } from "@/lib/billing/config";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  const billingEnabled = isBillingEnabled();
  const paymentConfigured = isLemonSqueezyConfigured();

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-6 py-10">
      <CheckoutReturnRedirect />
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
            ← Back to studio
          </Link>
        </div>
        <AccountBar locale={locale} />
      </header>
      <BillingAccountSummary />
      <PricingSection locale={locale} billingEnabled={billingEnabled} />
      <CheckoutLegalConsent paymentConfigured={paymentConfigured || billingEnabled} />
    </div>
  );
}
