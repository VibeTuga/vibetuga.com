import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createConnectAccount, createAccountLink } from "@/lib/stripe";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
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
        id: users.id,
        email: users.email,
        stripeConnectAccountId: users.stripeConnectAccountId,
        stripeConnectOnboarded: users.stripeConnectOnboarded,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    const origin = new URL(request.url).origin;
    const refreshUrl = `${origin}/api/store/seller/connect/refresh`;
    const returnUrl = `${origin}/dashboard/seller-payouts?onboarding=complete`;

    let accountId = user.stripeConnectAccountId;

    // Create a new Connect account if none exists
    if (!accountId) {
      accountId = await createConnectAccount(user.id, user.email ?? "");
      await db
        .update(users)
        .set({
          stripeConnectAccountId: accountId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    // Create onboarding link
    const onboardingUrl = await createAccountLink(accountId, refreshUrl, returnUrl);

    return NextResponse.json({ url: onboardingUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: `Erro ao configurar pagamentos: ${message}` },
      { status: 500 },
    );
  }
}
