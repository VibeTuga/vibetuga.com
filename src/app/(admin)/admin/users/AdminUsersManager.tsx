"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Ban, Shield, Search } from "lucide-react";

interface AdminUser {
  id: string;
  discordUsername: string;
  displayName: string | null;
  email: string | null;
  image: string | null;
  role: string;
  xpPoints: number;
  level: number;
  isBanned: boolean;
  isVerified: boolean;
  createdAt: string;
}

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400",
  moderator: "bg-purple-500/20 text-purple-400",
  author: "bg-blue-500/20 text-blue-400",
  seller: "bg-amber-500/20 text-amber-400",
  member: "bg-primary/20 text-primary",
};

export function AdminUsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const isMounted = useRef(true);

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("q", search);

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok && isMounted.current) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    isMounted.current = true;
    fetchUsers();
    return () => {
      isMounted.current = false;
    };
  }, [fetchUsers]);

  async function toggleVerified(userId: string, currentValue: boolean) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isVerified: !currentValue }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isVerified: !currentValue } : u)),
      );
    }
  }

  async function toggleBanned(userId: string, currentValue: boolean) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isBanned: !currentValue }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBanned: !currentValue } : u)),
      );
    }
  }

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Pesquisar por nome, email ou Discord..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs font-mono text-white/40">
        <span>{total} utilizadores</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-container-low animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-1">
            <thead className="font-label text-[10px] text-white/30 uppercase tracking-[0.15em]">
              <tr>
                <th className="px-4 py-3 font-normal">Utilizador</th>
                <th className="px-4 py-3 font-normal">Role</th>
                <th className="px-4 py-3 font-normal">XP</th>
                <th className="px-4 py-3 font-normal">Estado</th>
                <th className="px-4 py-3 font-normal text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((user) => {
                const name = user.displayName || user.discordUsername;
                return (
                  <tr
                    key={user.id}
                    className="bg-surface-container-low hover:bg-surface-container transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/profile/${user.id}`}
                        className="flex items-center gap-3 hover:text-primary transition-colors"
                      >
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={name}
                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-white/50">
                            {name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{name}</span>
                            {user.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-white/30">
                            @{user.discordUsername}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase ${ROLE_STYLES[user.role] ?? ROLE_STYLES.member}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-primary-dim">
                      {user.xpPoints.toLocaleString("pt-PT")} XP
                      <span className="text-white/20 ml-1">LVL {user.level}</span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isBanned ? (
                        <span className="text-red-400 text-[10px] font-bold uppercase">Banido</span>
                      ) : (
                        <span className="text-primary/50 text-[10px] font-bold uppercase">
                          Ativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleVerified(user.id, user.isVerified)}
                          title={user.isVerified ? "Remover verificação" : "Verificar"}
                          className={`p-1.5 rounded transition-colors ${
                            user.isVerified
                              ? "bg-primary/20 text-primary hover:bg-primary/30"
                              : "bg-white/5 text-white/30 hover:text-primary hover:bg-primary/10"
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleBanned(user.id, user.isBanned)}
                          title={user.isBanned ? "Desbanir" : "Banir"}
                          className={`p-1.5 rounded transition-colors ${
                            user.isBanned
                              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              : "bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10"
                          }`}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
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
