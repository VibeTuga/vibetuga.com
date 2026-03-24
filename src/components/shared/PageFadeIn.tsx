"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function PageFadeIn({ children }: { children: ReactNode }) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        animation: "fade-in 0.35s ease-out both",
      }}
    >
      {children}
    </div>
  );
}
