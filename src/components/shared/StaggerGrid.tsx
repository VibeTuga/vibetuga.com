"use client";

import { useRef, useEffect, useState, Children, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function StaggerGrid({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReduced]);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, index) => (
        <div
          style={{
            opacity: isVisible ? undefined : 0,
            animation: isVisible ? `fade-up 0.3s ease-out ${index * 0.05}s both` : "none",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
