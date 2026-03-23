"use client";

import { useState, useTransition } from "react";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
  initialCount: number;
}

export function FollowButton({ targetUserId, initialFollowing, initialCount }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Optimistic update
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    setCount((c) => (wasFollowing ? c - 1 : c + 1));

    startTransition(async () => {
      try {
        const res = await fetch(`/api/users/${targetUserId}/follow`, {
          method: "POST",
        });

        if (!res.ok) {
          // Revert on error
          setFollowing(wasFollowing);
          setCount((c) => (wasFollowing ? c + 1 : c - 1));
          return;
        }

        const data = await res.json();
        setFollowing(data.following);
        setCount(data.followerCount);
      } catch {
        // Revert on network error
        setFollowing(wasFollowing);
        setCount((c) => (wasFollowing ? c + 1 : c - 1));
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
        following
          ? "bg-primary/10 text-primary border border-primary/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
          : "bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(161,255,194,0.4)]"
      } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {following ? "A seguir" : "Seguir"}
      <span className="font-mono text-[10px] opacity-70">{count}</span>
    </button>
  );
}
