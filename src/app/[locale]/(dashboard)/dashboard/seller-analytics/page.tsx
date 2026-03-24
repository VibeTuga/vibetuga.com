import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getSellerTotalRevenue,
  getSellerMonthlyRevenue,
  getSellerDailySales,
  getSellerTopProducts,
} from "@/lib/db/queries/store";
import { RevenueCard } from "@/components/store/RevenueCard";
import { SalesChart } from "@/components/store/SalesChart";
import { TopProductsTable } from "@/components/store/TopProductsTable";

export const metadata = {
  title: "Anlise de Vendas | VibeTuga",
};

export default async function SellerAnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const canSell = ["admin", "moderator", "seller"].includes(session.user.role);
  if (!canSell) {
    redirect("/dashboard");
  }

  const [totalRevenue, monthlyRevenue, dailySales, topProducts] = await Promise.all([
    getSellerTotalRevenue(session.user.id),
    getSellerMonthlyRevenue(session.user.id),
    getSellerDailySales(session.user.id, 30),
    getSellerTopProducts(session.user.id, 10),
  ]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-black text-white tracking-tighter mb-2">
          Anlise de Vendas
        </h1>
        <p className="text-white/40 text-sm">
          Acompanha as tuas vendas, receitas e produtos mais vendidos.
        </p>
      </header>

      <div className="space-y-6">
        <RevenueCard
          totalRevenue={totalRevenue.totalRevenue}
          totalSales={totalRevenue.totalSales}
          thisMonthRevenue={monthlyRevenue.thisMonth.revenue}
          lastMonthRevenue={monthlyRevenue.lastMonth.revenue}
          thisMonthSales={monthlyRevenue.thisMonth.sales}
          lastMonthSales={monthlyRevenue.lastMonth.sales}
        />

        <SalesChart data={dailySales} days={30} />

        <TopProductsTable products={topProducts} />
      </div>
    </div>
  );
}
