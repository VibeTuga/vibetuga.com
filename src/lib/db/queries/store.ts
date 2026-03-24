import { cache } from "react";
import { db } from "@/lib/db";
import {
  storeProducts,
  storePurchases,
  storeReviews,
  productUpdates,
  users,
} from "@/lib/db/schema";
import { eq, desc, and, or, count, sql, ilike, gte } from "drizzle-orm";

const PRODUCTS_PER_PAGE = 12;

type StoreFilters = {
  productType?: string;
  q?: string;
  page?: number;
};

export const getApprovedProducts = cache(async (filters: StoreFilters) => {
  const { productType, q, page = 1 } = filters;

  const conditions: ReturnType<typeof eq>[] = [eq(storeProducts.status, "approved")];

  if (productType) {
    conditions.push(
      eq(
        storeProducts.productType,
        productType as
          | "skill"
          | "auto_runner"
          | "agent_kit"
          | "prompt_pack"
          | "template"
          | "course"
          | "guide"
          | "other",
      ),
    );
  }

  if (q) {
    conditions.push(
      or(ilike(storeProducts.title, `%${q}%`), ilike(storeProducts.description, `%${q}%`))!,
    );
  }

  const whereClause = and(...conditions);
  const offset = (page - 1) * PRODUCTS_PER_PAGE;

  const [productsResult, totalResult] = await Promise.all([
    db
      .select({
        id: storeProducts.id,
        title: storeProducts.title,
        slug: storeProducts.slug,
        description: storeProducts.description,
        priceCents: storeProducts.priceCents,
        productType: storeProducts.productType,
        coverImage: storeProducts.coverImage,
        tags: storeProducts.tags,
        createdAt: storeProducts.createdAt,
        sellerName: users.discordUsername,
        sellerDisplayName: users.displayName,
        sellerImage: users.image,
        avgRating: sql<number>`coalesce(avg(${storeReviews.rating})::numeric(2,1), 0)`.as(
          "avg_rating",
        ),
        reviewCount: sql<number>`count(${storeReviews.id})::int`.as("review_count"),
      })
      .from(storeProducts)
      .leftJoin(users, eq(storeProducts.sellerId, users.id))
      .leftJoin(storeReviews, eq(storeProducts.id, storeReviews.productId))
      .where(whereClause)
      .groupBy(storeProducts.id, users.id)
      .orderBy(desc(storeProducts.createdAt))
      .limit(PRODUCTS_PER_PAGE)
      .offset(offset),
    db.select({ count: count() }).from(storeProducts).where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    products: productsResult,
    total,
    totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
    currentPage: page,
  };
});

export const getProductBySlug = cache(async (slug: string) => {
  const [product] = await db
    .select({
      id: storeProducts.id,
      sellerId: storeProducts.sellerId,
      title: storeProducts.title,
      slug: storeProducts.slug,
      description: storeProducts.description,
      priceCents: storeProducts.priceCents,
      productType: storeProducts.productType,
      status: storeProducts.status,
      coverImage: storeProducts.coverImage,
      tags: storeProducts.tags,
      createdAt: storeProducts.createdAt,
      updatedAt: storeProducts.updatedAt,
      sellerName: users.discordUsername,
      sellerDisplayName: users.displayName,
      sellerImage: users.image,
    })
    .from(storeProducts)
    .leftJoin(users, eq(storeProducts.sellerId, users.id))
    .where(and(eq(storeProducts.slug, slug), eq(storeProducts.status, "approved")))
    .limit(1);

  return product ?? null;
});

export const getSellerProducts = cache(async (sellerId: string) => {
  return db
    .select({
      id: storeProducts.id,
      title: storeProducts.title,
      slug: storeProducts.slug,
      description: storeProducts.description,
      priceCents: storeProducts.priceCents,
      productType: storeProducts.productType,
      status: storeProducts.status,
      coverImage: storeProducts.coverImage,
      tags: storeProducts.tags,
      createdAt: storeProducts.createdAt,
      updatedAt: storeProducts.updatedAt,
    })
    .from(storeProducts)
    .where(eq(storeProducts.sellerId, sellerId))
    .orderBy(desc(storeProducts.createdAt));
});

export const getProductsForAdmin = cache(async () => {
  return db
    .select({
      id: storeProducts.id,
      title: storeProducts.title,
      slug: storeProducts.slug,
      description: storeProducts.description,
      priceCents: storeProducts.priceCents,
      productType: storeProducts.productType,
      status: storeProducts.status,
      coverImage: storeProducts.coverImage,
      tags: storeProducts.tags,
      createdAt: storeProducts.createdAt,
      sellerName: users.discordUsername,
      sellerDisplayName: users.displayName,
      sellerImage: users.image,
    })
    .from(storeProducts)
    .leftJoin(users, eq(storeProducts.sellerId, users.id))
    .orderBy(desc(storeProducts.createdAt));
});

export const getPendingProducts = cache(async () => {
  return db
    .select({
      id: storeProducts.id,
      title: storeProducts.title,
      slug: storeProducts.slug,
      description: storeProducts.description,
      priceCents: storeProducts.priceCents,
      productType: storeProducts.productType,
      coverImage: storeProducts.coverImage,
      tags: storeProducts.tags,
      createdAt: storeProducts.createdAt,
      sellerName: users.discordUsername,
      sellerDisplayName: users.displayName,
      sellerImage: users.image,
    })
    .from(storeProducts)
    .leftJoin(users, eq(storeProducts.sellerId, users.id))
    .where(eq(storeProducts.status, "pending"))
    .orderBy(desc(storeProducts.createdAt));
});

export const getUserPurchases = cache(async (userId: string) => {
  return db
    .select({
      id: storePurchases.id,
      pricePaidCents: storePurchases.pricePaidCents,
      createdAt: storePurchases.createdAt,
      productTitle: storeProducts.title,
      productSlug: storeProducts.slug,
      productType: storeProducts.productType,
      coverImage: storeProducts.coverImage,
      downloadKey: storeProducts.downloadKey,
      sellerName: users.discordUsername,
      sellerDisplayName: users.displayName,
    })
    .from(storePurchases)
    .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
    .leftJoin(users, eq(storeProducts.sellerId, users.id))
    .where(eq(storePurchases.buyerId, userId))
    .orderBy(desc(storePurchases.createdAt));
});

// ─── Seller Analytics ─────────────────────────────────────

export const getSellerTotalRevenue = cache(async (sellerId: string) => {
  const [result] = await db
    .select({
      totalRevenue: sql<number>`coalesce(sum(${storePurchases.pricePaidCents}), 0)::int`,
      totalSales: sql<number>`count(${storePurchases.id})::int`,
    })
    .from(storePurchases)
    .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
    .where(eq(storeProducts.sellerId, sellerId));

  return result ?? { totalRevenue: 0, totalSales: 0 };
});

export const getSellerMonthlyRevenue = cache(async (sellerId: string) => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisMonth] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${storePurchases.pricePaidCents}), 0)::int`,
      sales: sql<number>`count(${storePurchases.id})::int`,
    })
    .from(storePurchases)
    .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
    .where(
      and(eq(storeProducts.sellerId, sellerId), gte(storePurchases.createdAt, thisMonthStart)),
    );

  const [lastMonth] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${storePurchases.pricePaidCents}), 0)::int`,
      sales: sql<number>`count(${storePurchases.id})::int`,
    })
    .from(storePurchases)
    .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
    .where(
      and(
        eq(storeProducts.sellerId, sellerId),
        gte(storePurchases.createdAt, lastMonthStart),
        sql`${storePurchases.createdAt} < ${thisMonthStart}`,
      ),
    );

  return {
    thisMonth: thisMonth ?? { revenue: 0, sales: 0 },
    lastMonth: lastMonth ?? { revenue: 0, sales: 0 },
  };
});

