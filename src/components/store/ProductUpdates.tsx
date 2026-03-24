"use client";

import { useState, useEffect } from "react";
import { Package, ChevronDown, ChevronRight } from "lucide-react";

interface ProductUpdateItem {
  id: number;
  version: string;
  changelog: string;
  downloadUrl: string | null;
  createdAt: string;
}

export function ProductUpdates({ productId }: { productId: string }) {
  const [updates, setUpdates] = useState<ProductUpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/store/products/${productId}/updates`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUpdates(data);
          if (data.length > 0) {
            setExpandedId(data[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="mt-8 animate-pulse">
        <div className="h-4 w-48 bg-white/5 mb-4" />
        <div className="h-20 bg-white/5" />
      </div>
    );
  }

  if (updates.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-headline font-bold tracking-tight uppercase mb-4 flex items-center gap-2">
        <Package size={18} className="text-primary" />
        Histrico de Verses
      </h2>

      <div className="space-y-2">
        {updates.map((update, i) => {
          const isExpanded = expandedId === update.id;
          const isLatest = i === 0;
          return (
            <div
              key={update.id}
              className="bg-surface-container border border-white/5 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : update.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-white/30 shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-white/30 shrink-0" />
                )}
                <span className="font-mono text-sm text-primary font-bold">v{update.version}</span>
                {isLatest && (
                  <span className="text-[9px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-widest">
                    ltima
                  </span>
                )}
                <span className="ml-auto text-[10px] font-mono text-white/30">
                  {new Date(update.createdAt).toLocaleDateString("pt-PT")}
                </span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/5">
                  <p className="text-sm text-white/60 leading-relaxed mt-3 whitespace-pre-wrap">
                    {update.changelog}
                  </p>
                  {update.downloadUrl && (
                    <a
                      href={update.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary/10 text-primary text-xs font-mono uppercase tracking-widest hover:bg-primary/20 transition-colors rounded"
                    >
                      <Package size={12} />
                      Download v{update.version}
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
