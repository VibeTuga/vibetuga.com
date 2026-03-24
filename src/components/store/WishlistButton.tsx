"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initialWishlisted,
  isAuthenticated,
}: {
  productId: string;
  initialWishlisted: boolean;
  isAuthenticated: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (!isAuthenticated) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/store/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (!res.ok) return;

        const data = await res.json();
        setWishlisted(data.added);
      } catch {
        // silently fail
      }
    });
  }

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 w-full justify-center px-4 py-3 text-xs font-mono uppercase tracking-widest transition-all duration-300 border",
        wishlisted
          ? "border-secondary/40 text-secondary bg-secondary/10 hover:bg-secondary/20"
          : "border-white/10 text-white/50 hover:text-secondary hover:border-secondary/30",
        isPending && "opacity-50 cursor-not-allowed",
      )}
      aria-label={wishlisted ? "Remover da lista de desejos" : "Adicionar à lista de desejos"}
    >
      <Heart size={16} className={wishlisted ? "fill-secondary" : ""} />
      {wishlisted ? "Na Lista de Desejos" : "Adicionar aos Desejos"}
    </button>
  );
}
