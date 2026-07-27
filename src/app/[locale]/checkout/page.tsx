import { CheckoutLegalConsent } from "@/components/legal/checkout-legal-consent";
import { PricingSection } from "@/components/billing/pricing-section";
import { isBillingEnabled, isLemonSqueezyConfigured } from "@/lib/billing/config";
import { getBillingStatusForClient } from "@/lib/billing/access";
import { setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  const billingEnabled = isBillingEnabled();
  const billingStatus = await getBillingStatusForClient();
  const paymentConfigured = isLemonSqueezyConfigured();

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-6 py-10">
      <PricingSection
        locale={locale}
        billingEnabled={billingEnabled}
        isSignedIn={Boolean(billingStatus.email)}
      />
      <CheckoutLegalConsent paymentConfigured={paymentConfigured || billingEnabled} />
    </div>
  );
}
