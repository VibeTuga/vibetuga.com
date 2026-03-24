import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createAccountLink } from "@/lib/stripe";
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
        stripeConnectAccountId: users.stripeConnectAccountId,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user?.stripeConnectAccountId) {
      return NextResponse.json(
        { error: "Conta Connect não encontrada. Inicia o processo primeiro." },
        { status: 400 },
      );
    }

    const origin = new URL(request.url).origin;
    const refreshUrl = `${origin}/api/store/seller/connect/refresh`;
    const returnUrl = `${origin}/dashboard/seller-payouts?onboarding=complete`;

    const onboardingUrl = await createAccountLink(
      user.stripeConnectAccountId,
      refreshUrl,
      returnUrl,
    );

    return NextResponse.json({ url: onboardingUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: `Erro ao gerar link: ${message}` }, { status: 500 });
  }
}

// Also handle GET for Stripe redirect back (refresh URL is called via redirect)
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/dashboard/seller-payouts?onboarding=refresh`);
}
