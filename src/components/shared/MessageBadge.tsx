"use client";

import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function MessageBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      fetch("/api/messages/unread")
        .then((r) => r.json())
        .then((data) => setUnreadCount(data.count ?? 0))
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/dashboard/messages"
      className="relative text-white/60 hover:text-primary transition-colors"
      aria-label="Mensagens"
    >
      <MessageCircle size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-1">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
