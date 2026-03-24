import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getAccountStatus, getAccountBalance } from "@/lib/stripe";
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

    if (!user) {
      return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    }

    if (!user.stripeConnectAccountId) {
      return NextResponse.json({
        connected: false,
        onboarded: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        balance: null,
      });
    }

    const status = await getAccountStatus(user.stripeConnectAccountId);

    // Sync DB flag if Stripe says charges are enabled but DB hasn't been updated
    // (handles cases where webhook was missed or not configured)
    if (status.chargesEnabled && !user.stripeConnectOnboarded) {
      await db
        .update(users)
        .set({
          stripeConnectOnboarded: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));
      user.stripeConnectOnboarded = true;
    }

    let balance = null;
    if (user.stripeConnectOnboarded && status.chargesEnabled) {
      try {
        const rawBalance = await getAccountBalance(user.stripeConnectAccountId);
        balance = {
          available: rawBalance.available.map((b) => ({
            amount: b.amount,
            currency: b.currency,
          })),
          pending: rawBalance.pending.map((b) => ({
            amount: b.amount,
            currency: b.currency,
          })),
        };
      } catch {
        // Balance retrieval may fail for new accounts
      }
    }

    return NextResponse.json({
      connected: true,
      onboarded: user.stripeConnectOnboarded,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
      balance,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: `Erro ao obter estado: ${message}` }, { status: 500 });
  }
}
