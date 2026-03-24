"use client";

import { useState, useEffect, useCallback } from "react";
import { History, RotateCcw, ChevronDown, ChevronUp, X } from "lucide-react";

interface Revision {
  id: number;
  postId: string;
  title: string;
  content: string;
  revisionNumber: number;
  createdAt: string;
  editedBy: string | null;
  editorName: string | null;
}

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const result: DiffLine[] = [];

  // Simple LCS-based diff
  const m = oldLines.length;
  const n = newLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const diff: DiffLine[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diff.push({ type: "unchanged", text: oldLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.push({ type: "added", text: newLines[j - 1] });
      j--;
    } else {
      diff.push({ type: "removed", text: oldLines[i - 1] });
      i--;
    }
  }
  diff.reverse();

  // Collapse long unchanged sections
  let unchangedCount = 0;
  for (const line of diff) {
    if (line.type === "unchanged") {
      unchangedCount++;
      if (unchangedCount <= 3) {
        result.push(line);
      } else if (unchangedCount === 4) {
        result.push({ type: "unchanged", text: "..." });
      }
    } else {
      unchangedCount = 0;
      result.push(line);
    }
  }

  return result;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RevisionHistory({
  postId,
  currentTitle,
  currentContent,
}: {
  postId: string;
  currentTitle: string;
  currentContent: string;
}) {
  const [open, setOpen] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");

  const fetchRevisions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/blog/posts/${postId}/revisions`);
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setRevisions(data);
    } catch {
      setError("Erro ao carregar revisões");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (open && revisions.length === 0) {
      fetchRevisions();
    }
  }, [open, revisions.length, fetchRevisions]);

  async function handleRestore(revision: Revision) {
    if (
      !confirm(`Restaurar revisão #${revision.revisionNumber}? O conteúdo atual será substituído.`)
    ) {
      return;
    }
    setRestoring(true);
    setError("");
    try {
      const res = await fetch(`/api/blog/posts/${postId}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionId: revision.id }),
      });
      if (!res.ok) throw new Error("Erro ao restaurar");
      window.location.reload();
    } catch {
      setError("Erro ao restaurar revisão");
    } finally {
      setRestoring(false);
    }
  }

  const diff = selectedRevision ? computeDiff(selectedRevision.content, currentContent) : null;

  const titleChanged = selectedRevision && selectedRevision.title !== currentTitle;

  return (
    <div className="bg-surface-container">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40">
          <History size={14} />
          Histórico de Revisões
          {revisions.length > 0 && (
            <span className="bg-white/10 px-1.5 py-0.5 text-white/60">{revisions.length}</span>
          )}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-white/40" />
        ) : (
          <ChevronDown size={14} className="text-white/40" />
        )}
      </button>

      {open && (
        <div className="border-t border-white/5 p-4 space-y-3">
          {error && <p className="text-error text-xs font-mono">{error}</p>}

          {loading && (
            <p className="text-white/40 text-xs font-mono animate-pulse">A carregar...</p>
          )}

          {!loading && revisions.length === 0 && (
            <p className="text-white/30 text-xs font-mono">Sem revisões anteriores.</p>
          )}

          {/* Revision list */}
          {!selectedRevision &&
            revisions.map((rev) => (
              <button
                key={rev.id}
                type="button"
                onClick={() => setSelectedRevision(rev)}
                className="w-full text-left p-3 bg-surface-container-lowest hover:bg-white/5 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-tertiary">
                    Revisão #{rev.revisionNumber}
                  </span>
                  <span className="text-[9px] font-mono text-white/30">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-white/50 truncate">
                  {rev.editorName ?? "Utilizador removido"} &mdash; {rev.title}
                </p>
              </button>
            ))}

          {/* Diff view */}
          {selectedRevision && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-tertiary">
                  Revisão #{selectedRevision.revisionNumber} vs. Atual
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedRevision(null)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="text-[9px] font-mono text-white/30">
                {formatDate(selectedRevision.createdAt)} &mdash;{" "}
                {selectedRevision.editorName ?? "Utilizador removido"}
              </p>

              {titleChanged && (
                <div className="space-y-1">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-white/30">
                    Título
                  </p>
                  <div className="bg-surface-container-lowest p-2 font-mono text-xs space-y-0.5 overflow-x-auto">
                    <div className="text-red-400 bg-red-500/10 px-1">
                      - {selectedRevision.title}
                    </div>
                    <div className="text-green-400 bg-green-500/10 px-1">+ {currentTitle}</div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[9px] font-mono uppercase tracking-widest text-white/30">
                  Conteúdo
                </p>
                <div className="bg-surface-container-lowest p-2 font-mono text-[11px] leading-relaxed max-h-64 overflow-y-auto overflow-x-auto">
                  {diff &&
                    diff.map((line, idx) => (
                      <div
                        key={idx}
                        className={
                          line.type === "removed"
                            ? "text-red-400 bg-red-500/10 px-1"
                            : line.type === "added"
                              ? "text-green-400 bg-green-500/10 px-1"
                              : "text-white/30 px-1"
                        }
                      >
                        {line.type === "removed" ? "- " : line.type === "added" ? "+ " : "  "}
                        {line.text || "\u00A0"}
                      </div>
                    ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRestore(selectedRevision)}
                disabled={restoring}
                className="flex items-center gap-2 px-3 py-2 bg-tertiary/20 text-tertiary text-xs font-mono uppercase hover:bg-tertiary/30 transition-colors disabled:opacity-50"
              >
                <RotateCcw size={12} />
                {restoring ? "A restaurar..." : "Restaurar esta revisão"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
