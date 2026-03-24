import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getCollections, getProductsForAdmin } from "@/lib/db/queries/store";
import { AdminCollectionsClient } from "./AdminCollectionsClient";

export const metadata: Metadata = {
  title: "Coleções | Admin | VibeTuga",
};

export default async function AdminCollectionsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const [collections, products] = await Promise.all([getCollections(), getProductsForAdmin()]);

  const approvedProducts = products.filter((p) => p.status === "approved");

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-black text-white tracking-tighter mb-2">
          Coleções da Loja
        </h1>
        <p className="text-white/40 text-sm">Cria e gere coleções curadas de produtos.</p>
      </header>

      <AdminCollectionsClient
        initialCollections={collections}
        availableProducts={approvedProducts.map((p) => ({
          id: p.id,
          title: p.title,
          productType: p.productType,
        }))}
      />
    </div>
  );
}
