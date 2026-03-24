"use client";

import { useEffect, useState } from "react";
import { Wallet, ExternalLink, RefreshCw, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface BalanceEntry {
  amount: number;
  currency: string;
}

interface ConnectStatus {
  connected: boolean;
  onboarded: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  balance: {
    available: BalanceEntry[];
    pending: BalanceEntry[];
  } | null;
}

function formatCents(cents: number, currency: string = "eur") {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function SellerPayoutsPage() {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);

  async function fetchStatus() {
    try {
      const res = await fetch("/api/store/seller/connect/status");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao obter estado");
      }
      const data: ConnectStatus = await res.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao obter estado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  async function handleStartOnboarding() {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/store/seller/connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao iniciar onboarding");
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setActionLoading(false);
    }
  }

  async function handleRefreshOnboarding() {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/store/seller/connect/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar link");
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setActionLoading(false);
    }
  }

  async function handleOpenDashboard() {
    if (dashboardUrl) {
      window.open(dashboardUrl, "_blank");
      return;
    }

    setActionLoading(true);
    try {
      // Use the login link API — we'll create it client-side via our status endpoint
      // Actually, we need a dedicated endpoint. Let's use the Stripe Express dashboard link.
      const res = await fetch("/api/store/seller/connect/dashboard");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao abrir dashboard");
      setDashboardUrl(data.url);
      window.open(data.url, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="flex items-center justify-center gap-3 text-white/50">
          <Loader2 size={20} className="animate-spin" />
          <span className="font-mono text-sm">A carregar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-white">
          Pagamentos
        </h1>
        <p className="text-sm text-white/50 mt-1 font-mono">
          Gestão de pagamentos e levantamentos via Stripe Connect
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Not connected — show onboarding CTA */}
      {status && !status.connected && (
        <div className="bg-surface-container-low border border-white/5 rounded-lg p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Wallet size={32} className="text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-heading)]">
              Configurar Pagamentos
            </h2>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              Configura a tua conta Stripe Connect para receber pagamentos das vendas dos teus
              produtos. O processo demora apenas alguns minutos.
            </p>
          </div>
          <button
            onClick={handleStartOnboarding}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-mono text-sm font-bold uppercase tracking-widest rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
            Configurar Pagamentos
          </button>
          <p className="text-xs text-white/30">
            A VibeTuga cobra uma comissão de {process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT ?? "15"}%
            por venda.
          </p>
        </div>
      )}

      {/* Connected but not onboarded — show resume onboarding */}
      {status && status.connected && !status.onboarded && (
        <div className="bg-surface-container-low border border-yellow-500/20 rounded-lg p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center">
            <RefreshCw size={32} className="text-yellow-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-heading)]">
              Onboarding Incompleto
            </h2>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              A configuração da tua conta Stripe ainda não está completa. Retoma o processo para
              começar a receber pagamentos.
            </p>
          </div>
          <button
            onClick={handleRefreshOnboarding}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-mono text-sm font-bold uppercase tracking-widest rounded hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Retomar Configuração
          </button>
        </div>
      )}

      {/* Fully onboarded — show balance and dashboard link */}
      {status && status.onboarded && (
        <div className="space-y-6">
          {/* Status badge */}
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={16} className="text-primary" />
            <span className="text-primary font-mono">Conta Connect ativa</span>
            {status.chargesEnabled && (
              <span className="text-xs text-white/30 font-mono ml-2">Pagamentos ativos</span>
            )}
            {status.payoutsEnabled && (
              <span className="text-xs text-white/30 font-mono ml-2">Levantamentos ativos</span>
            )}
          </div>

          {/* Balance cards */}
          {status.balance && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-container-low border border-white/5 rounded-lg p-6">
                <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2">
                  Saldo Disponível
                </p>
                <p className="text-3xl font-bold text-primary font-[family-name:var(--font-heading)]">
                  {status.balance.available.length > 0
                    ? formatCents(
                        status.balance.available[0].amount,
                        status.balance.available[0].currency,
                      )
                    : formatCents(0)}
                </p>
              </div>
              <div className="bg-surface-container-low border border-white/5 rounded-lg p-6">
                <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2">
                  Saldo Pendente
                </p>
                <p className="text-3xl font-bold text-yellow-400 font-[family-name:var(--font-heading)]">
                  {status.balance.pending.length > 0
                    ? formatCents(
                        status.balance.pending[0].amount,
                        status.balance.pending[0].currency,
                      )
                    : formatCents(0)}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenDashboard}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container border border-white/10 text-white font-mono text-xs uppercase tracking-widest rounded hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
            >
              <ExternalLink size={14} />
              Abrir Dashboard Stripe
            </button>
            <button
              onClick={() => {
                setLoading(true);
                fetchStatus();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container border border-white/10 text-white/60 font-mono text-xs uppercase tracking-widest rounded hover:border-white/20 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} />
              Atualizar
            </button>
          </div>

          <p className="text-xs text-white/30 font-mono">
            A VibeTuga cobra uma comissão de 15% por venda. Consulta o dashboard Stripe para
            detalhes completos de transações e levantamentos.
          </p>
        </div>
      )}
    </div>
  );
}
