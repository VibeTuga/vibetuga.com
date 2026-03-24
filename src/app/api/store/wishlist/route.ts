import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserWishlist, toggleWishlist } from "@/lib/db/queries/store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const items = await getUserWishlist(session.user.id);
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json();
  const { productId } = body;

  if (!productId || typeof productId !== "string") {
    return NextResponse.json({ error: "productId é obrigatório." }, { status: 400 });
  }

  const added = await toggleWishlist(session.user.id, productId);
  return NextResponse.json({ added, productId });
}
