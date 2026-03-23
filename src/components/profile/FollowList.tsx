"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { LEVEL_NAMES } from "@/lib/db/queries/profile";

interface FollowUser {
  id: string;
  displayName: string | null;
  discordUsername: string;
  image: string | null;
  level: number;
  isVerified: boolean;
}

interface FollowListProps {
  userId: string;
  type: "followers" | "following";
}

export function FollowList({ userId, type }: FollowListProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${userId}/${type}?page=${page}`);
      const data = await res.json();
      if (!isMounted.current) return;
      const list = type === "followers" ? data.followers : data.following;
      setUsers(list);
      setTotal(data.total);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [userId, type, page]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-surface-container animate-pulse">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-surface-container-highest rounded" />
              <div className="h-2 w-20 bg-surface-container-highest rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16 text-white/30 font-label uppercase tracking-widest text-xs">
        {type === "followers" ? "Ainda sem seguidores." : "Ainda não segue ninguém."}
      </div>
    );
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-2">
      {users.map((user) => {
        const name = user.displayName || user.discordUsername;
        const levelName = LEVEL_NAMES[user.level] ?? `LVL ${user.level}`;
        return (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className="flex items-center gap-4 p-4 bg-surface-container hover:bg-surface-container-high transition-colors"
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={name}
                className="w-10 h-10 rounded-full object-cover border border-outline-variant/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center font-headline font-bold text-xs text-white/60">
                {name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white truncate">{name}</span>
                {user.isVerified && <VerifiedBadge size="sm" />}
              </div>
              <span className="text-[10px] font-mono text-white/40 uppercase">
                {levelName} — Nível {user.level}
              </span>
            </div>
          </Link>
        );
      })}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-xs font-mono text-white/40 border border-white/10 hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-30"
          >
            Anterior
          </button>
          <span className="text-xs font-mono text-white/30">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-xs font-mono text-white/40 border border-white/10 hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-30"
          >
            Seguinte
          </button>
        </div>
      )}
    </div>
  );
}
