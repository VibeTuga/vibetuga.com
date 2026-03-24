"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface AutosaveResult {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  saveNow: () => void;
}

interface LocalDraft {
  title: string;
  content: string;
  savedAt: string;
}

function getLocalStorageKey(postId: string) {
  return `autosave-post-${postId}`;
}

export function getLocalDraft(postId: string): LocalDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getLocalStorageKey(postId));
    if (!raw) return null;
    return JSON.parse(raw) as LocalDraft;
  } catch {
    return null;
  }
}

export function clearLocalDraft(postId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getLocalStorageKey(postId));
  } catch {
    // ignore
  }
}

function saveLocalDraft(postId: string, title: string, content: string) {
  if (typeof window === "undefined") return;
  try {
    const draft: LocalDraft = { title, content, savedAt: new Date().toISOString() };
    localStorage.setItem(getLocalStorageKey(postId), JSON.stringify(draft));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

const AUTOSAVE_INTERVAL = 30_000; // 30 seconds

export function useAutosave(
  postId: string | undefined,
  title: string,
  content: string,
  enabled: boolean,
): AutosaveResult {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const prevTitleRef = useRef(title);
  const prevContentRef = useRef(content);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasChangesRef = useRef(false);

  // Track whether content has changed since last save
  useEffect(() => {
    if (title !== prevTitleRef.current || content !== prevContentRef.current) {
      hasChangesRef.current = true;
    }
  }, [title, content]);

  const doSave = useCallback(async () => {
    if (!postId || !enabled || !hasChangesRef.current) return;

    // Save to localStorage as fallback
    saveLocalDraft(postId, title, content);

    setStatus("saving");
    try {
      const res = await fetch(`/api/blog/posts/${postId}/autosave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      const data = await res.json();
      prevTitleRef.current = title;
      prevContentRef.current = content;
      hasChangesRef.current = false;
      setLastSavedAt(new Date(data.savedAt));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [postId, title, content, enabled]);

  // Set up interval-based autosave
  useEffect(() => {
    if (!postId || !enabled) return;

    timerRef.current = setInterval(() => {
      if (hasChangesRef.current) {
        doSave();
      }
    }, AUTOSAVE_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [postId, enabled, doSave]);

  return { status, lastSavedAt, saveNow: doSave };
}
