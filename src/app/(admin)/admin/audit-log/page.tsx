import { db } from "@/lib/db";
import { adminAuditLog, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { AuditLogTable } from "./AuditLogTable";

export const metadata = {
  title: "Registo de Auditoria | Admin | VibeTuga",
};

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  user_banned: { label: "Utilizador Banido", color: "bg-red-500/20 text-red-400" },
  user_unbanned: { label: "Utilizador Desbanido", color: "bg-green-500/20 text-green-400" },
  user_verified: { label: "Utilizador Verificado", color: "bg-primary/20 text-primary" },
  user_unverified: { label: "Verificação Removida", color: "bg-amber-500/20 text-amber-400" },
  role_changed: { label: "Role Alterado", color: "bg-purple-500/20 text-purple-400" },
  role_request_approved: {
    label: "Pedido de Role Aprovado",
    color: "bg-green-500/20 text-green-400",
  },
  role_request_rejected: { label: "Pedido de Role Rejeitado", color: "bg-red-500/20 text-red-400" },
  post_approved: { label: "Post Aprovado", color: "bg-green-500/20 text-green-400" },
  post_status_draft: { label: "Post → Rascunho", color: "bg-white/10 text-white/50" },
  post_status_pending_review: { label: "Post → Pendente", color: "bg-amber-500/20 text-amber-400" },
  post_status_archived: { label: "Post Arquivado", color: "bg-white/10 text-white/50" },
  post_deleted: { label: "Post Eliminado", color: "bg-red-500/20 text-red-400" },
  product_approved: { label: "Produto Aprovado", color: "bg-green-500/20 text-green-400" },
  product_status_pending: { label: "Produto → Pendente", color: "bg-amber-500/20 text-amber-400" },
  product_status_rejected: { label: "Produto Rejeitado", color: "bg-red-500/20 text-red-400" },
  product_status_archived: { label: "Produto Arquivado", color: "bg-white/10 text-white/50" },
  product_deleted: { label: "Produto Eliminado", color: "bg-red-500/20 text-red-400" },
  project_approved: { label: "Projeto Aprovado", color: "bg-green-500/20 text-green-400" },
  project_featured: { label: "Projeto Destacado", color: "bg-primary/20 text-primary" },
  project_status_rejected: { label: "Projeto Rejeitado", color: "bg-red-500/20 text-red-400" },
  project_deleted: { label: "Projeto Eliminado", color: "bg-red-500/20 text-red-400" },
  report_resolved: { label: "Denúncia Resolvida", color: "bg-green-500/20 text-green-400" },
  report_dismissed: { label: "Denúncia Dispensada", color: "bg-white/10 text-white/50" },
  comment_edited: { label: "Comentário Editado", color: "bg-blue-500/20 text-blue-400" },
  comment_approved: { label: "Comentário Aprovado", color: "bg-green-500/20 text-green-400" },
  comment_disapproved: { label: "Comentário Desaprovado", color: "bg-amber-500/20 text-amber-400" },
  comment_deleted: { label: "Comentário Eliminado", color: "bg-red-500/20 text-red-400" },
  bulk_role_change: {
    label: "Alteração de Role em Massa",
    color: "bg-purple-500/20 text-purple-400",
  },
};

export type AuditLogEntry = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: Date;
  actorName: string | null;
  actorDisplayName: string | null;
  actorImage: string | null;
};

export type ActionLabel = { label: string; color: string };

export { ACTION_LABELS };

export default async function AuditLogPage() {
  const entries = await db
    .select({
      id: adminAuditLog.id,
      action: adminAuditLog.action,
      targetType: adminAuditLog.targetType,
      targetId: adminAuditLog.targetId,
      details: adminAuditLog.details,
      ipAddress: adminAuditLog.ipAddress,
      createdAt: adminAuditLog.createdAt,
      actorName: users.discordUsername,
      actorDisplayName: users.displayName,
      actorImage: users.image,
    })
    .from(adminAuditLog)
    .leftJoin(users, eq(adminAuditLog.actorId, users.id))
    .orderBy(desc(adminAuditLog.createdAt))
    .limit(200);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Registo de Auditoria
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Histórico de todas as ações administrativas
        </p>
      </div>

      <AuditLogTable entries={entries} actionLabels={ACTION_LABELS} />
    </div>
  );
}
