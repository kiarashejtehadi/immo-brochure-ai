"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useBillingStatus } from "@/hooks/use-billing-status";

function CheckoutReturnRedirectInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;
    router.replace({ pathname: "/create", query: { checkout: "success" } });
  }, [searchParams, router]);

  return null;
}

/** Subscribed users should not linger on checkout unless buying credits. */
function CheckoutSubscribedRedirectInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status, loading, isSignedIn } = useBillingStatus();

  useEffect(() => {
    if (loading || !isSignedIn || !status?.hasActiveSubscription) return;
    if (searchParams.get("checkout") === "success") return;
    if (searchParams.get("plan") === "credits_pack") return;
    router.replace("/create");
  }, [isSignedIn, loading, router, searchParams, status?.hasActiveSubscription]);

  return null;
}

/** Sends legacy Lemon Squeezy return URLs on /checkout to the studio home. */
export function CheckoutReturnRedirect() {
  return (
    <Suspense fallback={null}>
      <CheckoutReturnRedirectInner />
      <CheckoutSubscribedRedirectInner />
    </Suspense>
  );
}
