"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n-context";
import { LOCALES, type Locale } from "@/lib/i18n-config";

/**
 * Small PT/EN language toggle button.
 * Switches locale by navigating to the equivalent path with the other locale prefix.
 */
export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();

  // Strip current locale prefix from pathname to get the base path
  const basePath = stripLocalePrefix(pathname);

  function switchLocale(newLocale: Locale) {
    if (newLocale === locale) return;

    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;

    // Navigate to the new locale path
    window.location.href = `/${newLocale}${basePath}`;
  }

  const otherLocale = locale === "pt" ? "en" : "pt";

  return (
    <button
      onClick={() => switchLocale(otherLocale)}
      className="flex items-center gap-1 rounded-sm border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-white/50 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
      aria-label={`Switch to ${otherLocale === "pt" ? "Português" : "English"}`}
      title={otherLocale === "pt" ? "Português" : "English"}
    >
      <span className={locale === "pt" ? "text-primary font-bold" : ""}>PT</span>
      <span className="text-white/20">/</span>
      <span className={locale === "en" ? "text-primary font-bold" : ""}>EN</span>
    </button>
  );
}

function stripLocalePrefix(pathname: string): string {
  for (const loc of LOCALES) {
    if (pathname === `/${loc}`) return "/";
    if (pathname.startsWith(`/${loc}/`)) return pathname.slice(loc.length + 1);
  }
  return pathname;
}
