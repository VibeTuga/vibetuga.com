import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeRefunds, storePurchases, storeProducts, users } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 5 });

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";

    const refunds = await db
      .select({
        id: storeRefunds.id,
        purchaseId: storeRefunds.purchaseId,
        buyerId: storeRefunds.buyerId,
        reason: storeRefunds.reason,
        status: storeRefunds.status,
        adminNotes: storeRefunds.adminNotes,
        stripeRefundId: storeRefunds.stripeRefundId,
        createdAt: storeRefunds.createdAt,
        resolvedAt: storeRefunds.resolvedAt,
        productTitle: storeProducts.title,
        productSlug: storeProducts.slug,
        pricePaidCents: storePurchases.pricePaidCents,
        buyerName: users.discordUsername,
        buyerDisplayName: users.displayName,
      })
      .from(storeRefunds)
      .innerJoin(storePurchases, eq(storeRefunds.purchaseId, storePurchases.id))
      .innerJoin(storeProducts, eq(storePurchases.productId, storeProducts.id))
      .leftJoin(users, eq(storeRefunds.buyerId, users.id))
      .where(isAdmin ? undefined : eq(storeRefunds.buyerId, session.user.id))
      .orderBy(desc(storeRefunds.createdAt));

    return NextResponse.json({ refunds });
  } catch {
    return NextResponse.json({ error: "Erro ao listar reembolsos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = limiter.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { purchaseId, reason } = body;

    if (!purchaseId || typeof purchaseId !== "string") {
      return NextResponse.json({ error: "ID da compra é obrigatório." }, { status: 400 });
    }

    if (!reason || typeof reason !== "string" || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Motivo do reembolso é obrigatório (mín. 10 caracteres)." },
        { status: 400 },
      );
    }

    const [purchase] = await db
      .select()
      .from(storePurchases)
      .where(and(eq(storePurchases.id, purchaseId), eq(storePurchases.buyerId, session.user.id)))
      .limit(1);

    if (!purchase) {
      return NextResponse.json({ error: "Compra não encontrada." }, { status: 404 });
    }

    const daysSincePurchase = Math.floor(
      (Date.now() - purchase.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSincePurchase > 14) {
      return NextResponse.json(
        { error: "O prazo de 14 dias para pedir reembolso já expirou." },
        { status: 400 },
      );
    }

    const existingRefund = await db
      .select({ id: storeRefunds.id })
      .from(storeRefunds)
      .where(eq(storeRefunds.purchaseId, purchaseId))
      .limit(1);

    if (existingRefund.length > 0) {
      return NextResponse.json(
        { error: "Já existe um pedido de reembolso para esta compra." },
        { status: 409 },
      );
    }

    const [refund] = await db
      .insert(storeRefunds)
      .values({
        purchaseId,
        buyerId: session.user.id,
        reason: reason.trim(),
      })
      .returning();

    return NextResponse.json({ refund }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar pedido de reembolso." }, { status: 500 });
  }
}
