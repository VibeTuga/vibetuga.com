"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { History, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

interface Revision {
  id: string;
  title: string;
  content: string;
  revisionNumber: number;
  createdAt: string;
  editedBy: string | null;
  editorName: string | null;
  editorUsername: string | null;
}

export function RevisionHistory({ postId }: { postId: string }) {
  const router = useRouter();
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRevisions() {
      try {
        const res = await fetch(`/api/blog/posts/${postId}/revisions`);
        if (res.ok) {
          const data = await res.json();
          setRevisions(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchRevisions();
  }, [postId]);

  async function handleRestore(revision: Revision) {
    if (
      !window.confirm(
        `Restaurar para a revisão #${revision.revisionNumber}? O conteúdo atual será substituído.`,
      )
    ) {
      return;
    }

    setRestoring(revision.id);
    try {
      const res = await fetch(`/api/blog/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: revision.title,
          content: revision.content,
        }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setRestoring(null);
    }
  }

  if (loading) {
    return (
      <div className="bg-surface-container p-6">
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-white/40" />
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-white/40">
            Histórico de Versões
          </h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (revisions.length === 0) {
    return (
      <div className="bg-surface-container p-6">
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-white/40" />
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-white/40">
            Histórico de Versões
          </h2>
        </div>
        <p className="text-xs font-mono text-white/20">Nenhuma revisão registada</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container p-6">
      <div className="flex items-center gap-2 mb-6">
        <History size={16} className="text-white/40" />
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-white/40">
          Histórico de Versões
        </h2>
        <span className="text-[10px] font-mono text-white/20 ml-auto">
          {revisions.length} revisão(ões)
        </span>
      </div>

      <div className="space-y-2">
        {revisions.map((rev) => {
          const isExpanded = expandedId === rev.id;
          const editorLabel = rev.editorName || rev.editorUsername || "Desconhecido";
          const date = new Date(rev.createdAt);

          return (
            <div key={rev.id} className="border border-white/5 bg-surface-container-lowest">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : rev.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-tertiary font-bold">
                    #{rev.revisionNumber}
                  </span>
                  <span className="text-xs font-mono text-white/60 truncate max-w-[200px]">
                    {rev.title}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-white/20">{editorLabel}</span>
                  <span className="text-[10px] font-mono text-white/20">
                    {date.toLocaleDateString("pt-PT")}{" "}
                    {date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={14} className="text-white/20" />
                  ) : (
                    <ChevronDown size={14} className="text-white/20" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-white/5 px-4 py-4 space-y-4">
                  <div>
                    <p className="text-[10px] font-mono uppercase text-white/30 mb-1">Título</p>
                    <p className="text-sm font-mono text-white/70">{rev.title}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase text-white/30 mb-1">Conteúdo</p>
                    <pre className="text-xs font-mono text-white/50 bg-white/[0.02] p-3 max-h-60 overflow-y-auto whitespace-pre-wrap break-words">
                      {rev.content.slice(0, 2000)}
                      {rev.content.length > 2000 && "..."}
                    </pre>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRestore(rev)}
                    disabled={restoring === rev.id}
                    className="flex items-center gap-2 px-4 py-2 border border-tertiary/30 text-tertiary text-[10px] font-mono uppercase font-bold hover:bg-tertiary/10 transition-all disabled:opacity-50"
                  >
                    <RotateCcw size={12} />
                    {restoring === rev.id ? "A restaurar..." : "Restaurar esta versão"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
