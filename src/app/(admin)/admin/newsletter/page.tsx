import { db } from "@/lib/db";
import { newsletterSubscribers, newsletterCampaigns } from "@/lib/db/schema";
import { eq, count, desc, gte } from "drizzle-orm";
import Link from "next/link";
import { Mail, Users, PlusCircle, Send, Clock, FileText, TrendingUp } from "lucide-react";
import { SendCampaignButton } from "@/components/admin/SendCampaignButton";

async function getStats() {
  try {
    const [totalActive] = await db
      .select({ value: count() })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, "active"));

    const [totalUnsubscribed] = await db
      .select({ value: count() })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, "unsubscribed"));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentSignups] = await db
      .select({ value: count() })
      .from(newsletterSubscribers)
      .where(gte(newsletterSubscribers.subscribedAt, sevenDaysAgo));

    return {
      totalActive: totalActive?.value ?? 0,
      totalUnsubscribed: totalUnsubscribed?.value ?? 0,
      recentSignups: recentSignups?.value ?? 0,
    };
  } catch {
    return { totalActive: 0, totalUnsubscribed: 0, recentSignups: 0 };
  }
}

async function getCampaigns() {
  try {
    return db
      .select()
      .from(newsletterCampaigns)
      .orderBy(desc(newsletterCampaigns.createdAt))
      .limit(50);
  } catch {
    return [];
  }
}

const campaignStatusConfig = {
  draft: { label: "Rascunho", color: "bg-white/10 text-white/60" },
  scheduled: { label: "Agendada", color: "bg-secondary/10 text-secondary" },
  sending: { label: "A enviar", color: "bg-tertiary/10 text-tertiary" },
  sent: { label: "Enviada", color: "bg-primary/10 text-primary" },
  failed: { label: "Falhou", color: "bg-error/10 text-error" },
} as const;

export default async function AdminNewsletterPage() {
  const [stats, campaigns] = await Promise.all([getStats(), getCampaigns()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
            Newsletter
          </h1>
          <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
            Gerir subscrições e campanhas
          </p>
        </div>
        <Link
          href="/admin/newsletter/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-headline font-bold uppercase text-xs tracking-tight hover:shadow-[0_0_20px_rgba(161,255,194,0.3)] transition-all"
        >
          <PlusCircle size={14} />
          Nova Campanha
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container p-6 border-b-2 border-transparent hover:border-primary transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
              Subscritos Ativos
            </span>
            <Users size={14} className="text-primary/40" />
          </div>
          <h3 className="text-3xl font-headline font-black text-white">
            {stats.totalActive.toLocaleString("pt-PT")}
          </h3>
        </div>

        <div className="bg-surface-container p-6 border-b-2 border-transparent hover:border-secondary transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
              Novos (7 dias)
            </span>
            <TrendingUp size={14} className="text-secondary/40" />
          </div>
          <h3 className="text-3xl font-headline font-black text-white">
            {stats.recentSignups.toLocaleString("pt-PT")}
          </h3>
        </div>

        <div className="bg-surface-container p-6 border-b-2 border-transparent hover:border-white/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
              Cancelados
            </span>
            <Mail size={14} className="text-white/20" />
          </div>
          <h3 className="text-3xl font-headline font-black text-white/60">
            {stats.totalUnsubscribed.toLocaleString("pt-PT")}
          </h3>
        </div>
      </div>

      {/* Campaigns */}
      <div>
        <h2 className="font-headline font-black text-sm uppercase tracking-widest text-white mb-4">
          Campanhas
        </h2>

        {campaigns.length === 0 ? (
          <div className="bg-surface-container-low p-12 text-center">
            <Mail size={32} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
              Nenhuma campanha criada
            </p>
            <Link
              href="/admin/newsletter/new"
              className="inline-block mt-4 px-4 py-2 bg-primary/10 text-primary text-xs font-mono uppercase hover:bg-primary/20 transition-colors"
            >
              Criar primeira campanha
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container-low overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Assunto
                  </th>
                  <th className="text-left px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Estado
                  </th>
                  <th className="text-right px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Enviados
                  </th>
                  <th className="text-right px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Abertos
                  </th>
                  <th className="text-right px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Cliques
                  </th>
                  <th className="text-right px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Data
                  </th>
                  <th className="text-right px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const statusCfg = campaignStatusConfig[campaign.status];
                  const openRate =
                    campaign.sentCount > 0
                      ? Math.round((campaign.openCount / campaign.sentCount) * 100)
                      : 0;
                  const canSend = campaign.status === "draft" || campaign.status === "scheduled";
                  return (
                    <tr
                      key={campaign.id}
                      className="border-b border-white/5 hover:bg-surface-container transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {campaign.status === "sent" ? (
                            <Send size={14} className="text-primary/60 flex-shrink-0" />
                          ) : campaign.status === "scheduled" ? (
                            <Clock size={14} className="text-secondary/60 flex-shrink-0" />
                          ) : (
                            <FileText size={14} className="text-white/30 flex-shrink-0" />
                          )}
                          <span className="text-white font-mono text-xs truncate max-w-[280px]">
                            {campaign.subject}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 text-[9px] font-mono uppercase tracking-widest ${statusCfg.color}`}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-white/60">
                        {campaign.sentCount.toLocaleString("pt-PT")}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-white/60">
                        {campaign.sentCount > 0 ? (
                          <span>
                            {campaign.openCount}{" "}
                            <span className="text-white/30">({openRate}%)</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-white/60">
                        {campaign.sentCount > 0 ? campaign.clickCount : "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-[10px] text-white/40">
                        {(campaign.sentAt ?? campaign.createdAt).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canSend && <SendCampaignButton campaignId={campaign.id} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
