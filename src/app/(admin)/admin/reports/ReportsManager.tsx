"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Flag,
  Check,
  X,
  Loader2,
  Trash2,
  MessageSquare,
  FileText,
  Rocket,
  ShoppingBag,
  Star,
} from "lucide-react";

interface Report {
  id: string;
  reporterId: string;
  contentType: string;
  contentId: string;
  reason: string;
  details: string | null;
  status: string;
  resolvedBy: string | null;
  resolvedNote: string | null;
  createdAt: Date;
  reporterUsername: string;
  reporterDisplayName: string | null;
  reporterImage: string | null;
}

const CONTENT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: typeof FileText }> =
  {
    post: {
      label: "Post",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      icon: FileText,
    },
    comment: {
      label: "Comentário",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      icon: MessageSquare,
    },
    project: {
      label: "Projeto",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      icon: Rocket,
    },
    product: {
      label: "Produto",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      icon: ShoppingBag,
    },
    review: {
      label: "Review",
      color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      icon: Star,
    },
  };

const REASON_CONFIG: Record<string, { label: string; color: string }> = {
  spam: { label: "Spam", color: "bg-yellow-500/10 text-yellow-400" },
  harassment: { label: "Assédio", color: "bg-red-500/10 text-red-400" },
  inappropriate: { label: "Inapropriado", color: "bg-orange-500/10 text-orange-400" },
  copyright: { label: "Copyright", color: "bg-indigo-500/10 text-indigo-400" },
  other: { label: "Outro", color: "bg-white/5 text-white/50" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-400" },
  resolved: { label: "Resolvido", color: "bg-primary/10 text-primary" },
  dismissed: { label: "Dispensado", color: "bg-white/5 text-white/40" },
};

type FilterTab = "all" | "pending" | "resolved" | "dismissed";

export function ReportsManager({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredReports =
    activeTab === "all" ? reports : reports.filter((r) => r.status === activeTab);

  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const dismissedCount = reports.filter((r) => r.status === "dismissed").length;

  async function handleResolve(id: string, status: "resolved" | "dismissed") {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erro ao processar denúncia");
        return;
      }

      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch {
      alert("Erro ao processar denúncia");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDeleteComment(reportId: string, commentId: string) {
    if (!confirm("Tens a certeza que queres remover este comentário?")) return;

    setProcessingId(reportId);
    try {
      const deleteRes = await fetch(`/api/blog/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!deleteRes.ok) {
        const data = await deleteRes.json();
        alert(data.error ?? "Erro ao remover comentário");
        return;
      }

      // Resolve the report after deleting the comment
      const resolveRes = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved", resolvedNote: "Comentário removido" }),
      });

      if (resolveRes.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r)),
        );
      }
    } catch {
      alert("Erro ao remover comentário");
    } finally {
      setProcessingId(null);
    }
  }

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all", label: "Todos", count: reports.length },
    { key: "pending", label: "Pendentes", count: pendingCount },
    { key: "resolved", label: "Resolvidos", count: resolvedCount },
    { key: "dismissed", label: "Dispensados", count: dismissedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Flag size={20} className="text-primary" />
          Denúncias
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Gere as denúncias de conteúdo submetidas pela comunidade.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-surface-container-low rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-3 py-2 text-xs font-mono uppercase rounded transition-all ${
              activeTab === tab.key
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-white/40 hover:text-white/60 border border-transparent"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && <span className="ml-1.5 opacity-60">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-surface-container-low rounded-lg p-8 text-center">
          <Flag size={32} className="mx-auto text-white/10 mb-3" />
          <p className="text-sm text-white/30">Sem denúncias nesta categoria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const typeConfig = CONTENT_TYPE_CONFIG[report.contentType] ?? {
              label: report.contentType,
              color: "bg-white/5 text-white/40 border-white/10",
              icon: FileText,
            };
            const reasonConfig = REASON_CONFIG[report.reason] ?? {
              label: report.reason,
              color: "bg-white/5 text-white/50",
            };
            const statusConfig = STATUS_CONFIG[report.status] ?? {
              label: report.status,
              color: "bg-white/5 text-white/40",
            };
            const TypeIcon = typeConfig.icon;
            const isPending = report.status === "pending";
            const isProcessing = processingId === report.id;

            return (
              <div key={report.id} className="bg-surface-container-low rounded-lg p-5 space-y-3">
                {/* Top row: badges + date */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono uppercase rounded border ${typeConfig.color}`}
                    >
                      <TypeIcon size={12} />
                      {typeConfig.label}
                    </span>
                    <span
                      className={`px-2 py-1 text-[10px] font-mono uppercase rounded ${reasonConfig.color}`}
                    >
                      {reasonConfig.label}
                    </span>
                    <span
                      className={`px-2 py-1 text-[10px] font-mono uppercase rounded ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-white/30">
                    {new Date(report.createdAt).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Reporter info */}
                <div className="flex items-center gap-3">
                  {report.reporterImage ? (
                    <Image
                      src={report.reporterImage}
                      alt={report.reporterUsername}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">
                        {(report.reporterDisplayName || report.reporterUsername)
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-white/70">
                      Denunciado por{" "}
                      <span className="text-white font-medium">
                        {report.reporterDisplayName || report.reporterUsername}
                      </span>
                    </p>
                    <p className="text-[10px] font-mono text-white/30">
                      ID: {report.contentId.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                {/* Details */}
                {report.details && (
                  <p className="text-sm text-white/50 bg-surface-container rounded-lg p-3">
                    {report.details}
                  </p>
                )}

                {/* Resolved note */}
                {report.resolvedNote && report.status !== "pending" && (
                  <p className="text-xs text-white/30 italic">Nota: {report.resolvedNote}</p>
                )}

                {/* Actions for pending reports */}
                {isPending && (
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleResolve(report.id, "resolved")}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-mono rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      Resolver
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleResolve(report.id, "dismissed")}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-white/50 text-xs font-mono rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <X size={12} />
                      )}
                      Dispensar
                    </button>
                    {report.contentType === "comment" && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleDeleteComment(report.id, report.contentId)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                        Remover Comentário
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
