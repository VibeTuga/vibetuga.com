"use client";

import { useState } from "react";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
  initialFollowerCount: number;
}

export function FollowButton({
  targetUserId,
  initialFollowing,
  initialFollowerCount,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (loading) return;

    // Optimistic update
    const wasFollowing = following;
    const prevCount = followerCount;
    setFollowing(!wasFollowing);
    setFollowerCount(wasFollowing ? prevCount - 1 : prevCount + 1);
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: "POST",
      });

      if (!res.ok) {
        // Revert
        setFollowing(wasFollowing);
        setFollowerCount(prevCount);
        return;
      }

      const data = await res.json();
      setFollowing(data.following);
    } catch {
      // Revert on error
      setFollowing(wasFollowing);
      setFollowerCount(prevCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-1.5 text-xs font-label font-bold uppercase tracking-wider transition-all ${
        following
          ? "bg-surface-container-high text-white/60 border border-white/10 hover:border-red-500/30 hover:text-red-400"
          : "bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(161,255,194,0.4)]"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {following ? "A seguir" : "Seguir"}
    </button>
  );
}
