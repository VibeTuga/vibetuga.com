"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n-config";

// Import both dictionaries statically for client-side use
import ptMessages from "../../messages/pt.json";
import enMessages from "../../messages/en.json";

type Messages = typeof ptMessages;

const messagesMap: Record<string, Messages> = {
  pt: ptMessages,
  en: enMessages,
};

// ─── Locale Context ─────────────────────────────────────────

const LocaleContext = createContext<Locale>("pt");

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

// ─── Translation Hook ───────────────────────────────────────

/**
 * Access a nested namespace of the translation dictionary.
 * Usage: const t = useTranslations("nav"); t("home") => "Home"
 */
export function useTranslations(namespace?: string) {
  const locale = useLocale();
  const messages = messagesMap[locale] ?? messagesMap.pt;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let section: any = messages;
  if (namespace) {
    for (const key of namespace.split(".")) {
      section = section?.[key];
    }
  }

  return function t(key: string, params?: Record<string, string>): string {
    const keys = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = section;
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value !== "string") return key;
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, name: string) => params[name] ?? `{${name}}`);
    }
    return value;
  };
}
