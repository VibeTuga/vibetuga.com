import type { Metadata } from "next";
import { getAllCollections } from "@/lib/db/queries/store";
import { CollectionCard } from "@/components/store/CollectionCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Coleções | Loja VibeTuga",
  description: "Coleções curadas de produtos na loja VibeTuga.",
  openGraph: {
    title: "Coleções | Loja VibeTuga",
    description: "Coleções curadas de produtos na loja VibeTuga.",
  },
  alternates: {
    canonical: "https://vibetuga.com/store/collections",
  },
};

export default async function StoreCollectionsPage() {
  const collections = await getAllCollections();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white mb-2">
          Coleções
        </h1>
        <p className="text-white/50 text-lg">
          Coleções curadas de ferramentas e recursos para vibe coders.
        </p>
      </section>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h2 className="font-headline text-2xl font-bold text-white mb-2">Ainda sem coleções</h2>
          <p className="text-white/40 text-sm max-w-md">
            As coleções curadas vão aparecer aqui em breve.
          </p>
        </div>
      )}
    </div>
  );
}
