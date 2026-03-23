import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roleRequests, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const roleRequestLimiter = rateLimit({ interval: 60 * 1000, limit: 5 });

const ALLOWED_ROLES = ["seller", "author"] as const;

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const requests = await db
      .select({
        id: roleRequests.id,
        requestedRole: roleRequests.requestedRole,
        reason: roleRequests.reason,
        status: roleRequests.status,
        reviewNote: roleRequests.reviewNote,
        createdAt: roleRequests.createdAt,
        updatedAt: roleRequests.updatedAt,
      })
      .from(roleRequests)
      .where(eq(roleRequests.userId, session.user.id))
      .orderBy(desc(roleRequests.createdAt));

    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar pedidos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!roleRequestLimiter.check(ip).success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { requestedRole, reason } = body;

    if (!requestedRole || !ALLOWED_ROLES.includes(requestedRole)) {
      return NextResponse.json(
        { error: "Role inválido. Apenas 'seller' ou 'author' podem ser pedidos." },
        { status: 400 },
      );
    }

    if (!reason || String(reason).trim().length < 10) {
      return NextResponse.json(
        { error: "A razão deve ter pelo menos 10 caracteres." },
        { status: 400 },
      );
    }

    if (String(reason).trim().length > 1000) {
      return NextResponse.json(
        { error: "A razão não pode ter mais de 1000 caracteres." },
        { status: 400 },
      );
    }

    // Check user's current role
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    if (user.role !== "member") {
      return NextResponse.json(
        { error: "Apenas membros podem pedir upgrade de role." },
        { status: 400 },
      );
    }

    // Check no pending request exists
    const [existingPending] = await db
      .select({ id: roleRequests.id })
      .from(roleRequests)
      .where(and(eq(roleRequests.userId, session.user.id), eq(roleRequests.status, "pending")))
      .limit(1);

    if (existingPending) {
      return NextResponse.json(
        { error: "Já tens um pedido pendente. Aguarda a revisão antes de submeter outro." },
        { status: 409 },
      );
    }

    const [newRequest] = await db
      .insert(roleRequests)
      .values({
        userId: session.user.id,
        requestedRole,
        reason: String(reason).trim(),
      })
      .returning();

    return NextResponse.json(newRequest, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao submeter pedido" }, { status: 500 });
  }
}
