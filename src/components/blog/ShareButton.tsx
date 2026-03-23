"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

type ShareButtonProps = {
  title: string;
  url: string;
  excerpt?: string;
};

export function ShareButton({ title, url, excerpt }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt ?? title,
          url,
        });
      } catch {
        // User cancelled or share failed — silently ignore
      }
      return;
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <button
      onClick={handleShare}
      className="group flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-widest transition-all text-white/40 hover:text-primary hover:bg-primary/5"
      aria-label="Partilhar"
    >
      <Share2 size={16} />
      {copied ? "Link copiado!" : "Partilhar"}
    </button>
  );
}
