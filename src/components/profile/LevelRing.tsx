"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

interface LevelRingProps {
  ring: { border?: string; style?: CSSProperties };
  image: string | null;
  displayName: string;
}

function getGlowColor(border?: string): string {
  if (border?.includes("primary")) return "rgba(161,255,194,VAL)";
  if (border?.includes("tertiary")) return "rgba(129,233,255,VAL)";
  return "rgba(216,115,255,VAL)";
}

export function LevelRing({ ring, image, displayName }: LevelRingProps) {
  const [prefersReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  const avatarContent = image ? (
    <Image
      src={image}
      alt={displayName}
      width={112}
      height={112}
      className="w-full h-full rounded-full object-cover"
    />
  ) : (
    <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center font-headline font-black text-2xl text-primary">
      {displayName.slice(0, 2).toUpperCase()}
    </div>
  );

  if (ring.style) {
    const glowTemplate = "rgba(161,255,194,VAL)";
    return (
      <div
        className={prefersReduced ? "" : "animate-glow-pulse"}
        style={{
          ...ring.style,
          padding: "4px",
          borderRadius: "50%",
          display: "inline-block",
          boxShadow: prefersReduced ? undefined : `0 0 20px ${glowTemplate.replace("VAL", "0.3")}`,
        }}
      >
        <div className="w-28 h-28 rounded-full overflow-hidden bg-surface-container-highest">
          {avatarContent}
        </div>
      </div>
    );
  }

  const glowBase = getGlowColor(ring.border);

  return (
    <div
      className={`w-32 h-32 rounded-full border-4 ${ring.border} p-1.5 ${prefersReduced ? "" : "animate-glow-pulse"}`}
      style={
        prefersReduced
          ? undefined
          : {
              boxShadow: `0 0 15px ${glowBase.replace("VAL", "0.2")}`,
            }
      }
    >
      {avatarContent}
    </div>
  );
}
