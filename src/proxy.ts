import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["pt", "en"] as const;
const DEFAULT_LOCALE = "pt";

function getLocaleFromRequest(request: NextRequest): string {
  // 1. Check cookie
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && LOCALES.includes(cookieLocale as (typeof LOCALES)[number])) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const acceptLang = request.headers.get("accept-language") || "";
  // Simple matching: check if any supported locale appears in the header
  for (const locale of LOCALES) {
    if (acceptLang.includes(locale)) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the pathname already has a locale prefix
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    // Extract locale from the path and set it as a cookie for persistence
    const locale = pathname.split("/")[1];
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
    return response;
  }

  // No locale in pathname — redirect to locale-prefixed URL
  const locale = getLocaleFromRequest(request);
  const newUrl = new URL(`/${locale}${pathname}${request.nextUrl.search}`, request.url);
  const response = NextResponse.redirect(newUrl);
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    // Match all paths except:
    // - API routes (/api/...)
    // - Next.js internals (/_next/...)
    // - Static files (files with extensions like .ico, .svg, .png, etc.)
    // - feed.xml, sitemap.xml, robots.txt
    "/((?!api|_next|feed\\.xml|sitemap\\.xml|robots\\.txt|favicon\\.ico|images|.*\\..*).*)",
  ],
};
