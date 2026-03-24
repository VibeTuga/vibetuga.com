import type { Metadata } from "next";
import { Geist, Space_Grotesk, Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from "@/lib/utils";
import { CookieConsent } from "@/components/shared/CookieConsent";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={cn(
        "dark h-full antialiased",
        geist.variable,
        spaceGrotesk.variable,
        inter.variable,
      )}
    >
      <body className="scanlines min-h-full flex flex-col bg-background text-on-background font-body selection:bg-primary selection:text-on-primary">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:font-bold focus:text-sm focus:rounded-sm focus:outline-none"
        >
          Saltar para o conteúdo
        </a>
        {children}
        <CookieConsent />
        <SpeedInsights />
      </body>
    </html>
  );
}
