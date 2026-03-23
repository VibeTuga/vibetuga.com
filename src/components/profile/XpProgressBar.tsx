"use client";

import { motion, useReducedMotion } from "framer-motion";

interface XpProgressBarProps {
  progressPct: number;
}

export function XpProgressBar({ progressPct }: XpProgressBarProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mb-3">
      {prefersReduced ? (
        <div
          className="h-full bg-primary shadow-[0_0_10px_rgba(161,255,194,0.5)]"
          style={{ width: `${progressPct}%` }}
        />
      ) : (
        <motion.div
          className="h-full bg-primary shadow-[0_0_10px_rgba(161,255,194,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        />
      )}
    </div>
  );
}
