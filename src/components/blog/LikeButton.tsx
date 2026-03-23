"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { formatCount } from "@/lib/blog-utils";

export function LikeButton({ postId, initialCount }: { postId: string; initialCount: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // Check initial like state
  useEffect(() => {
    const key = `vt-liked-${postId}`;
    setLiked(sessionStorage.getItem(key) === "1");
  }, [postId]);

  async function toggle() {
    if (loading) return;
    setLoading(true);

    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));

    try {
      const res = await fetch(`/api/blog/posts/${postId}/like`, { method: "POST" });
      if (res.status === 401) {
        // Revert — user not logged in
        setLiked(wasLiked);
        setCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const key = `vt-liked-${postId}`;
        if (data.liked) {
          sessionStorage.setItem(key, "1");
        } else {
          sessionStorage.removeItem(key);
        }
      } else {
        // Revert
        setLiked(wasLiked);
        setCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
      }
    } catch {
      setLiked(wasLiked);
      setCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`group flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-widest transition-all ${
        liked ? "text-error bg-error/10" : "text-white/40 hover:text-error hover:bg-error/5"
      }`}
      aria-label={liked ? "Remover like" : "Dar like"}
    >
      <Heart
        size={16}
        className={`transition-transform group-hover:scale-110 ${liked ? "fill-current" : ""}`}
      />
      {formatCount(count)}
    </button>
  );
}
