import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCollections } from "@/lib/db/queries/store";
import { FolderOpen, Star } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Coleções | Loja VibeTuga",
  description: "Coleções curadas de produtos digitais na loja VibeTuga.",
  openGraph: {
    title: "Coleções | Loja VibeTuga",
    description: "Coleções curadas de produtos digitais na loja VibeTuga.",
  },
  alternates: {
    canonical: "https://vibetuga.com/store/collections",
  },
};

export default async function StoreCollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-xs font-mono text-white/40">
        <Link href="/store" className="hover:text-primary transition-colors">
          Loja
        </Link>
        <span>/</span>
        <span className="text-white/60">Coleções</span>
      </nav>

      {/* Header */}
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white mb-2">
          Coleções
        </h1>
        <p className="text-white/50 text-lg">Coleções curadas de ferramentas, templates e kits.</p>
      </section>

      {/* Collections Grid */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/store/collections/${collection.slug}`}
              className="group flex flex-col bg-surface-container border border-white/5 rounded-xl hover:bg-surface-container-high hover:border-primary/20 transition-all duration-300 overflow-hidden"
            >
              {/* Cover */}
              <div className="relative aspect-[2/1] bg-black">
                {collection.coverImage ? (
                  <Image
                    src={collection.coverImage}
                    alt={collection.name}
                    fill
                    className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/10" />
                )}
                {collection.isFeatured && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 bg-secondary/90 text-on-secondary text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase">
                      <Star size={10} className="fill-current" />
                      Destaque
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-white font-headline group-hover:text-primary transition-colors mb-2">
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className="text-sm text-white/50 line-clamp-2 mb-4">
                    {collection.description}
                  </p>
                )}
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  {collection.productCount} {collection.productCount === 1 ? "produto" : "produtos"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
            <FolderOpen size={28} className="text-white/20" />
          </div>
          <h2 className="font-headline text-xl font-bold text-white mb-2">Sem coleções</h2>
          <p className="text-white/40 text-sm max-w-md">
            Ainda não há coleções disponíveis. Volta em breve!
          </p>
        </div>
      )}
    </div>
  );
}
