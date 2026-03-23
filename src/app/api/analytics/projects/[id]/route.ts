import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { showcaseProjects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getContentAnalytics, getContentAnalyticsSummary } from "@/lib/db/queries/analytics";

const limiter = rateLimit({ interval: 60_000, limit: 30 });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params;

    const [project] = await db
      .select({ authorId: showcaseProjects.authorId })
      .from(showcaseProjects)
      .where(eq(showcaseProjects.id, id))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    }

    const isStaff = session.user.role === "admin" || session.user.role === "moderator";
    const isAuthor = project.authorId === session.user.id;

    if (!isStaff && !isAuthor) {
      return NextResponse.json({ error: "Sem permissão para ver estas análises" }, { status: 403 });
    }

    const { url } = request;
    const searchParams = new URL(url).searchParams;
    const days = parseInt(searchParams.get("days") ?? "30", 10);
    const validDays = Number.isNaN(days) || days < 1 || days > 365 ? 30 : days;

    const [summary, dailyData] = await Promise.all([
      getContentAnalyticsSummary("project", id),
      getContentAnalytics("project", id, validDays),
    ]);

    return NextResponse.json({
      summary,
      dailyData,
      referralSources: summary.topReferralSources,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao obter análises" }, { status: 500 });
  }
}
