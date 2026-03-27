import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, storeProducts, storePurchases } from "@/lib/db/schema";
import { getPrivatePresignedDownloadUrl } from "@/lib/r2";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await params;
  const userId = session.user.id;

  // Fetch the product
  const [product] = await db
    .select({
      id: storeProducts.id,
      sellerId: storeProducts.sellerId,
      downloadKey: storeProducts.downloadKey,
    })
    .from(storeProducts)
    .where(eq(storeProducts.id, productId))
    .limit(1);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (!product.downloadKey) {
    return NextResponse.json({ error: "No download available" }, { status: 404 });
  }

  // Check authorization: buyer, seller, or admin/moderator
  const isSeller = product.sellerId === userId;

  let isAuthorized = isSeller;

  if (!isAuthorized) {
    // Check if user is admin or moderator
    const [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (dbUser && ["admin", "moderator"].includes(dbUser.role)) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    // Check if user has purchased this product
    const [purchase] = await db
      .select({ id: storePurchases.id })
      .from(storePurchases)
      .where(and(eq(storePurchases.buyerId, userId), eq(storePurchases.productId, productId)))
      .limit(1);

    if (purchase) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const downloadUrl = await getPrivatePresignedDownloadUrl(product.downloadKey);

  return NextResponse.redirect(downloadUrl);
}
