"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, Zap, Loader2 } from "lucide-react";

const FEATURES = [
  "Acesso antecipado a conteúdo",
  "Badge exclusivo Premium",
  "Suporte prioritário",
  "Experiência sem anúncios",
  "Limites de API estendidos",
];

interface PricingCardsProps {
  isAuthenticated: boolean;
  activePlan: string | null;
  periodEnd: string | null;
}

export function PricingCards({ isAuthenticated, activePlan, periodEnd }: PricingCardsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  async function handleSubscribe(plan: "monthly" | "yearly") {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch("/api/store/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao iniciar checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  }

  const formattedEnd = periodEnd
    ? new Date(periodEnd).toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
      {/* Monthly Plan */}
      <PlanCard
        name="Mensal"
        price="4,99"
        period="/mês"
        icon={<Zap size={20} />}
        features={FEATURES}
        isActive={activePlan === "monthly"}
        periodEnd={formattedEnd}
        loading={loading === "monthly"}
        onSubscribe={() => handleSubscribe("monthly")}
        recommended={false}
        isAuthenticated={isAuthenticated}
      />

      {/* Yearly Plan */}
      <PlanCard
        name="Anual"
        price="49,99"
        period="/ano"
        icon={<Crown size={20} />}
        features={[...FEATURES, "2 meses grátis vs. mensal"]}
        isActive={activePlan === "yearly"}
        periodEnd={formattedEnd}
        loading={loading === "yearly"}
        onSubscribe={() => handleSubscribe("yearly")}
        recommended={true}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  icon: React.ReactNode;
  features: string[];
  isActive: boolean;
  periodEnd: string | null;
  loading: boolean;
  onSubscribe: () => void;
  recommended: boolean;
  isAuthenticated: boolean;
}

function PlanCard({
  name,
  price,
  period,
  icon,
  features,
  isActive,
  periodEnd,
  loading,
  onSubscribe,
  recommended,
  isAuthenticated,
}: PlanCardProps) {
  return (
    <div
      className={`relative flex flex-col p-8 rounded-lg backdrop-blur-xl transition-all duration-300 ${
        recommended
          ? "bg-white/[0.06] shadow-[0_0_40px_rgba(161,255,194,0.08)] ring-1 ring-primary/30"
          : "bg-white/[0.03] ring-1 ring-white/5 hover:ring-white/10"
      }`}
    >
      {/* Recommended badge */}
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-on-primary text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-sm">
            Recomendado
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={recommended ? "text-primary" : "text-white/40"}>{icon}</span>
          <h3 className="text-lg font-bold font-headline tracking-tight text-white">{name}</h3>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black font-mono text-white">&euro;{price}</span>
          <span className="text-white/30 text-sm">{period}</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check
              size={16}
              className={`mt-0.5 shrink-0 ${recommended ? "text-primary" : "text-white/30"}`}
            />
            <span className="text-white/60">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isActive ? (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-sm">
            <Check size={14} />
            Plano Ativo
          </div>
          {periodEnd && <p className="text-[11px] text-white/30 mt-2">Renova a {periodEnd}</p>}
        </div>
      ) : (
        <button
          onClick={onSubscribe}
          disabled={loading || !!isActive}
          className={`w-full py-3 font-bold text-sm uppercase tracking-widest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            recommended
              ? "bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(161,255,194,0.4)] active:scale-[0.98]"
              : "bg-white/5 text-white border border-white/10 hover:border-primary/30 hover:text-primary active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin mx-auto" />
          ) : isAuthenticated ? (
            "Subscrever"
          ) : (
            "Entrar para Subscrever"
          )}
        </button>
      )}
    </div>
  );
}
