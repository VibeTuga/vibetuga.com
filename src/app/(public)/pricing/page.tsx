import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PricingCards } from "@/components/store/PricingCards";

export const metadata: Metadata = {
  title: "Planos Premium | VibeTuga",
  description:
    "Desbloqueia acesso antecipado, badge exclusivo, suporte prioritário e mais com o plano VibeTuga Premium.",
  openGraph: {
    title: "Planos Premium | VibeTuga",
    description:
      "Desbloqueia acesso antecipado, badge exclusivo, suporte prioritário e mais com o plano VibeTuga Premium.",
  },
  alternates: {
    canonical: "https://vibetuga.com/pricing",
  },
};

export default async function PricingPage() {
  const session = await auth();

  let activeSub: { plan: string; status: string; currentPeriodEnd: Date } | null = null;

  if (session?.user) {
    const [sub] = await db
      .select({
        plan: subscriptions.plan,
        status: subscriptions.status,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
      })
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, session.user.id), eq(subscriptions.status, "active")))
      .limit(1);

    if (sub) {
      activeSub = sub;
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] mb-4">
          PREMIUM_ACCESS
        </p>
        <h1 className="text-4xl sm:text-5xl font-black font-headline tracking-tighter text-white mb-4">
          Eleva o teu nível
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Desbloqueia funcionalidades exclusivas e apoia a comunidade VibeTuga.
        </p>
      </div>

      {/* Cards */}
      <PricingCards
        isAuthenticated={!!session?.user}
        activePlan={activeSub?.plan ?? null}
        periodEnd={activeSub?.currentPeriodEnd?.toISOString() ?? null}
      />

      {/* FAQ */}
      <div className="mt-24 max-w-2xl mx-auto">
        <h2 className="text-xl font-black font-headline tracking-tighter text-white mb-8 text-center">
          Perguntas Frequentes
        </h2>
        <div className="space-y-6">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="bg-surface-container rounded-lg p-6">
              <h3 className="text-sm font-bold text-white mb-2">{item.q}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim! Podes cancelar a tua subscrição a qualquer momento no dashboard. O acesso premium continua até ao fim do período já pago.",
  },
  {
    q: "Qual a diferença entre o plano mensal e anual?",
    a: "O plano anual oferece um desconto significativo em comparação com o mensal. Ambos dão acesso às mesmas funcionalidades premium.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "O pagamento é processado de forma segura pelo Stripe. Aceitamos cartões de crédito/débito e outros métodos de pagamento.",
  },
  {
    q: "O que acontece quando o meu plano expira?",
    a: "Voltas ao plano gratuito com todas as funcionalidades base. Não perdes nenhum conteúdo ou dados.",
  },
];
