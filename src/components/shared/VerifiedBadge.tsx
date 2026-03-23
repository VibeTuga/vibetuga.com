import { CheckCircle2 } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md";
}

export function VerifiedBadge({ size = "md" }: VerifiedBadgeProps) {
  const sizeClasses = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <span title="Verificado" className="inline-flex items-center">
      <CheckCircle2
        className={`${sizeClasses} text-primary drop-shadow-[0_0_4px_rgba(161,255,194,0.6)]`}
      />
    </span>
  );
}
