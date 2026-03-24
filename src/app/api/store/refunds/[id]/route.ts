import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeRefunds, storePurchases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const allowedRoles = ["admin", "moderator"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Apenas administradores podem gerir reembolsos." },
      { status: 403 },
    );
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { status, adminNotes } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido. Escolhe 'approved' ou 'rejected'." },
        { status: 400 },
      );
    }

    const [refund] = await db.select().from(storeRefunds).where(eq(storeRefunds.id, id)).limit(1);

    if (!refund) {
      return NextResponse.json({ error: "Reembolso não encontrado." }, { status: 404 });
    }

    if (refund.status !== "pending") {
      return NextResponse.json({ error: "Este reembolso já foi processado." }, { status: 400 });
    }

    if (status === "approved") {
      const [purchase] = await db
        .select()
        .from(storePurchases)
        .where(eq(storePurchases.id, refund.purchaseId))
        .limit(1);

      if (!purchase?.stripePaymentId) {
        return NextResponse.json(
          { error: "Compra sem referência de pagamento Stripe." },
          { status: 400 },
        );
      }

      const stripeRefund = await stripe.refunds.create({
        payment_intent: purchase.stripePaymentId,
      });

      const [updated] = await db
        .update(storeRefunds)
        .set({
          status: "refunded",
          adminNotes: adminNotes?.trim() || null,
          stripeRefundId: stripeRefund.id,
          resolvedBy: session.user.id,
          resolvedAt: new Date(),
        })
        .where(eq(storeRefunds.id, id))
        .returning();

      return NextResponse.json({ refund: updated });
    }

    const [updated] = await db
      .update(storeRefunds)
      .set({
        status: "rejected",
        adminNotes: adminNotes?.trim() || null,
        resolvedBy: session.user.id,
        resolvedAt: new Date(),
      })
      .where(eq(storeRefunds.id, id))
      .returning();

    return NextResponse.json({ refund: updated });
  } catch {
    return NextResponse.json({ error: "Erro ao processar reembolso." }, { status: 500 });
  }
}
