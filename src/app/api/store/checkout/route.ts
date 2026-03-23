import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000, limit: 10 });

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
    const { productId } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const checkoutSession = await createCheckoutSession(
      productId,
      session.user.id,
      `${origin}/store?success=1`,
      `${origin}/store?canceled=1`,
    );

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
