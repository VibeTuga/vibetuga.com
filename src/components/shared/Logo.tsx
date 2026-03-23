import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
} as const;

export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "font-headline font-black tracking-tighter text-primary transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(161,255,194,0.5)]",
        sizeClasses[size],
        className
      )}
    >
      VibeTuga
    </Link>
  );
}
