import { CheckoutLegalConsent } from "@/components/legal/checkout-legal-consent";
import { setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);

  const stripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
      <CheckoutLegalConsent stripeConfigured={stripeConfigured} />
    </div>
  );
}
