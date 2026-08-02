"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { AuthEmailModal } from "@/components/billing/auth-email-modal";
import { MarketingNavbar } from "@/components/marketing-navbar";
import { WorkspaceMarketing } from "@/components/workspace-marketing";
import { isBillingEnabled } from "@/lib/billing/config";
import { getMarketingCopy } from "@/lib/i18n-marketing";
import type { UiLocale } from "@/lib/i18n";

export function LandingPage() {
  const locale = useLocale() as UiLocale;
  const router = useRouter();
  const marketingCopy = getMarketingCopy(locale);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-zinc-50 to-zinc-50 text-zinc-900 dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-950 dark:text-zinc-50">
      <MarketingNavbar
        copy={marketingCopy}
        locale={locale}
        onSignIn={() => setAuthOpen(true)}
      />
      <WorkspaceMarketing
        copy={marketingCopy}
        locale={locale}
        billingEnabled={isBillingEnabled()}
        onSeeSample={() => router.push({ pathname: "/create", query: { demo: "1" } })}
      />
      <AuthEmailModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSent={() => setAuthOpen(false)}
      />
    </div>
  );
}
