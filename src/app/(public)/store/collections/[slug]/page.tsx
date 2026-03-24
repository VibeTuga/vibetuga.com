import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCollectionBySlug } from "@/lib/db/queries/store";
import { ProductCard } from "@/components/store/ProductCard";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return { title: "Coleção não encontrada | VibeTuga" };
  }

  return {
    title: `${collection.name} | Coleções | Loja VibeTuga`,
    description: collection.description || `Coleção ${collection.name} na loja VibeTuga.`,
    openGraph: {
      title: `${collection.name} | Coleções | Loja VibeTuga`,
      description: collection.description || `Coleção ${collection.name} na loja VibeTuga.`,
      ...(collection.coverImage && {
        images: [{ url: collection.coverImage, width: 1200, height: 630, alt: collection.name }],
      }),
    },
    alternates: {
      canonical: `https://vibetuga.com/store/collections/${slug}`,
    },
  };
}

export default async function CollectionDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-xs font-mono text-white/40">
        <Link href="/store" className="hover:text-primary transition-colors">
          Loja
        </Link>
        <span>/</span>
        <Link href="/store/collections" className="hover:text-primary transition-colors">
          Coleções
        </Link>
        <span>/</span>
        <span className="text-white/60">{collection.name}</span>
      </nav>

      {/* Collection Header */}
      {collection.coverImage && (
        <div className="relative aspect-[3/1] rounded-xl overflow-hidden bg-black mb-8">
          <Image
            src={collection.coverImage}
            alt={collection.name}
            fill
            priority
            className="object-cover opacity-60"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white mb-2">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-white/60 text-lg max-w-2xl">{collection.description}</p>
            )}
          </div>
        </div>
      )}

      {!collection.coverImage && (
        <section className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white mb-2">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-white/50 text-lg max-w-2xl">{collection.description}</p>
          )}
        </section>
      )}

      {/* Product count */}
      <div className="mb-8">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
          {collection.products.length} {collection.products.length === 1 ? "produto" : "produtos"}
        </span>
      </div>

      {/* Products Grid */}
      {collection.products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collection.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h2 className="font-headline text-xl font-bold text-white mb-2">Coleção vazia</h2>
          <p className="text-white/40 text-sm max-w-md">
            Esta coleção ainda não tem produtos. Volta em breve!
          </p>
        </div>
      )}
    </div>
  );
}
