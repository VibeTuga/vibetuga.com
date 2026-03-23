"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function formatTimeLeft(endAt: string): string {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return "Expirado";

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (days > 0) return `${days}d ${hours}h restantes`;
  if (hours > 0) return `${hours}h ${minutes}m restantes`;
  return `${minutes}m restantes`;
}

export function ChallengeCountdown({ endAt }: { endAt: string }) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(endAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(endAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [endAt]);

  const isExpired = timeLeft === "Expirado";

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-mono ${
        isExpired ? "text-red-400/60" : "text-primary/70"
      }`}
    >
      <Clock size={14} />
      {timeLeft}
    </div>
  );
}
