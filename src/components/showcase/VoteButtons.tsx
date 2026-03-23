"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

type VoteButtonsProps = {
  projectId: string;
  initialVotesCount: number;
  initialUserVote: "up" | "down" | null;
  authorId: string;
  currentUserId: string | null;
};

export function VoteButtons({
  projectId,
  initialVotesCount,
  initialUserVote,
  authorId,
  currentUserId,
}: VoteButtonsProps) {
  const [votesCount, setVotesCount] = useState(initialVotesCount);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(initialUserVote);
  const [loading, setLoading] = useState(false);

  const isOwnProject = currentUserId === authorId;
  const isDisabled = !currentUserId || isOwnProject || loading;

  async function handleVote(voteType: "up" | "down") {
    if (isDisabled) return;
    setLoading(true);

    const prevVote = userVote;
    const prevCount = votesCount;

    // Optimistic update
    if (prevVote === voteType) {
      // Toggle off
      setUserVote(null);
      setVotesCount((c) => c + (voteType === "up" ? -1 : 1));
    } else if (prevVote) {
      // Switch vote
      setUserVote(voteType);
      setVotesCount((c) => c + (voteType === "up" ? 2 : -2));
    } else {
      // New vote
      setUserVote(voteType);
      setVotesCount((c) => c + (voteType === "up" ? 1 : -1));
    }

    try {
      const res = await fetch(`/api/showcase/projects/${projectId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });

      if (res.ok) {
        const data = await res.json();
        setVotesCount(data.votesCount);
        setUserVote(data.voteType);
      } else {
        // Revert on error
        setUserVote(prevVote);
        setVotesCount(prevCount);
      }
    } catch {
      setUserVote(prevVote);
      setVotesCount(prevCount);
    } finally {
      setLoading(false);
    }
  }

  const disabledTitle = !currentUserId
    ? "Faz login para votar"
    : isOwnProject
      ? "Não podes votar no teu próprio projeto"
      : undefined;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleVote("up")}
        disabled={isDisabled}
        title={disabledTitle ?? "Votar positivo"}
        aria-label="Votar positivo"
        className={`p-1.5 transition-colors ${
          userVote === "up"
            ? "text-primary"
            : isDisabled
              ? "text-white/15 cursor-not-allowed"
              : "text-white/30 hover:text-primary"
        }`}
      >
        <ChevronUp size={22} strokeWidth={2.5} />
      </button>
      <span className="font-headline font-black text-xl text-white tabular-nums">{votesCount}</span>
      <button
        onClick={() => handleVote("down")}
        disabled={isDisabled}
        title={disabledTitle ?? "Votar negativo"}
        aria-label="Votar negativo"
        className={`p-1.5 transition-colors ${
          userVote === "down"
            ? "text-error"
            : isDisabled
              ? "text-white/15 cursor-not-allowed"
              : "text-white/30 hover:text-error"
        }`}
      >
        <ChevronDown size={22} strokeWidth={2.5} />
      </button>
    </div>
  );
}
