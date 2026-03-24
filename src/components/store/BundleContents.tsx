import Link from "next/link";
import Image from "next/image";
import type { BundleItem } from "@/lib/db/queries/store";

const TYPE_LABELS: Record<string, string> = {
  skill: "Skill",
  auto_runner: "Auto Runner",
  agent_kit: "Agent Kit",
  template: "Template",
  course: "Curso",
  prompt_pack: "Prompt Pack",
  guide: "Guide",
  other: "Outro",
};

export function BundleContents({ items }: { items: BundleItem[] }) {
  if (items.length === 0) return null;

  const totalValue = items.reduce((sum, item) => sum + item.priceCents, 0);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-headline font-bold tracking-tight uppercase">
          Conteúdo do Bundle
        </h2>
        <span className="text-[10px] font-mono text-white/40 uppercase">
          {items.length} {items.length === 1 ? "item" : "itens"} &middot; valor total &euro;
          {(totalValue / 100).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/store/${item.productSlug}`}
            className="flex items-center gap-4 p-4 bg-surface-container border border-white/5 rounded-lg hover:border-primary/20 transition-all group"
          >
            <div className="relative w-16 h-10 rounded overflow-hidden bg-black flex-shrink-0">
              {item.coverImage ? (
                <Image
                  src={item.coverImage}
                  alt={item.productTitle}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
                {item.productTitle}
              </p>
              <p className="text-[10px] font-mono text-white/40 uppercase">
                {TYPE_LABELS[item.productType] ?? "Outro"}
              </p>
            </div>
            <span className="text-sm font-mono text-primary font-bold flex-shrink-0">
              &euro;{(item.priceCents / 100).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
