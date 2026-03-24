import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeProducts, storeCoupons } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 10 });

function validateCoupon(
  coupon: {
    isActive: boolean;
    expiresAt: Date | null;
    maxUses: number | null;
    currentUses: number;
    sellerId: string | null;
  },
  productSellerId: string,
): string | null {
  if (!coupon.isActive) return "Cupão não está ativo.";
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return "Cupão expirado.";
  if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses)
    return "Cupão atingiu o limite de utilizações.";
  if (coupon.sellerId && coupon.sellerId !== productSellerId)
    return "Cupão não é válido para este produto.";
  return null;
}

function calculateDiscount(
  coupon: { discountPercent: number | null; discountAmountCents: number | null },
  priceCents: number,
): number {
  if (coupon.discountPercent) {
    return Math.round((priceCents * coupon.discountPercent) / 100);
  }
  if (coupon.discountAmountCents) {
    return Math.min(coupon.discountAmountCents, priceCents);
  }
  return 0;
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
    const { productId, couponCode } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
    }

    const [product] = await db
      .select()
      .from(storeProducts)
      .where(eq(storeProducts.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    if (product.status !== "approved") {
      return NextResponse.json({ error: "Produto não disponível para compra" }, { status: 400 });
    }

    let finalPriceCents = product.priceCents;
    let appliedCouponCode: string | null = null;
    let discountCents = 0;

    if (couponCode && typeof couponCode === "string") {
      const [coupon] = await db
        .select()
        .from(storeCoupons)
        .where(eq(storeCoupons.code, couponCode.toUpperCase()))
        .limit(1);

      if (!coupon) {
        return NextResponse.json({ error: "Cupão não encontrado." }, { status: 404 });
      }

      const validationError = validateCoupon(coupon, product.sellerId);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }

      discountCents = calculateDiscount(coupon, product.priceCents);
      finalPriceCents = Math.max(product.priceCents - discountCents, 0);
      appliedCouponCode = coupon.code;

      await db
        .update(storeCoupons)
        .set({ currentUses: sql`${storeCoupons.currentUses} + 1` })
        .where(eq(storeCoupons.id, coupon.id));
    }

    const origin = new URL(request.url).origin;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: product.title,
              description: product.description ?? undefined,
              images: product.coverImage ? [product.coverImage] : undefined,
            },
            unit_amount: finalPriceCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        productId: product.id,
        buyerId: session.user.id,
        couponCode: appliedCouponCode ?? "",
        discountCents: discountCents.toString(),
      },
      success_url: `${origin}/store?success=1`,
      cancel_url: `${origin}/store?canceled=1`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar sessão de pagamento";

    if (message === "Product not found") {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    if (message === "Product is not available for purchase") {
      return NextResponse.json({ error: "Produto não disponível para compra" }, { status: 400 });
    }

    return NextResponse.json({ error: "Erro ao criar sessão de pagamento" }, { status: 500 });
  }
}
