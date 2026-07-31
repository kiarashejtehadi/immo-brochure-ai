"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { Lock } from "lucide-react";
import { isCreditPackPlan } from "@/lib/billing/client-access";
import { useBillingStatus } from "@/hooks/use-billing-status";
import { cn } from "@/lib/utils";

export function SettingsNav() {
  const pathname = usePathname();
  const { status } = useBillingStatus();
  const brandingLocked = isCreditPackPlan(status);
  const onBranding = pathname === "/settings";

  return (
    <nav
      className="mb-8 flex gap-2 border-b border-zinc-200 dark:border-zinc-800"
      aria-label="Settings"
    >
      <Link
        href="/settings"
        className={cn(
          "relative -mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition",
          onBranding
            ? "border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300"
            : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
        )}
      >
        Branding
        {brandingLocked ? (
          <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-label="Pro feature" />
        ) : null}
      </Link>
      <Link
        href="/pricing"
        className="-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Plans &amp; billing
      </Link>
    </nav>
  );
}
