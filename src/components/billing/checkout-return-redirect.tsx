"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

function CheckoutReturnRedirectInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;
    router.replace({ pathname: "/", query: { checkout: "success" } });
  }, [searchParams, router]);

  return null;
}

/** Sends legacy Lemon Squeezy return URLs on /checkout to the studio home. */
export function CheckoutReturnRedirect() {
  return (
    <Suspense fallback={null}>
      <CheckoutReturnRedirectInner />
    </Suspense>
  );
}
