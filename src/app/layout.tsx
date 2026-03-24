import type { Metadata } from "next";
import { Geist, Space_Grotesk, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import { isValidLocale } from "@/lib/i18n";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VibeTuga | Onde o código encontra a vibe",
  description:
    "A comunidade portuguesa de vibe coding, AI tooling e desenvolvimento assistido por agentes. Aprende, partilha e constrói o futuro da programação assistida por IA.",
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const lang = localeCookie && isValidLocale(localeCookie) ? localeCookie : "pt";

  return (
    <html
      lang={lang}
      className={cn(
        "dark h-full antialiased",
        geist.variable,
        spaceGrotesk.variable,
        inter.variable,
      )}
    >
      <body className="scanlines min-h-full flex flex-col bg-background text-on-background font-body selection:bg-primary selection:text-on-primary">
        {children}
      </body>
    </html>
  );
}
