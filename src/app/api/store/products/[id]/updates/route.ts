import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productUpdates, storeProducts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 10 });

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const updates = await db
      .select()
      .from(productUpdates)
      .where(eq(productUpdates.productId, id))
      .orderBy(desc(productUpdates.createdAt));

    return NextResponse.json({ updates });
  } catch {
    return NextResponse.json({ error: "Erro ao obter atualizações." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
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

  const { id } = await context.params;

  try {
    const [product] = await db
      .select({ sellerId: storeProducts.sellerId })
      .from(storeProducts)
      .where(eq(storeProducts.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    if (product.sellerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas o vendedor do produto pode adicionar atualizações." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { version, changelog, downloadKey } = body;

    if (!version || typeof version !== "string" || version.length > 50) {
      return NextResponse.json(
        { error: "Versão é obrigatória (máx. 50 caracteres)." },
        { status: 400 },
      );
    }

    if (!changelog || typeof changelog !== "string" || changelog.length > 5000) {
      return NextResponse.json(
        { error: "Changelog é obrigatório (máx. 5000 caracteres)." },
        { status: 400 },
      );
    }

    const [update] = await db
      .insert(productUpdates)
      .values({
        productId: id,
        version: version.trim(),
        changelog: changelog.trim(),
        downloadKey: downloadKey?.trim() || null,
      })
      .returning();

    await db.update(storeProducts).set({ updatedAt: new Date() }).where(eq(storeProducts.id, id));

    return NextResponse.json({ update }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar atualização." }, { status: 500 });
  }
}
