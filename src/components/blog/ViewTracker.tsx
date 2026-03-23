"use client";

import { useEffect } from "react";

export function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = `viewed-${postId}`;
    if (sessionStorage.getItem(key)) return;

    fetch(`/api/blog/posts/${postId}/view`, { method: "POST" }).then(() => {
      sessionStorage.setItem(key, "1");
    });
  }, [postId]);

  return null;
}
