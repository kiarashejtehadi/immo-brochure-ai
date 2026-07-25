import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import {
  hasValidBetaAccess,
  isBetaProtectionEnabled,
  isBetaPublicPath,
} from "@/lib/beta-auth";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isBetaPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (isBetaProtectionEnabled()) {
    const granted = await hasValidBetaAccess(request);
    if (!granted) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/beta-login";
      loginUrl.search = "";
      const redirectPath = `${pathname}${request.nextUrl.search}`;
      loginUrl.searchParams.set("redirect", redirectPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
