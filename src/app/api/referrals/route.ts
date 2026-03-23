import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { referrals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

const limiter = rateLimit({ interval: 60 * 1000, limit: 10 });

function generateCode(): string {
  return crypto.randomBytes(4).toString("hex"); // 8-char alphanumeric
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!limiter.check(ip).success) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Tenta novamente mais tarde." },
      { status: 429 },
    );
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    // Check if user already has a pending referral code they can reuse
    const existing = await db
      .select({ referralCode: referrals.referralCode })
      .from(referrals)
      .where(eq(referrals.referrerId, session.user.id))
      .limit(1);

    // If they have any referral, return the code (they can share the same link)
    if (existing.length > 0) {
      const code = existing[0].referralCode;
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";
      return NextResponse.json({
        code,
        link: `${baseUrl}/login?ref=${code}`,
      });
    }

    // Generate a unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const [dup] = await db
        .select({ id: referrals.id })
        .from(referrals)
        .where(eq(referrals.referralCode, code))
        .limit(1);
      if (!dup) break;
      code = generateCode();
      attempts++;
    }

    const [referral] = await db
      .insert(referrals)
      .values({
        referrerId: session.user.id,
        referralCode: code,
        status: "pending",
      })
      .returning();

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";
    return NextResponse.json({
      code: referral.referralCode,
      link: `${baseUrl}/login?ref=${referral.referralCode}`,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao gerar link de referência." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, session.user.id));

    const totalReferrals = userReferrals.length;
    const completedCount = userReferrals.filter((r) => r.status === "completed").length;
    const totalXpEarned = userReferrals.reduce((sum, r) => sum + r.xpAwarded, 0);

    // Get the user's referral code (first one)
    const referralCode = userReferrals.length > 0 ? userReferrals[0].referralCode : null;
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";

    return NextResponse.json({
      referralCode,
      referralLink: referralCode ? `${baseUrl}/login?ref=${referralCode}` : null,
      totalReferrals,
      completedCount,
      totalXpEarned,
      referrals: userReferrals.map((r) => ({
        id: r.id,
        status: r.status,
        xpAwarded: r.xpAwarded,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Erro ao obter estatísticas." }, { status: 500 });
  }
}
