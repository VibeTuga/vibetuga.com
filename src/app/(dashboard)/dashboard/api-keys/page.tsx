"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Trash2, Loader2, Copy, Check, AlertTriangle, Clock } from "lucide-react";

interface ApiKeyData {
  id: string;
  name: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

const AVAILABLE_SCOPES = [
  { value: "leaderboard:read", label: "Leaderboard" },
  { value: "users:read", label: "Utilizadores" },
  { value: "projects:read", label: "Projetos" },
  { value: "search:read", label: "Pesquisa" },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    AVAILABLE_SCOPES.map((s) => s.value),
  );
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/users/me/api-keys");
      if (!res.ok) throw new Error("Erro ao carregar chaves");
      const data = await res.json();
      setKeys(data.keys);
    } catch {
      setError("Erro ao carregar chaves API");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || selectedScopes.length === 0) return;

    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/users/me/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), scopes: selectedScopes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar chave");
      }

      const data = await res.json();
      setNewKey(data.key);
      setName("");
      setSelectedScopes(AVAILABLE_SCOPES.map((s) => s.value));
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar chave API");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/me/api-keys/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao revogar");
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      setError("Erro ao revogar chave API");
    } finally {
      setDeletingId(null);
    }
  }

  function handleCopy() {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function toggleScope(scope: string) {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Key className="text-primary" size={24} />
            Chaves API
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Gere chaves para aceder à API pública v1 do VibeTuga.
          </p>
        </div>
        {!showForm && !newKey && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Nova Chave
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* New key display */}
      {newKey && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
          <p className="text-sm font-semibold text-primary">
            Chave criada com sucesso! Copia-a agora — não será mostrada novamente.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-black/40 rounded font-mono text-xs text-white/80 break-all">
              {newKey}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary text-xs font-mono rounded hover:bg-primary/20 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <button
            onClick={() => {
              setNewKey(null);
              setShowForm(false);
            }}
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && !newKey && (
        <form onSubmit={handleCreate} className="p-4 bg-surface-container rounded-lg space-y-4">
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
            Nova Chave API
          </h2>

          <div>
            <label className="block text-xs text-white/50 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: O meu bot, Widget do site..."
              maxLength={100}
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-2">Scopes</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SCOPES.map((scope) => (
                <button
                  key={scope.value}
                  type="button"
                  onClick={() => toggleScope(scope.value)}
                  className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                    selectedScopes.includes(scope.value)
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"
                  }`}
                >
                  {scope.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={creating || !name.trim() || selectedScopes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating && <Loader2 className="animate-spin" size={14} />}
              Criar Chave
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Keys list */}
      {keys.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Key size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Ainda não tens chaves API.</p>
          <p className="text-xs mt-1">Cria uma para aceder à API pública.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="flex items-center justify-between p-4 bg-surface-container rounded-lg"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{apiKey.name}</span>
                  {apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date() && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded font-mono">
                      EXPIRADA
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {apiKey.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/40 rounded font-mono"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white/30">
                  <span>Criada: {formatDate(apiKey.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    Último uso: {formatDate(apiKey.lastUsedAt)}
                  </span>
                  {apiKey.expiresAt && <span>Expira: {formatDate(apiKey.expiresAt)}</span>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(apiKey.id)}
                disabled={deletingId === apiKey.id}
                className="ml-4 p-2 text-white/30 hover:text-red-400 transition-colors disabled:opacity-50"
                title="Revogar chave"
              >
                {deletingId === apiKey.id ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* API Usage info */}
      <div className="p-4 bg-surface-container-low rounded-lg space-y-3">
        <h3 className="text-sm font-semibold text-white/60">Como usar a API</h3>
        <div className="space-y-2 text-xs text-white/40 font-mono">
          <p className="text-white/50">Autenticação via header:</p>
          <code className="block px-3 py-2 bg-black/30 rounded break-all">
            Authorization: Bearer vtg_...
          </code>
          <p className="text-white/50 pt-2">Endpoints disponíveis:</p>
          <ul className="space-y-1 pl-2">
            <li>GET /api/v1/leaderboard?limit=25</li>
            <li>GET /api/v1/users/[id]</li>
            <li>GET /api/v1/projects?page=1&limit=12&tech=react</li>
            <li>GET /api/v1/search?q=query</li>
          </ul>
          <p className="text-white/50 pt-2">Rate limit: 100 pedidos/minuto por chave.</p>
        </div>
      </div>
    </div>
  );
}
