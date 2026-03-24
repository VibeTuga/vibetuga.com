"use client";

import { useEffect } from "react";

/**
 * Syncs the <html lang> attribute on client-side navigations.
 * Ensures accessibility tools see the correct language after locale changes.
 */
export function LangSync({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
