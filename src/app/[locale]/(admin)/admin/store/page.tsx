import { getPendingProducts, getProductsForAdmin } from "@/lib/db/queries/store";
import { PendingProductsSection, AllProductsTable } from "./StoreProductsManager";

export const metadata = {
  title: "Loja | Admin | VibeTuga",
};

export default async function AdminStorePage() {
  const [pendingProducts, allProducts] = await Promise.all([
    getPendingProducts(),
    getProductsForAdmin(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Loja — Produtos Pendentes
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Produtos da comunidade aguardando aprovação
        </p>
      </div>

      <PendingProductsSection products={pendingProducts} />

      <div className="mt-12 mb-8">
        <h2 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Todos os Produtos
        </h2>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Lista completa de produtos na plataforma
        </p>
      </div>

      <div className="bg-surface-container-low">
        <AllProductsTable products={allProducts} />
      </div>
    </div>
  );
}
