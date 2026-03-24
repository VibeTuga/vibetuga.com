import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeProducts, storePurchases } from "@/lib/db/schema";
import { eq, and, sql, desc, gte } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const allowedRoles = ["admin", "seller"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Apenas vendedores podem aceder às análises." },
      { status: 403 },
    );
  }

  try {
    const sellerId = session.user.id;

    const [totalResult] = await db
      .select({
        totalRevenue: sql<number>`coalesce(sum(${storePurchases.pricePaidCents}), 0)::int`,
        totalSales: sql<number>`count(${storePurchases.id})::int`,
      })
      .from(storePurchases)
      .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
      .where(eq(storeProducts.sellerId, sellerId));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySales = await db
      .select({
        date: sql<string>`to_char(${storePurchases.createdAt}::date, 'YYYY-MM-DD')`.as("date"),
        sales: sql<number>`count(${storePurchases.id})::int`.as("sales"),
        revenue: sql<number>`coalesce(sum(${storePurchases.pricePaidCents}), 0)::int`.as("revenue"),
      })
      .from(storePurchases)
      .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
      .where(
        and(eq(storeProducts.sellerId, sellerId), gte(storePurchases.createdAt, thirtyDaysAgo)),
      )
      .groupBy(sql`${storePurchases.createdAt}::date`)
      .orderBy(sql`${storePurchases.createdAt}::date`);

    const topProducts = await db
      .select({
        id: storeProducts.id,
        title: storeProducts.title,
        slug: storeProducts.slug,
        productType: storeProducts.productType,
        priceCents: storeProducts.priceCents,
        salesCount: sql<number>`count(${storePurchases.id})::int`.as("sales_count"),
        revenue: sql<number>`coalesce(sum(${storePurchases.pricePaidCents}), 0)::int`.as("revenue"),
      })
      .from(storeProducts)
      .leftJoin(storePurchases, eq(storeProducts.id, storePurchases.productId))
      .where(eq(storeProducts.sellerId, sellerId))
      .groupBy(storeProducts.id)
      .orderBy(desc(sql`coalesce(sum(${storePurchases.pricePaidCents}), 0)`))
      .limit(10);

    return NextResponse.json({
      totalRevenue: totalResult?.totalRevenue ?? 0,
      totalSales: totalResult?.totalSales ?? 0,
      dailySales,
      topProducts,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao obter análises de vendas." }, { status: 500 });
  }
}
