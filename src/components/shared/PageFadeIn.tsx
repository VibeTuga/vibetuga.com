"use client";

import { useState, type ReactNode } from "react";

export function PageFadeIn({ children }: { children: ReactNode }) {
  const [prefersReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

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
