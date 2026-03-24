"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { SUBSCRIPTION_PRICES } from "@/lib/subscription-plans";

type PricingCardProps = {
  plan: "monthly" | "yearly";
  isCurrentPlan?: boolean;
  onSubscribe?: (plan: "monthly" | "yearly") => void;
  disabled?: boolean;
};

const PLAN_FEATURES = [
  "Acesso antecipado a novos conteúdos",
  "Badge Premium no perfil",
  "Sem anúncios",
  "Conteúdos exclusivos",
  "Suporte prioritário",
  "Bónus de XP (+20%)",
];

export function PricingCard({ plan, isCurrentPlan, onSubscribe, disabled }: PricingCardProps) {
  const config = SUBSCRIPTION_PRICES[plan];
  const priceEur = (config.amount / 100).toFixed(2).replace(".", ",");
  const isYearly = plan === "yearly";
  const monthlyEquivalent = isYearly
    ? (config.amount / 12 / 100).toFixed(2).replace(".", ",")
    : null;

  return (
    <div
      className={`relative rounded-lg p-6 ${
        isYearly
          ? "border border-primary/40 bg-surface-container-lowest shadow-[0_0_20px_rgba(57,255,20,0.08)]"
          : "border border-white/10 bg-surface-container-lowest"
      }`}
    >
      {isYearly && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 font-mono text-xs font-bold text-black">
          POUPA 33%
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-display text-lg font-bold text-text-primary">
          {isYearly ? "Premium Anual" : "Premium Mensal"}
        </h3>
        <p className="mt-1 text-sm text-text-secondary">
          {isYearly ? "O melhor valor — um ano de acesso completo" : "Acesso premium mês a mês"}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-3xl font-bold text-text-primary">€{priceEur}</span>
          <span className="text-sm text-text-secondary">/{isYearly ? "ano" : "mês"}</span>
        </div>
        {monthlyEquivalent && (
          <p className="mt-1 font-mono text-xs text-text-secondary">≈ €{monthlyEquivalent}/mês</p>
        )}
      </div>

      <ul className="mb-6 space-y-3">
        {PLAN_FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <button
          disabled
          className="w-full rounded-md bg-white/10 px-4 py-2.5 font-mono text-sm font-medium text-text-secondary"
        >
          Plano atual
        </button>
      ) : (
        <button
          onClick={() => onSubscribe?.(plan)}
          disabled={disabled}
          className={`w-full rounded-md px-4 py-2.5 font-mono text-sm font-bold transition-all ${
            isYearly
              ? "bg-primary text-black hover:bg-primary/90 disabled:bg-primary/50"
              : "border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-50"
          } disabled:cursor-not-allowed`}
        >
          {disabled ? "A processar..." : "Subscrever"}
        </button>
      )}
    </div>
  );
}

export function PricingSection({ currentPlan }: { currentPlan?: "monthly" | "yearly" | null }) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  async function handleSubscribe(plan: "monthly" | "yearly") {
    setLoading(plan);

    try {
      const res = await fetch("/api/store/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro ao criar sessão de pagamento");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Erro de rede. Tenta novamente.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
      <PricingCard
        plan="monthly"
        isCurrentPlan={currentPlan === "monthly"}
        onSubscribe={handleSubscribe}
        disabled={loading !== null}
      />
      <PricingCard
        plan="yearly"
        isCurrentPlan={currentPlan === "yearly"}
        onSubscribe={handleSubscribe}
        disabled={loading !== null}
      />
    </div>
  );
}
