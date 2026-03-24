"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import { Search, Shield, ShieldOff, Ban, CheckCircle, Activity, Loader2 } from "lucide-react";

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
  createdAt: Date;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/10 text-red-400",
  moderator: "bg-purple-500/10 text-purple-400",
  author: "bg-blue-500/10 text-blue-400",
  seller: "bg-amber-500/10 text-amber-400",
  member: "bg-white/5 text-white/40",
};

const VALID_ROLES = ["admin", "moderator", "author", "seller", "member"];

export function AdminUsersManager({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.discordUsername.toLowerCase().includes(q) ||
      (u.displayName && u.displayName.toLowerCase().includes(q))
    );
  });

  async function handleToggleVerified(user: AdminUser) {
    setActioning(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !user.isVerified }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao atualizar verificação.");
        return;
      }
      router.refresh();
    } catch {
      alert("Erro ao atualizar verificação.");
    } finally {
      setActioning(null);
    }
  }

  async function handleToggleBan(user: AdminUser) {
    setActioning(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !user.isBanned }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao atualizar ban.");
        return;
      }
      router.refresh();
    } catch {
      alert("Erro ao atualizar ban.");
    } finally {
      setActioning(null);
    }
  }

  async function handleRoleChange(user: AdminUser, newRole: string) {
    if (newRole === user.role) return;
    setActioning(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao alterar role.");
        return;
      }
      router.refresh();
    } catch {
      alert("Erro ao alterar role.");
    } finally {
      setActioning(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Utilizadores
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          {users.length} utilizadores registados
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Pesquisar por username ou nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low text-sm text-white placeholder:text-white/30 font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-surface-container-low p-12 text-center">
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest">NO_RESULTS</p>
          <p className="text-white/20 text-sm mt-2">
            Nenhum utilizador encontrado para &ldquo;{search}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] font-mono uppercase text-white/30 px-4 py-3">
                  Utilizador
                </th>
                <th className="text-left text-[10px] font-mono uppercase text-white/30 px-4 py-3">
                  Email
                </th>
                <th className="text-center text-[10px] font-mono uppercase text-white/30 px-4 py-3">
                  Role
                </th>
                <th className="text-center text-[10px] font-mono uppercase text-white/30 px-4 py-3">
                  XP / LVL
                </th>
                <th className="text-center text-[10px] font-mono uppercase text-white/30 px-4 py-3">
                  Estado
                </th>
                <th className="text-right text-[10px] font-mono uppercase text-white/30 px-4 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const name = user.displayName || user.discordUsername;
                const isActioning = actioning === user.id;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-surface-container transition-colors"
                  >
                    {/* Avatar + Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={name}
                            width={28}
                            height={28}
                            className="rounded-full border border-primary/20"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-surface-container-highest border border-primary/20 flex items-center justify-center text-[10px] font-bold text-white/40">
                            {name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-headline font-bold text-white truncate max-w-[160px]">
                            {name}
                          </p>
                          <p className="text-[10px] font-mono text-white/30">
                            @{user.discordUsername}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-white/40 font-mono truncate block max-w-[180px]">
                        {user.email || "—"}
                      </span>
                    </td>

                    {/* Role dropdown */}
                    <td className="px-4 py-3 text-center">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                        disabled={isActioning}
                        className={`px-2 py-[2px] text-[9px] font-mono uppercase appearance-none cursor-pointer border-0 focus:outline-none focus:ring-1 focus:ring-primary/50 ${ROLE_COLORS[user.role] ?? "bg-white/5 text-white/30"}`}
                      >
                        {VALID_ROLES.map((role) => (
                          <option key={role} value={role} className="bg-[#0a0a0a] text-white">
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* XP / Level */}
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-mono text-primary font-bold">
                        {user.xpPoints.toLocaleString("pt-PT")}
                      </span>
                      <span className="text-[10px] font-mono text-white/20 ml-1">
                        LVL {user.level}
                      </span>
                    </td>

                    {/* Status badges */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {user.isBanned && (
                          <span className="px-1.5 py-[1px] text-[8px] font-mono uppercase bg-red-500/15 text-red-400 font-bold">
                            Banido
                          </span>
                        )}
                        {user.isVerified && (
                          <span className="flex items-center gap-0.5 px-1.5 py-[1px] text-[8px] font-mono uppercase bg-primary/10 text-primary">
                            <CheckCircle className="w-2.5 h-2.5" />
                            Verificado
                          </span>
                        )}
                        {!user.isBanned && !user.isVerified && (
                          <span className="text-[10px] font-mono text-white/20">—</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle verified */}
                        <button
                          onClick={() => handleToggleVerified(user)}
                          disabled={isActioning}
                          className={`p-1.5 transition-all disabled:opacity-40 ${
                            user.isVerified
                              ? "text-primary hover:text-primary/60 hover:bg-primary/10"
                              : "text-white/20 hover:text-primary hover:bg-primary/10"
                          }`}
                          title={user.isVerified ? "Remover verificação" : "Verificar utilizador"}
                        >
                          {isActioning ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : user.isVerified ? (
                            <ShieldOff size={14} />
                          ) : (
                            <Shield size={14} />
                          )}
                        </button>

                        {/* Toggle ban */}
                        <button
                          onClick={() => handleToggleBan(user)}
                          disabled={isActioning}
                          className={`p-1.5 transition-all disabled:opacity-40 ${
                            user.isBanned
                              ? "text-red-400 hover:text-green-400 hover:bg-green-500/10"
                              : "text-white/20 hover:text-red-400 hover:bg-red-500/10"
                          }`}
                          title={user.isBanned ? "Desbanir utilizador" : "Banir utilizador"}
                        >
                          <Ban size={14} />
                        </button>

                        {/* Activity link */}
                        <Link
                          href={`/admin/users/${user.id}/activity`}
                          className="p-1.5 text-white/20 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                          title="Ver atividade"
                        >
                          <Activity size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
