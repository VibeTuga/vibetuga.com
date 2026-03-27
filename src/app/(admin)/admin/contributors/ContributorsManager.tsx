"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, Loader2, Search } from "lucide-react";

interface AdminUser {
  id: string;
  discordUsername: string;
  displayName: string | null;
  image: string | null;
  role: string;
  xpPoints: number;
  level: number;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: Date;
  hasContributorBadge: boolean;
  hasMonthlyStarBadge: boolean;
}

interface Props {
  initialUsers: AdminUser[];
  contributorBadgeId: string | null;
  monthlyStarBadgeId: string | null;
}

export function ContributorsManager({
  initialUsers,
  contributorBadgeId,
  monthlyStarBadgeId,
}: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "contributors" | "verified">("all");
  const [search, setSearch] = useState("");

  async function toggleBadge(userId: string, badgeId: string, currentHas: boolean) {
    if (!badgeId) return;
    setProcessingId(`${userId}-${badgeId}`);
    try {
      const res = await fetch("/api/admin/contributors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          badgeId,
          action: currentHas ? "revoke" : "grant",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erro ao processar");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          if (badgeId === contributorBadgeId) {
            return { ...u, hasContributorBadge: !currentHas };
          }
          if (badgeId === monthlyStarBadgeId) {
            return { ...u, hasMonthlyStarBadge: !currentHas };
          }
          return u;
        }),
      );
    } catch {
      alert("Erro ao processar");
    } finally {
      setProcessingId(null);
    }
  }

  const filteredUsers = users.filter((u) => {
    if (u.isBanned) return false;
    if (filter === "contributors" && !u.hasContributorBadge) return false;
    if (filter === "verified" && !u.isVerified) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.discordUsername.toLowerCase().includes(q) ||
        (u.displayName?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const contributorCount = users.filter((u) => u.hasContributorBadge).length;
  const verifiedCount = users.filter((u) => u.isVerified).length;
  const monthlyStarCount = users.filter((u) => u.hasMonthlyStarBadge).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Award size={20} className="text-primary" />
          Gestão de Contribuidores
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Gerir badges de contribuidor e destaques mensais.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container-low border border-white/5 p-4">
          <p className="text-[10px] font-label text-white/40 uppercase tracking-widest">
            Contribuidores
          </p>
          <p className="text-2xl font-bold text-primary mt-1">{contributorCount}</p>
        </div>
        <div className="bg-surface-container-low border border-white/5 p-4">
          <p className="text-[10px] font-label text-white/40 uppercase tracking-widest">
            Verificados
          </p>
          <p className="text-2xl font-bold text-tertiary mt-1">{verifiedCount}</p>
        </div>
        <div className="bg-surface-container-low border border-white/5 p-4">
          <p className="text-[10px] font-label text-white/40 uppercase tracking-widest">
            Monthly Stars
          </p>
          <p className="text-2xl font-bold text-secondary mt-1">{monthlyStarCount}</p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/20">
          {(["all", "contributors", "verified"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-label uppercase tracking-wider transition-all ${
                filter === f
                  ? "text-on-background bg-surface-container-highest rounded shadow-lg"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {f === "all" ? "Todos" : f === "contributors" ? "Contribuidores" : "Verificados"}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar utilizador..."
            className="w-full bg-surface-container-low border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/40"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="font-label text-[10px] text-white/30 uppercase tracking-[0.15em] border-b border-white/5">
            <tr>
              <th className="px-4 py-3 font-normal">Utilizador</th>
              <th className="px-4 py-3 font-normal">Level</th>
              <th className="px-4 py-3 font-normal">XP</th>
              <th className="px-4 py-3 font-normal text-center">🤝 Contribuidor</th>
              <th className="px-4 py-3 font-normal text-center">🌟 Monthly Star</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredUsers.map((user) => {
              const username = user.displayName || user.discordUsername;
              const isProcessingContributor = processingId === `${user.id}-${contributorBadgeId}`;
              const isProcessingStar = processingId === `${user.id}-${monthlyStarBadgeId}`;

              return (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={username}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-white/10 flex items-center justify-center font-headline font-bold text-[10px] text-white/60">
                          {username.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white text-sm flex items-center gap-1.5">
                          {username}
                          {user.isVerified && (
                            <span className="text-primary text-xs" title="Verificado">
                              ✓
                            </span>
                          )}
                        </p>
                        <p className="font-mono text-[10px] text-white/30">
                          @{user.discordUsername}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-surface-container-highest text-[10px] font-label text-white/60">
                      LVL {user.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-primary-dim text-sm">
                    {user.xpPoints.toLocaleString("pt-PT")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {contributorBadgeId ? (
                      <button
                        onClick={() =>
                          toggleBadge(user.id, contributorBadgeId, user.hasContributorBadge)
                        }
                        disabled={!!processingId}
                        className={`px-3 py-1.5 text-[10px] font-label uppercase tracking-wider transition-all ${
                          user.hasContributorBadge
                            ? "bg-primary/20 text-primary border border-primary/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                            : "bg-surface-container-highest text-white/40 border border-white/10 hover:border-primary/30 hover:text-primary"
                        }`}
                      >
                        {isProcessingContributor ? (
                          <Loader2 size={12} className="animate-spin inline" />
                        ) : user.hasContributorBadge ? (
                          "Revogar"
                        ) : (
                          "Atribuir"
                        )}
                      </button>
                    ) : (
                      <span className="text-white/20 text-[10px]">Badge não existe</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {monthlyStarBadgeId ? (
                      <button
                        onClick={() =>
                          toggleBadge(user.id, monthlyStarBadgeId, user.hasMonthlyStarBadge)
                        }
                        disabled={!!processingId}
                        className={`px-3 py-1.5 text-[10px] font-label uppercase tracking-wider transition-all ${
                          user.hasMonthlyStarBadge
                            ? "bg-secondary/20 text-secondary border border-secondary/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                            : "bg-surface-container-highest text-white/40 border border-white/10 hover:border-secondary/30 hover:text-secondary"
                        }`}
                      >
                        {isProcessingStar ? (
                          <Loader2 size={12} className="animate-spin inline" />
                        ) : user.hasMonthlyStarBadge ? (
                          "Revogar"
                        ) : (
                          "Atribuir"
                        )}
                      </button>
                    ) : (
                      <span className="text-white/20 text-[10px]">Badge não existe</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-white/30 font-label uppercase tracking-widest text-sm">
            Nenhum utilizador encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
