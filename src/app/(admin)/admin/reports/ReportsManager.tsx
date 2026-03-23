"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Shield,
  Check,
  X,
  Loader2,
  Flag,
  MessageSquare,
  FileText,
  Rocket,
  ShoppingBag,
  Star,
  Trash2,
} from "lucide-react";

interface Report {
  id: string;
  contentType: string;
  contentId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: Date;
  reporterName: string | null;
  reporterDisplayName: string | null;
  reporterImage: string | null;
  contentPreview: string | null;
  contentAuthorId: string | null;
}

const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  harassment: "Assédio",
  inappropriate: "Impróprio",
  copyright: "Copyright",
  other: "Outro",
};

const REASON_COLORS: Record<string, string> = {
  spam: "bg-secondary/20 text-secondary border-secondary/30",
  harassment: "bg-error/20 text-error border-error/30",
  inappropriate: "bg-tertiary/20 text-tertiary border-tertiary/30",
  copyright: "bg-primary/20 text-primary border-primary/30",
  other: "bg-white/10 text-white/60 border-white/20",
};

const TYPE_LABELS: Record<string, string> = {
  post: "Post",
  comment: "Comentário",
  project: "Projeto",
  product: "Produto",
  review: "Avaliação",
};

const TYPE_ICONS: Record<string, typeof FileText> = {
  post: FileText,
  comment: MessageSquare,
  project: Rocket,
  product: ShoppingBag,
  review: Star,
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-secondary/20 text-secondary",
  resolved: "bg-primary/20 text-primary",
  dismissed: "bg-white/10 text-white/40",
};

export function ReportsManager({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved" | "dismissed">("all");

  async function handleAction(id: string, action: "resolved" | "dismissed") {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erro ao processar denúncia");
        return;
      }

      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)));
    } catch {
      alert("Erro ao processar denúncia");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDeleteComment(reportId: string, commentId: string) {
    if (!confirm("Tens a certeza que queres remover este comentário? Esta ação é irreversível.")) {
      return;
    }

    setProcessingId(reportId);
    try {
      // Delete the comment
      const commentRes = await fetch(`/api/blog/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!commentRes.ok) {
        const data = await commentRes.json();
        alert(data.error ?? "Erro ao remover comentário");
        return;
      }

      // Resolve the report
      await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved", resolvedNote: "Comentário removido." }),
      });

      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r)));
    } catch {
      alert("Erro ao processar ação");
    } finally {
      setProcessingId(null);
    }
  }

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-error" />
          <h1 className="font-headline text-2xl font-black uppercase tracking-tight text-white">
            Denúncias
          </h1>
          {pendingCount > 0 && (
            <span className="bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "resolved", "dismissed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest transition-all ${
              filter === f
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-white/40 border border-white/5 hover:border-white/10 hover:text-white/60"
            }`}
          >
            {f === "all"
              ? "Todas"
              : f === "pending"
                ? "Pendentes"
                : f === "resolved"
                  ? "Resolvidas"
                  : "Dispensadas"}
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-2 bg-error text-white text-[8px] px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Shield size={40} className="mx-auto text-white/10 mb-4" />
          <p className="font-mono text-xs text-white/30 uppercase tracking-widest">
            {filter === "pending" ? "SEM_DENUNCIAS_PENDENTES" : "SEM_DENUNCIAS"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => {
            const TypeIcon = TYPE_ICONS[report.contentType] ?? Flag;
            const isProcessing = processingId === report.id;
            const reporterName = report.reporterDisplayName || report.reporterName || "Utilizador";

            return (
              <div
                key={report.id}
                className={`p-6 border transition-all ${
                  report.status === "pending"
                    ? "bg-surface-container border-error/10"
                    : "bg-surface-container-low border-white/5 opacity-60"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Left: reporter + content info */}
                  <div className="flex-1 min-w-0">
                    {/* Reporter */}
                    <div className="flex items-center gap-3 mb-3">
                      {report.reporterImage ? (
                        <Image
                          src={report.reporterImage}
                          alt={reporterName}
                          width={28}
                          height={28}
                          className="rounded-full border border-primary/20"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-surface-container-highest border border-primary/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white/60">
                            {reporterName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{reporterName}</span>
                        <span className="text-[10px] text-white/20 font-mono">
                          {new Date(report.createdAt).toLocaleDateString("pt-PT", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {/* Content type badge */}
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-container-high border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white/60">
                        <TypeIcon size={12} />
                        {TYPE_LABELS[report.contentType] ?? report.contentType}
                      </span>

                      {/* Reason badge */}
                      <span
                        className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest border ${
                          REASON_COLORS[report.reason] ?? REASON_COLORS.other
                        }`}
                      >
                        {REASON_LABELS[report.reason] ?? report.reason}
                      </span>

                      {/* Status badge */}
                      <span
                        className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest ${
                          STATUS_COLORS[report.status] ?? ""
                        }`}
                      >
                        {report.status === "pending"
                          ? "Pendente"
                          : report.status === "resolved"
                            ? "Resolvida"
                            : "Dispensada"}
                      </span>
                    </div>

                    {/* Content preview */}
                    {report.contentPreview && (
                      <div className="bg-surface-container-lowest border border-white/5 px-4 py-3 mb-3">
                        <p className="text-xs text-white/50 line-clamp-2">
                          {report.contentPreview}
                        </p>
                      </div>
                    )}

                    {/* Details */}
                    {report.details && (
                      <p className="text-xs text-white/40 italic">&ldquo;{report.details}&rdquo;</p>
                    )}
                  </div>

                  {/* Right: actions */}
                  {report.status === "pending" && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Delete comment quick action */}
                      {report.contentType === "comment" && (
                        <button
                          onClick={() => handleDeleteComment(report.id, report.contentId)}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3 py-2 bg-error/10 border border-error/20 text-error text-[10px] font-mono uppercase tracking-widest hover:bg-error/20 transition-all disabled:opacity-50"
                          title="Remover comentário e resolver"
                        >
                          {isProcessing ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Remover
                        </button>
                      )}

                      <button
                        onClick={() => handleAction(report.id, "resolved")}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50"
                        title="Resolver denúncia"
                      >
                        {isProcessing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        Resolver
                      </button>

                      <button
                        onClick={() => handleAction(report.id, "dismissed")}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 text-white/40 text-[10px] font-mono uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                        title="Dispensar denúncia"
                      >
                        {isProcessing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                        Dispensar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
