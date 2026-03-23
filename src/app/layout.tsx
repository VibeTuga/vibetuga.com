import type { Metadata } from "next";
import { Geist, Space_Grotesk, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
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
        {children}
      </body>
    </html>
  );
}
