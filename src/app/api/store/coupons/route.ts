import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeCoupons, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 10 });

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator", "seller"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão para ver cupões." }, { status: 403 });
  }

  try {
    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";

    if (isAdmin) {
      const coupons = await db
        .select({
          id: storeCoupons.id,
          code: storeCoupons.code,
          sellerId: storeCoupons.sellerId,
          discountPercent: storeCoupons.discountPercent,
          discountAmountCents: storeCoupons.discountAmountCents,
          maxUses: storeCoupons.maxUses,
          currentUses: storeCoupons.currentUses,
          expiresAt: storeCoupons.expiresAt,
          isActive: storeCoupons.isActive,
          createdAt: storeCoupons.createdAt,
          sellerName: users.discordUsername,
          sellerDisplayName: users.displayName,
        })
        .from(storeCoupons)
        .leftJoin(users, eq(storeCoupons.sellerId, users.id))
        .orderBy(desc(storeCoupons.createdAt));

      return NextResponse.json({ coupons });
    }

    const coupons = await db
      .select()
      .from(storeCoupons)
      .where(eq(storeCoupons.sellerId, session.user.id))
      .orderBy(desc(storeCoupons.createdAt));

    return NextResponse.json({ coupons });
  } catch {
    return NextResponse.json({ error: "Erro ao listar cupões." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator", "seller"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Apenas vendedores e administradores podem criar cupões." },
      { status: 403 },
    );
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
    const { code, discountPercent, discountAmountCents, maxUses, expiresAt } = body;

    if (!code || typeof code !== "string" || code.length > 50) {
      return NextResponse.json(
        { error: "Código do cupão é obrigatório (máx. 50 caracteres)." },
        { status: 400 },
      );
    }

    if (discountPercent && discountAmountCents) {
      return NextResponse.json(
        { error: "Escolhe percentagem OU valor fixo, não ambos." },
        { status: 400 },
      );
    }

    if (!discountPercent && !discountAmountCents) {
      return NextResponse.json(
        { error: "Desconto é obrigatório (percentagem ou valor fixo)." },
        { status: 400 },
      );
    }

    if (discountPercent && (discountPercent < 1 || discountPercent > 100)) {
      return NextResponse.json(
        { error: "Percentagem de desconto deve ser entre 1 e 100." },
        { status: 400 },
      );
    }

    if (discountAmountCents && discountAmountCents < 1) {
      return NextResponse.json({ error: "Valor de desconto deve ser positivo." }, { status: 400 });
    }

    const existing = await db
      .select({ id: storeCoupons.id })
      .from(storeCoupons)
      .where(eq(storeCoupons.code, code.toUpperCase()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Já existe um cupão com este código." }, { status: 409 });
    }

    const [coupon] = await db
      .insert(storeCoupons)
      .values({
        code: code.toUpperCase(),
        sellerId: session.user.role === "admin" ? null : session.user.id,
        discountPercent: discountPercent ?? null,
        discountAmountCents: discountAmountCents ?? null,
        maxUses: maxUses ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    return NextResponse.json({ coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar cupão." }, { status: 500 });
  }
}