export const getSellerDailySales = cache(async (sellerId: string, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return db
    .select({
      date: sql<string>`date(${storePurchases.createdAt})`.as("sale_date"),
      revenue: sql<number>`coalesce(sum(${storePurchases.pricePaidCents}), 0)::int`.as("revenue"),
      sales: sql<number>`count(${storePurchases.id})::int`.as("sales"),
    })
    .from(storePurchases)
    .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
    .where(and(eq(storeProducts.sellerId, sellerId), gte(storePurchases.createdAt, since)))
    .groupBy(sql`date(${storePurchases.createdAt})`)
    .orderBy(sql`date(${storePurchases.createdAt})`);
});

export const getSellerTopProducts = cache(async (sellerId: string, limit = 5) => {
  return db
    .select({
      id: storeProducts.id,
      title: storeProducts.title,
      slug: storeProducts.slug,
      priceCents: storeProducts.priceCents,
      productType: storeProducts.productType,
      salesCount: sql<number>`count(${storePurchases.id})::int`.as("sales_count"),
      revenue: sql<number>`coalesce(sum(${storePurchases.pricePaidCents}), 0)::int`.as("revenue"),
    })
    .from(storeProducts)
    .leftJoin(storePurchases, eq(storeProducts.id, storePurchases.productId))
    .where(eq(storeProducts.sellerId, sellerId))
    .groupBy(storeProducts.id)
    .orderBy(sql`count(${storePurchases.id}) desc`)
    .limit(limit);
});

// ─── Product Updates (Versioning) ─────────────────────────

export const getProductUpdates = cache(async (productId: string) => {
  return db
    .select({
      id: productUpdates.id,
      version: productUpdates.version,
      changelog: productUpdates.changelog,
      downloadUrl: productUpdates.downloadUrl,
      createdAt: productUpdates.createdAt,
    })
    .from(productUpdates)
    .where(eq(productUpdates.productId, productId))
    .orderBy(desc(productUpdates.createdAt));
});

export type StoreProduct = Awaited<ReturnType<typeof getApprovedProducts>>["products"][number];
export type StoreProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
export type SellerProduct = Awaited<ReturnType<typeof getSellerProducts>>[number];
export type PendingProduct = Awaited<ReturnType<typeof getPendingProducts>>[number];
export type AdminProduct = Awaited<ReturnType<typeof getProductsForAdmin>>[number];
export type UserPurchase = Awaited<ReturnType<typeof getUserPurchases>>[number];
export type SellerDailySale = Awaited<ReturnType<typeof getSellerDailySales>>[number];
export type SellerTopProduct = Awaited<ReturnType<typeof getSellerTopProducts>>[number];
export type ProductUpdate = Awaited<ReturnType<typeof getProductUpdates>>[number];
