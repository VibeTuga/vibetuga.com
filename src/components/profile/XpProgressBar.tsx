"use client";

import { useRef, useEffect, useState } from "react";

interface XpProgressBarProps {
  progressPct: number;
}

export function XpProgressBar({ progressPct }: XpProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [prefersReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const el = barRef.current;
    if (!el || prefersReduced) {
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReduced]);

  return (
    <div
      ref={barRef}
      className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mb-3"
    >
      <div
        className="h-full bg-primary shadow-[0_0_10px_rgba(161,255,194,0.5)]"
        style={{
          width: visible ? `${progressPct}%` : "0%",
          transition: prefersReduced ? "none" : "width 0.8s ease-out 0.4s",
        }}
      />
    </div>
  );
}
