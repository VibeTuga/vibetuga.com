"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedPodiumItemProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export function AnimatedPodiumItem({ children, index, className }: AnimatedPodiumItemProps) {
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

  const isCenter = index === 1;
  const distance = isCenter ? 40 : 24;
  const delay = index * 0.12 + 0.1;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? undefined : 0,
        animation: isVisible ? `fade-up ${0.55}s ease-out ${delay}s both` : "none",
        ["--animate-distance" as string]: `${distance}px`,
      }}
    >
      {children}
    </div>
  );
}

interface AnimatedTableRowProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export function AnimatedTableRow({ children, index, className }: AnimatedTableRowProps) {
  const ref = useRef<HTMLTableRowElement>(null);
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
    return <tr className={className}>{children}</tr>;
  }

  return (
    <tr
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? undefined : 0,
        animation: isVisible ? `slide-row 0.35s ease-out ${index * 0.05}s both` : "none",
      }}
    >
      {children}
    </tr>
  );
}
