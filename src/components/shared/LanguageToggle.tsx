"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(newLocale: string) {
    if (newLocale === locale) return;
    document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 bg-surface-container rounded-sm border border-white/5",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => switchLocale("pt")}
        disabled={isPending}
        className={cn(
          "px-2 py-1 text-[10px] font-mono uppercase tracking-widest transition-colors",
          locale === "pt" ? "text-primary bg-primary/10" : "text-white/40 hover:text-white/60",
          isPending && "opacity-50",
        )}
        aria-label="Português"
      >
        PT
      </button>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        disabled={isPending}
        className={cn(
          "px-2 py-1 text-[10px] font-mono uppercase tracking-widest transition-colors",
          locale === "en" ? "text-primary bg-primary/10" : "text-white/40 hover:text-white/60",
          isPending && "opacity-50",
        )}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
