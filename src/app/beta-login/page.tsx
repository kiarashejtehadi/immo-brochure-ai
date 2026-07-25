import { BetaLoginForm } from "./beta-login-form";
import {
  BETA_ACCESS_COOKIE,
  isBetaCookieValid,
  isBetaProtectionEnabled,
  sanitizeBetaRedirect,
} from "@/lib/beta-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function BetaLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = sanitizeBetaRedirect(redirectParam);

  if (!isBetaProtectionEnabled()) {
    redirect(redirectTo);
  }

  const cookieStore = await cookies();
  const granted = await isBetaCookieValid(
    cookieStore.get(BETA_ACCESS_COOKIE)?.value,
  );

  if (granted) {
    redirect(redirectTo);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          ImmoCaption AI
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Beta access</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          This preview is password-protected. Enter the beta password shared with
          you to continue.
        </p>
        <BetaLoginForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
