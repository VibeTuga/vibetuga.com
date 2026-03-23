import { db } from "@/lib/db";
import { reports, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { ReportsManager } from "./ReportsManager";

export const metadata = {
  title: "Denúncias | Admin | VibeTuga",
};

async function getAllReports() {
  return db
    .select({
      id: reports.id,
      reporterId: reports.reporterId,
      contentType: reports.contentType,
      contentId: reports.contentId,
      reason: reports.reason,
      details: reports.details,
      status: reports.status,
      resolvedBy: reports.resolvedBy,
      resolvedNote: reports.resolvedNote,
      createdAt: reports.createdAt,
      reporterUsername: users.discordUsername,
      reporterDisplayName: users.displayName,
      reporterImage: users.image,
    })
    .from(reports)
    .innerJoin(users, eq(reports.reporterId, users.id))
    .orderBy(
      sql`CASE WHEN ${reports.status} = 'pending' THEN 0 ELSE 1 END`,
      desc(reports.createdAt),
    );
}

export default async function ReportsPage() {
  const allReports = await getAllReports();

  return <ReportsManager initialReports={allReports} />;
}
