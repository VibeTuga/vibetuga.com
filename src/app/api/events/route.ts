import { NextRequest, NextResponse } from "next/server";
import { getUpcomingEvents, getPastEvents } from "@/lib/db/queries/events";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "upcoming";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "12", 10), 50);
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10), 1);

    if (type === "past") {
      const offset = (page - 1) * limit;
      const result = await getPastEvents(limit, offset);
      return NextResponse.json({
        events: result.events,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: page,
      });
    }

    const events = await getUpcomingEvents(limit);
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar eventos." }, { status: 500 });
  }
}
