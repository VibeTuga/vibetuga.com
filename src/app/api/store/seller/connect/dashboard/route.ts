import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createLoginLink } from "@/lib/stripe";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const allowedRoles = ["seller", "admin", "moderator"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Acesso reservado a vendedores" }, { status: 403 });
  }

  try {
    const [user] = await db
      .select({
        stripeConnectAccountId: users.stripeConnectAccountId,
        stripeConnectOnboarded: users.stripeConnectOnboarded,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user?.stripeConnectAccountId || !user.stripeConnectOnboarded) {
      return NextResponse.json({ error: "Conta Connect não configurada" }, { status: 400 });
    }

    const url = await createLoginLink(user.stripeConnectAccountId);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Erro ao gerar link do dashboard: ${message}` },
      { status: 500 },
    );
  }
}
