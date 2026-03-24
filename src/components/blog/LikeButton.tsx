"use client";

import { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { formatCount } from "@/lib/blog-utils";

export function LikeButton({ postId, initialCount }: { postId: string; initialCount: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const iconRef = useRef<HTMLSpanElement>(null);
  const prefersReducedRef = useRef(false);

  useEffect(() => {
    prefersReducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const key = `vt-liked-${postId}`;
    setLiked(sessionStorage.getItem(key) === "1");
  }, [postId]);

  function pop() {
    const el = iconRef.current;
    if (!el || prefersReducedRef.current) return;
    el.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }],
      { duration: 250, easing: "ease-out" },
    );
  }

  async function toggle() {
    if (loading) return;
    setLoading(true);

    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    pop();

    try {
      const res = await fetch(`/api/blog/posts/${postId}/like`, { method: "POST" });
      if (res.status === 401) {
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
      <span ref={iconRef} style={{ display: "inline-flex" }}>
        <Heart size={16} className={`transition-colors ${liked ? "fill-current" : ""}`} />
      </span>
      {formatCount(count)}
    </button>
  );
}
