"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";
import type { AuditLogEntry, ActionLabel } from "./page";

const TARGET_TYPE_LABELS: Record<string, string> = {
  user: "Utilizador",
  post: "Post",
  comment: "Comentário",
  project: "Projeto",
  product: "Produto",
  report: "Denúncia",
};

function getTargetLink(targetType: string, targetId: string): string | null {
  switch (targetType) {
    case "user":
      return `/profile/${targetId}`;
    case "post":
      return `/admin/blog`;
    case "project":
      return `/admin/showcase`;
    case "product":
      return `/admin/store`;
    case "report":
      return `/admin/reports`;
    default:
      return null;
  }
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditLogTable({
  entries,
  actionLabels,
}: {
  entries: AuditLogEntry[];
  actionLabels: Record<string, ActionLabel>;
}) {
  const [actionFilter, setActionFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const uniqueActions = [...new Set(entries.map((e) => e.action))].sort();

  const filtered = actionFilter ? entries.filter((e) => e.action === actionFilter) : entries;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-white/30" />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-surface-container-lowest border border-white/10 text-sm text-white px-3 py-2 font-mono focus:outline-none focus:border-primary/50"
        >
          <option value="">Todas as ações ({entries.length})</option>
          {uniqueActions.map((action) => {
            const label = actionLabels[action]?.label ?? action;
            const count = entries.filter((e) => e.action === action).length;
            return (
              <option key={action} value={action}>
                {label} ({count})
              </option>
            );
          })}
        </select>
        <span className="text-xs font-mono text-white/30">
          {filtered.length} registo{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-mono text-sm text-white/30">
            Nenhuma entrada no registo de auditoria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-1">
            <thead className="font-label text-[10px] text-white/30 uppercase tracking-[0.15em]">
              <tr>
                <th className="px-4 py-3 font-normal w-8"></th>
                <th className="px-4 py-3 font-normal">Data</th>
                <th className="px-4 py-3 font-normal">Admin</th>
                <th className="px-4 py-3 font-normal">Ação</th>
                <th className="px-4 py-3 font-normal">Alvo</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.map((entry) => {
                const isExpanded = expandedId === entry.id;
                const actionLabel = actionLabels[entry.action] ?? {
                  label: entry.action,
                  color: "bg-white/10 text-white/50",
                };
                const actorName = entry.actorDisplayName || entry.actorName || "Sistema";
                const targetLink = getTargetLink(entry.targetType, entry.targetId);
                const targetTypeLabel = TARGET_TYPE_LABELS[entry.targetType] ?? entry.targetType;
                let parsedDetails: Record<string, unknown> | null = null;
                if (entry.details) {
                  try {
                    parsedDetails = JSON.parse(entry.details);
                  } catch {
                    parsedDetails = null;
                  }
                }

                return (
                  <>
                    <tr
                      key={entry.id}
                      className="bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      <td className="px-4 py-3 text-white/30">
                        {entry.details ? (
                          isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-white/50 whitespace-nowrap">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {entry.actorImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={entry.actorImage}
                              alt={actorName}
                              className="w-6 h-6 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-[8px] font-bold text-white/50">
                              {actorName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs text-white/70">{actorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase ${actionLabel.color}`}
                        >
                          {actionLabel.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-white/30 uppercase">
                            {targetTypeLabel}
                          </span>
                          {targetLink ? (
                            <Link
                              href={targetLink}
                              className="text-xs text-primary/70 hover:text-primary transition-colors font-mono"
                              onClick={(e) => e.stopPropagation()}
                            >
                              ver &rarr;
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && entry.details && (
                      <tr key={`${entry.id}-details`} className="bg-surface-container-lowest">
                        <td colSpan={5} className="px-8 py-4">
                          <div className="space-y-2">
                            {parsedDetails ? (
                              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                                {Object.entries(parsedDetails).map(([key, value]) => (
                                  <div key={key} className="flex items-baseline gap-2">
                                    <span className="text-[10px] font-mono text-white/30 uppercase">
                                      {key}:
                                    </span>
                                    <span className="text-xs text-white/60 font-mono">
                                      {String(value ?? "—")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <pre className="text-xs text-white/50 font-mono whitespace-pre-wrap">
                                {entry.details}
                              </pre>
                            )}
                            {entry.ipAddress && (
                              <p className="text-[10px] font-mono text-white/20 mt-2">
                                IP: {entry.ipAddress}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
