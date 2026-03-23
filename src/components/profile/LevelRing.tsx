"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";
import Image from "next/image";
import type { CSSProperties } from "react";

interface LevelRingProps {
  ring: { border?: string; style?: CSSProperties };
  image: string | null;
  displayName: string;
}

export function LevelRing({ ring, image, displayName }: LevelRingProps) {
  const prefersReduced = useReducedMotion();

  const pulse = prefersReduced
    ? {}
    : {
        animate: {
          boxShadow: ring.style
            ? [
                "0 0 20px rgba(161,255,194,0.3)",
                "0 0 35px rgba(161,255,194,0.5)",
                "0 0 20px rgba(161,255,194,0.3)",
              ]
            : undefined,
        },
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } as Transition,
      };

  if (ring.style) {
    return (
      <motion.div
        {...pulse}
        style={{
          ...ring.style,
          padding: "4px",
          borderRadius: "50%",
          display: "inline-block",
        }}
      >
        <div className="w-28 h-28 rounded-full overflow-hidden bg-surface-container-highest">
          {image ? (
            <Image
              src={image}
              alt={displayName}
              width={112}
              height={112}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-headline font-black text-2xl text-primary">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`w-32 h-32 rounded-full border-4 ${ring.border} p-1.5`}
      animate={
        prefersReduced
          ? {}
          : {
              boxShadow: [
                ring.border?.includes("primary")
                  ? "0 0 15px rgba(161,255,194,0.2)"
                  : ring.border?.includes("tertiary")
                    ? "0 0 15px rgba(129,233,255,0.2)"
                    : "0 0 15px rgba(216,115,255,0.2)",
                ring.border?.includes("primary")
                  ? "0 0 28px rgba(161,255,194,0.4)"
                  : ring.border?.includes("tertiary")
                    ? "0 0 28px rgba(129,233,255,0.4)"
                    : "0 0 28px rgba(216,115,255,0.4)",
                ring.border?.includes("primary")
                  ? "0 0 15px rgba(161,255,194,0.2)"
                  : ring.border?.includes("tertiary")
                    ? "0 0 15px rgba(129,233,255,0.2)"
                    : "0 0 15px rgba(216,115,255,0.2)",
              ],
            }
      }
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {image ? (
        <Image
          src={image}
          alt={displayName}
          width={116}
          height={116}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center font-headline font-black text-2xl text-primary">
          {displayName.slice(0, 2).toUpperCase()}
        </div>
      )}
    </motion.div>
  );
}
