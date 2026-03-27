import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CreditCard, Crown, ExternalLink } from "lucide-react";
import { CancelSubscriptionButton } from "@/components/store/CancelSubscriptionButton";

export const metadata: Metadata = {
  title: "Subscrição | Dashboard | VibeTuga",
};

const PLAN_LABELS: Record<string, string> = {
  monthly: "Mensal",
  yearly: "Anual",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Ativa", color: "text-primary" },
  canceled: { label: "Cancelada", color: "text-red-400" },
  past_due: { label: "Pagamento Pendente", color: "text-yellow-400" },
};

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const allSubs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))
    .orderBy(desc(subscriptions.createdAt));

  const activeSub = allSubs.find((s) => s.status === "active");
  const history = allSubs.filter((s) => s.status !== "active");

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-headline tracking-tighter text-white mb-2">
          Subscrição
        </h1>
        <p className="text-white/50 text-sm">Gere o teu plano premium VibeTuga.</p>
      </div>

      {/* Active Subscription */}
      {activeSub ? (
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-lg ring-1 ring-primary/20 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <Crown size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-headline text-white">
                Plano {PLAN_LABELS[activeSub.plan] ?? activeSub.plan}
              </h2>
              <span
                className={`text-xs font-mono uppercase tracking-widest ${STATUS_LABELS[activeSub.status]?.color ?? "text-white/40"}`}
              >
                {STATUS_LABELS[activeSub.status]?.label ?? activeSub.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1">
                Plano
              </p>
              <p className="text-white font-bold">
                {PLAN_LABELS[activeSub.plan] ?? activeSub.plan}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1">
                Valor
              </p>
              <p className="text-white font-mono font-bold">
                &euro;{activeSub.plan === "monthly" ? "4,99/mês" : "49,99/ano"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1">
                Próxima Faturação
              </p>
              <p className="text-white font-mono">
                {activeSub.currentPeriodEnd.toLocaleDateString("pt-PT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <CancelSubscriptionButton />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
            <CreditCard size={28} className="text-white/20" />
          </div>
          <h2 className="font-headline text-xl font-bold text-white mb-2">Sem subscrição ativa</h2>
          <p className="text-white/40 text-sm max-w-md mb-6">
            Ainda não tens um plano premium. Explora os nossos planos e desbloqueia funcionalidades
            exclusivas.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] transition-all"
          >
            <ExternalLink size={14} />
            Ver Planos
          </Link>
        </div>
      )}

      {/* Subscription History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-bold font-headline tracking-tight text-white mb-4">
            Histórico
          </h2>
          <div className="space-y-3">
            {history.map((sub) => {
              const statusInfo = STATUS_LABELS[sub.status] ?? {
                label: sub.status,
                color: "text-white/40",
              };
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between bg-surface-container rounded-lg px-6 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center">
                      <CreditCard size={14} className="text-white/30" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        Plano {PLAN_LABELS[sub.plan] ?? sub.plan}
                      </p>
                      <p className="text-[11px] text-white/30 font-mono">
                        {sub.createdAt.toLocaleDateString("pt-PT")} &mdash;{" "}
                        {sub.currentPeriodEnd.toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase tracking-widest ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
