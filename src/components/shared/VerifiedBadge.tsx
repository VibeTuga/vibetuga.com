import { CheckCircle2 } from "lucide-react";

interface VerifiedBadgeProps {
  className?: string;
}

export function VerifiedBadge({ className = "" }: VerifiedBadgeProps) {
  return (
    <CheckCircle2
      className={`inline-block w-4 h-4 text-primary drop-shadow-[0_0_6px_rgba(161,255,194,0.5)] ${className}`}
      aria-label="Verificado"
    />
  );
}
