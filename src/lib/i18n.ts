import "server-only";
import { cookies, headers } from "next/headers";
import { LOCALES, DEFAULT_LOCALE, isValidLocale } from "./i18n-config";
import type { Locale } from "./i18n-config";

// Re-export shared config for server-side convenience
export { LOCALES, DEFAULT_LOCALE, isValidLocale };
export type { Locale };

// Type for the dictionary shape (inferred from pt.json)
export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

const dictionaries: Record<Locale, () => Promise<Record<string, unknown>>> = {
  pt: () => import("../../messages/pt.json").then((m) => m.default),
  en: () => import("../../messages/en.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]() as Promise<typeof import("../../messages/pt.json")>;
}

/**
 * Read the current locale from the NEXT_LOCALE cookie (set by proxy.ts).
 * Falls back to Accept-Language header detection, then DEFAULT_LOCALE.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  if (localeCookie && isValidLocale(localeCookie)) {
    return localeCookie;
  }

  // Try Accept-Language header
  const headerStore = await headers();
  const acceptLang = headerStore.get("accept-language") || "";
  for (const locale of LOCALES) {
    if (acceptLang.includes(locale)) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}
