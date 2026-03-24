"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, X } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discountPercent: number | null;
  discountAmountCents: number | null;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  sellerId: string | null;
  sellerName?: string | null;
  sellerDisplayName?: string | null;
}

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function CouponStatusBadge({ coupon }: { coupon: Coupon }) {
  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
  const isMaxed = coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses;

  if (!coupon.isActive) {
    return (
      <span className="px-2 py-[2px] text-[9px] font-mono uppercase bg-white/5 text-white/30">
        Inativo
      </span>
    );
  }
  if (isExpired) {
    return (
      <span className="px-2 py-[2px] text-[9px] font-mono uppercase bg-error/10 text-error">
        Expirado
      </span>
    );
  }
  if (isMaxed) {
    return (
      <span className="px-2 py-[2px] text-[9px] font-mono uppercase bg-yellow-500/10 text-yellow-400">
        Esgotado
      </span>
    );
  }
  return (
    <span className="px-2 py-[2px] text-[9px] font-mono uppercase bg-primary/10 text-primary">
      Ativo
    </span>
  );
}

function CreateCouponForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: Record<string, unknown> = {
      code: code.toUpperCase(),
    };

    if (discountType === "percent") {
      payload.discountPercent = Number(discountValue);
    } else {
      payload.discountAmountCents = Math.round(Number(discountValue) * 100);
    }

    if (maxUses) payload.maxUses = Number(maxUses);
    if (expiresAt) payload.expiresAt = expiresAt;

    try {
      const res = await fetch("/api/store/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao criar cupão.");
        return;
      }

      onCreated();
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest border border-white/10 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-sm font-bold text-white uppercase tracking-tight">
          Criar Cupão
        </h3>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
            Código
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="DESCONTO20"
            required
            maxLength={50}
            className="w-full bg-surface-container-low border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
              Tipo de Desconto
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
              className="w-full bg-surface-container-low border border-white/10 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none"
            >
              <option value="percent">Percentagem (%)</option>
              <option value="fixed">Valor Fixo (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
              {discountType === "percent" ? "Percentagem" : "Valor (€)"}
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "percent" ? "20" : "5.00"}
              required
              min={discountType === "percent" ? 1 : 0.01}
              max={discountType === "percent" ? 100 : undefined}
              step={discountType === "percent" ? 1 : 0.01}
              className="w-full bg-surface-container-low border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
              Máx. Utilizações
            </label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Ilimitado"
              min={1}
              className="w-full bg-surface-container-low border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
              Data de Expiração
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none font-mono"
            />
          </div>
        </div>

        {error && <p className="text-error text-xs font-mono">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Criar Cupão
        </button>
      </form>
    </div>
  );
}

export function CouponManager({ showSeller = false }: { showSeller?: boolean }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchCoupons() {
    try {
      const res = await fetch("/api/store/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function toggleActive(coupon: Coupon) {
    setActionLoading(coupon.id);
    try {
      await fetch(`/api/store/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      await fetchCoupons();
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteCoupon(id: string) {
    if (!window.confirm("Tens a certeza que queres eliminar este cupão?")) return;
    setActionLoading(id);
    try {
      await fetch(`/api/store/coupons/${id}`, { method: "DELETE" });
      await fetchCoupons();
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {showForm ? (
        <CreateCouponForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            fetchCoupons();
            router.refresh();
          }}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 mb-6 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
        >
          <Plus size={14} />
          Criar Cupão
        </button>
      )}

      {coupons.length === 0 ? (
        <div className="text-center py-16 border border-white/5 bg-surface-container-lowest">
          <Tag size={40} className="text-white/10 mx-auto mb-4" />
          <h2 className="font-headline text-lg font-bold text-white mb-2">Sem cupões criados</h2>
          <p className="text-white/40 text-sm max-w-sm mx-auto">
            Cria o teu primeiro cupão de desconto para os teus produtos.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-white/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  Código
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  Desconto
                </th>
                {showSeller && (
                  <th className="text-left px-4 py-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    Vendedor
                  </th>
                )}
                <th className="text-center px-4 py-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  Usos
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  Expira
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  Estado
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr
                  key={coupon.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-bold text-primary">{coupon.code}</td>
                  <td className="px-4 py-3 font-mono text-white/60">
                    {coupon.discountPercent
                      ? `${coupon.discountPercent}%`
                      : coupon.discountAmountCents
                        ? formatPrice(coupon.discountAmountCents)
                        : "—"}
                  </td>
                  {showSeller && (
                    <td className="px-4 py-3 text-white/50 text-xs">
                      {coupon.sellerDisplayName ?? coupon.sellerName ?? "Global"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center font-mono text-white/50">
                    {coupon.currentUses}
                    {coupon.maxUses !== null ? `/${coupon.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3 font-mono text-white/40 text-xs">
                    {coupon.expiresAt ? formatDate(coupon.expiresAt) : "Sem limite"}
                  </td>
                  <td className="px-4 py-3">
                    <CouponStatusBadge coupon={coupon} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleActive(coupon)}
                        disabled={actionLoading === coupon.id}
                        className="p-1.5 text-white/30 hover:text-primary transition-colors disabled:opacity-30"
                        title={coupon.isActive ? "Desativar" : "Ativar"}
                      >
                        {actionLoading === coupon.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : coupon.isActive ? (
                          <ToggleRight size={14} />
                        ) : (
                          <ToggleLeft size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        disabled={actionLoading === coupon.id}
                        className="p-1.5 text-white/30 hover:text-error transition-colors disabled:opacity-30"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
