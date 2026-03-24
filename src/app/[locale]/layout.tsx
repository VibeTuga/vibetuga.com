import { notFound } from "next/navigation";
import { LocaleProvider } from "@/lib/i18n-context";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { LangSync } from "@/components/shared/LangSync";

export function generateStaticParams() {
  return [{ locale: "pt" }, { locale: "en" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <LocaleProvider locale={locale as Locale}>
      <LangSync locale={locale} />
      {children}
    </LocaleProvider>
  );
}
