"use client";

import { useRef, useEffect, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  className?: string;
  locale?: string;
}

export function CountUp({ end, duration = 1.5, className, locale = "pt-PT" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(end.toLocaleString(locale));
  const [prefersReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.unobserve(el);

          const startTime = performance.now();
          const durationMs = duration * 1000;

          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * end);
            setDisplay(current.toLocaleString(locale));

            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          }

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, locale, prefersReduced]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
