"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Link } from "@/lib/navigation";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  actorId: string | null;
  referenceId: string | null;
  createdAt: string;
  actorDisplayName: string | null;
  actorImage: string | null;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "agora";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d`;
  return new Date(dateStr).toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}

const TYPE_ICONS: Record<string, string> = {
  new_follower: "👤",
  comment_reply: "💬",
  post_approved: "✅",
  xp_milestone: "⭐",
  badge_earned: "🏆",
  post_liked: "❤️",
  project_featured: "🚀",
  challenge_submission: "🎯",
  challenge_winner: "🏆",
  mention: "📢",
  referral_completed: "🤝",
  new_message: "✉️",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=8");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Silently fail
    }
  }, []);

  // SSE for real-time notifications, fallback to polling
  useEffect(() => {
    fetchNotifications();

    let eventSource: EventSource | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    function connectSSE() {
      try {
        eventSource = new EventSource("/api/notifications/stream");

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.notifications && data.notifications.length > 0) {
              setItems((prev) => {
                const existingIds = new Set(prev.map((n) => n.id));
                const newItems = (data.notifications as NotificationItem[]).filter(
                  (n) => !existingIds.has(n.id),
                );
                return [...newItems, ...prev].slice(0, 20);
              });
              setUnreadCount(data.unreadCount ?? 0);
            }
          } catch {
            // Bad SSE data — ignore
          }
        };

        eventSource.onerror = () => {
          // SSE failed — close and fall back to polling
          eventSource?.close();
          eventSource = null;
          if (!pollInterval) {
            pollInterval = setInterval(fetchNotifications, 30_000);
          }
        };
      } catch {
        // EventSource not supported — use polling
        if (!pollInterval) {
          pollInterval = setInterval(fetchNotifications, 30_000);
        }
      }
    }

    connectSSE();

    return () => {
      eventSource?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  async function markAllRead() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  async function markOneRead(id: string) {
    try {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-white/60 hover:text-primary transition-colors"
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] bg-[#0a0a0f] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-headline font-semibold text-white">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={loading}
                className="flex items-center gap-1 text-[11px] font-mono text-primary/80 hover:text-primary transition-colors disabled:opacity-50"
              >
                <Check size={12} />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[380px]">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/30 text-sm">Sem notificações.</div>
            ) : (
              items.map((n) => {
                const content = (
                  <div
                    className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 transition-colors hover:bg-white/[0.03] ${!n.isRead ? "bg-primary/[0.04]" : ""}`}
                  >
                    {/* Actor avatar or type icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {n.actorImage ? (
                        <Image
                          src={n.actorImage}
                          alt=""
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-sm">
                          {TYPE_ICONS[n.type] ?? "🔔"}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs leading-tight ${!n.isRead ? "text-white font-medium" : "text-white/60"}`}
                      >
                        {n.actorDisplayName && (
                          <span className="text-primary/90">{n.actorDisplayName} </span>
                        )}
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">{n.body}</p>
                      )}
                      <span className="text-[10px] text-white/25 font-mono mt-1 block">
                        {relativeTime(n.createdAt)}
                      </span>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="flex-shrink-0 mt-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                );

                if (n.link) {
                  return (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => {
                        if (!n.isRead) markOneRead(n.id);
                        setOpen(false);
                      }}
                      className="block"
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) markOneRead(n.id);
                    }}
                    className="cursor-default"
                  >
                    {content}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 px-4 py-2.5">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-white/40 hover:text-primary transition-colors"
            >
              <ExternalLink size={11} />
              Ver todas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
