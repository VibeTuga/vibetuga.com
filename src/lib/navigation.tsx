"use client";

import NextLink from "next/link";
import { useLocale } from "@/lib/i18n-context";
import { DEFAULT_LOCALE } from "@/lib/i18n-config";
import type { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof NextLink>;

/**
 * Locale-aware Link that prepends the current locale to absolute paths.
 * For the default locale (pt), the prefix is still added for consistency.
 *
 * Usage: <Link href="/blog">Blog</Link>
 * Renders as: <a href="/pt/blog">Blog</a> or <a href="/en/blog">Blog</a>
 */
export function Link({ href, ...props }: LinkProps) {
  const locale = useLocale();

  let localizedHref = href;

  if (typeof href === "string" && href.startsWith("/")) {
    // Don't double-prefix if already has locale
    const hasLocalePrefix =
      href.startsWith("/pt/") || href.startsWith("/en/") || href === "/pt" || href === "/en";
    if (!hasLocalePrefix) {
      localizedHref = `/${locale}${href}`;
    }
  } else if (typeof href === "object" && typeof href.pathname === "string") {
    const pathname = href.pathname;
    const hasLocalePrefix =
      pathname.startsWith("/pt/") ||
      pathname.startsWith("/en/") ||
      pathname === "/pt" ||
      pathname === "/en";
    if (pathname.startsWith("/") && !hasLocalePrefix) {
      localizedHref = { ...href, pathname: `/${locale}${pathname}` };
    }
  }

  return <NextLink href={localizedHref} {...props} />;
}

/**
 * Get a locale-prefixed path for use in server components or plain JS.
 */
export function localePath(path: string, locale?: string): string {
  const loc = locale ?? DEFAULT_LOCALE;
  if (path.startsWith("/")) {
    return `/${loc}${path}`;
  }
  return path;
}
