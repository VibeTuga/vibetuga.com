"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";

interface EntryVoteButtonProps {
  challengeId: number;
  entryId: number;
  initialVotesCount: number;
  initialVoted: boolean;
  disabled?: boolean;
}

export function EntryVoteButton({
  challengeId,
  entryId,
  initialVotesCount,
  initialVoted,
  disabled,
}: EntryVoteButtonProps) {
  const [voted, setVoted] = useState(initialVoted);
  const [votesCount, setVotesCount] = useState(initialVotesCount);
  const [loading, setLoading] = useState(false);

  async function handleVote() {
    if (disabled || loading) return;

    setLoading(true);
    // Optimistic update
    const wasVoted = voted;
    setVoted(!voted);
    setVotesCount((prev) => (wasVoted ? prev - 1 : prev + 1));

    try {
      const res = await fetch(`/api/challenges/${challengeId}/entries/${entryId}/vote`, {
        method: "POST",
      });

      if (!res.ok) {
        // Revert optimistic update
        setVoted(wasVoted);
        setVotesCount((prev) => (wasVoted ? prev + 1 : prev - 1));
        return;
      }

      const data = await res.json();
      setVoted(data.voted);
      setVotesCount(data.votesCount);
    } catch {
      setVoted(wasVoted);
      setVotesCount((prev) => (wasVoted ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={disabled || loading}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded transition-all ${
        voted
          ? "bg-primary/10 text-primary border border-primary/30"
          : "bg-white/5 text-white/40 border border-white/5 hover:border-white/10 hover:text-white/60"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      title={disabled ? "Não podes votar na tua própria entrada" : voted ? "Remover voto" : "Votar"}
    >
      <ChevronUp size={16} />
      <span className="text-xs font-mono">{votesCount}</span>
    </button>
  );
}
