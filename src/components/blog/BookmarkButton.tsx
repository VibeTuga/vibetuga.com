"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

export function BookmarkButton({ postId }: { postId: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const key = `vt-bookmarked-${postId}`;
    setBookmarked(sessionStorage.getItem(key) === "1");
  }, [postId]);

  async function toggle() {
    if (loading) return;
    setLoading(true);

    const was = bookmarked;
    setBookmarked(!was);

    try {
      const res = await fetch(`/api/blog/posts/${postId}/bookmark`, { method: "POST" });
      if (res.status === 401) {
        setBookmarked(was);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const key = `vt-bookmarked-${postId}`;
        if (data.bookmarked) {
          sessionStorage.setItem(key, "1");
        } else {
          sessionStorage.removeItem(key);
        }
      } else {
        setBookmarked(was);
      }
    } catch {
      setBookmarked(was);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`group flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-widest transition-all ${
        bookmarked
          ? "text-secondary bg-secondary/10"
          : "text-white/40 hover:text-secondary hover:bg-secondary/5"
      }`}
      aria-label={bookmarked ? "Remover bookmark" : "Guardar"}
    >
      <Bookmark
        size={16}
        className={`transition-transform group-hover:scale-110 ${bookmarked ? "fill-current" : ""}`}
      />
      {bookmarked ? "Guardado" : "Guardar"}
    </button>
  );
}
