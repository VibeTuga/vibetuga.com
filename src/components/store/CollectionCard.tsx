import Link from "next/link";
import Image from "next/image";
import { Layers } from "lucide-react";
import type { StoreCollection } from "@/lib/db/queries/store";

export function CollectionCard({ collection }: { collection: StoreCollection }) {
  return (
    <Link
      href={`/store/collections/${collection.slug}`}
      className="flex flex-col bg-surface-container border border-white/5 rounded-xl hover:bg-surface-container-high hover:border-primary/20 transition-all duration-300 group overflow-hidden"
    >
      <div className="relative aspect-[2/1] overflow-hidden bg-black">
        {collection.coverImage ? (
          <Image
            src={collection.coverImage}
            alt={collection.name}
            fill
            className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-bold text-white font-headline group-hover:text-primary transition-colors">
            {collection.name}
          </h3>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        {collection.description && (
          <p className="text-xs text-white/50 line-clamp-1 flex-1 mr-4">{collection.description}</p>
        )}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 flex-shrink-0">
          <Layers size={12} />
          {collection.productCount} {collection.productCount === 1 ? "produto" : "produtos"}
        </div>
      </div>
    </Link>
  );
}
