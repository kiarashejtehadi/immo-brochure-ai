import { Suspense } from "react";
import { AuthCallbackClient } from "./auth-callback-client";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[40vh] max-w-md items-center justify-center px-6">
          <p className="text-sm text-zinc-600">Signing you in…</p>
        </main>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
