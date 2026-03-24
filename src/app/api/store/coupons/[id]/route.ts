import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeCoupons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator", "seller"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const [coupon] = await db.select().from(storeCoupons).where(eq(storeCoupons.id, id)).limit(1);

    if (!coupon) {
      return NextResponse.json({ error: "Cupão não encontrado." }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";
    if (!isAdmin && coupon.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Sem permissão para editar este cupão." }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.discountPercent !== undefined && body.discountAmountCents !== undefined) {
      return NextResponse.json(
        { error: "Escolhe percentagem OU valor fixo, não ambos." },
        { status: 400 },
      );
    }

    if (body.discountPercent !== undefined) {
      if (body.discountPercent < 1 || body.discountPercent > 100) {
        return NextResponse.json(
          { error: "Percentagem de desconto deve ser entre 1 e 100." },
          { status: 400 },
        );
      }
      updates.discountPercent = body.discountPercent;
      updates.discountAmountCents = null;
    }

    if (body.discountAmountCents !== undefined) {
      if (body.discountAmountCents < 1) {
        return NextResponse.json(
          { error: "Valor de desconto deve ser positivo." },
          { status: 400 },
        );
      }
      updates.discountAmountCents = body.discountAmountCents;
      updates.discountPercent = null;
    }

    if (body.maxUses !== undefined) {
      if (body.maxUses !== null && body.maxUses < coupon.currentUses) {
        return NextResponse.json(
          { error: "Máximo de usos não pode ser menor que os usos atuais." },
          { status: 400 },
        );
      }
      updates.maxUses = body.maxUses;
    }

    if (body.isActive !== undefined) {
      updates.isActive = body.isActive;
    }

    if (body.expiresAt !== undefined) {
      updates.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 400 });
    }

    const [updated] = await db
      .update(storeCoupons)
      .set(updates)
      .where(eq(storeCoupons.id, id))
      .returning();

    return NextResponse.json({ coupon: updated });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar cupão." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator", "seller"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const [coupon] = await db.select().from(storeCoupons).where(eq(storeCoupons.id, id)).limit(1);

    if (!coupon) {
      return NextResponse.json({ error: "Cupão não encontrado." }, { status: 404 });
    }

    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";
    if (!isAdmin && coupon.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Sem permissão para eliminar este cupão." },
        { status: 403 },
      );
    }

    await db.delete(storeCoupons).where(eq(storeCoupons.id, id));

    return NextResponse.json({ message: "Cupão eliminado com sucesso." });
  } catch {
    return NextResponse.json({ error: "Erro ao eliminar cupão." }, { status: 500 });
  }
}
