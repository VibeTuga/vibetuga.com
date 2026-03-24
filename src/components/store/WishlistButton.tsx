"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function WishlistButton({
  productId,
  initialWishlisted = false,
  size = "md",
  className,
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    setWishlisted((prev) => !prev);

    startTransition(async () => {
      try {
        const res = await fetch("/api/store/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (!res.ok) {
          // Revert on error
          setWishlisted((prev) => !prev);
        }
      } catch {
        setWishlisted((prev) => !prev);
      }
    });
  }

  const iconSize = size === "sm" ? 16 : 20;

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-200",
        size === "sm" ? "w-8 h-8" : "w-10 h-10",
        wishlisted
          ? "bg-error/20 text-error hover:bg-error/30"
          : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70",
        isPending && "opacity-50",
        className,
      )}
      aria-label={wishlisted ? "Remover da lista de desejos" : "Adicionar à lista de desejos"}
      title={wishlisted ? "Remover da lista de desejos" : "Adicionar à lista de desejos"}
    >
      <Heart size={iconSize} className={cn("transition-all", wishlisted && "fill-current")} />
    </button>
  );
}
