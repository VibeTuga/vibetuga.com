"use client";

import { useReducedMotion, motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedPodiumItemProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export function AnimatedPodiumItem({ children, index, className }: AnimatedPodiumItemProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const isCenter = index === 1;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: isCenter ? 40 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12 + 0.1, duration: 0.55, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedTableRowProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export function AnimatedTableRow({ children, index, className }: AnimatedTableRowProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <tr className={className}>{children}</tr>;
  }

  return (
    <motion.tr
      className={className}
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.tr>
  );
}
