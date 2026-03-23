import { db } from "@/lib/db";
import {
  reports,
  users,
  blogPosts,
  blogComments,
  showcaseProjects,
  storeProducts,
  storeReviews,
} from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { ReportsManager } from "./ReportsManager";

export const metadata = {
  title: "Denúncias | Admin | VibeTuga",
};

type ReportRow = {
  id: string;
  contentType: string;
  contentId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: Date;
  reporterName: string | null;
  reporterDisplayName: string | null;
  reporterImage: string | null;
  contentPreview: string | null;
  contentAuthorId: string | null;
};

async function getContentPreview(
  contentType: string,
  contentId: string,
): Promise<{ title: string | null; authorId: string | null }> {
  switch (contentType) {
    case "post": {
      const rows = await db
        .select({ title: blogPosts.title, authorId: blogPosts.authorId })
        .from(blogPosts)
        .where(eq(blogPosts.id, contentId))
        .limit(1);
      return rows[0] ?? { title: null, authorId: null };
    }
    case "comment": {
      const rows = await db
        .select({ content: blogComments.content, authorId: blogComments.authorId })
        .from(blogComments)
        .where(eq(blogComments.id, contentId))
        .limit(1);
      if (rows[0]) {
        return {
          title:
            rows[0].content.length > 80 ? rows[0].content.slice(0, 80) + "..." : rows[0].content,
          authorId: rows[0].authorId,
        };
      }
      return { title: null, authorId: null };
    }
    case "project": {
      const rows = await db
        .select({ title: showcaseProjects.title, authorId: showcaseProjects.authorId })
        .from(showcaseProjects)
        .where(eq(showcaseProjects.id, contentId))
        .limit(1);
      return rows[0] ?? { title: null, authorId: null };
    }
    case "product": {
      const rows = await db
        .select({ title: storeProducts.title, authorId: storeProducts.sellerId })
        .from(storeProducts)
        .where(eq(storeProducts.id, contentId))
        .limit(1);
      return rows[0] ?? { title: null, authorId: null };
    }
    case "review": {
      const rows = await db
        .select({ comment: storeReviews.comment, authorId: storeReviews.reviewerId })
        .from(storeReviews)
        .where(eq(storeReviews.id, contentId))
        .limit(1);
      if (rows[0]) {
        const text = rows[0].comment ?? "Avaliação sem comentário";
        return {
          title: text.length > 80 ? text.slice(0, 80) + "..." : text,
          authorId: rows[0].authorId,
        };
      }
      return { title: null, authorId: null };
    }
    default:
      return { title: null, authorId: null };
  }
}

async function getAllReports() {
  const rows = await db
    .select({
      id: reports.id,
      contentType: reports.contentType,
      contentId: reports.contentId,
      reason: reports.reason,
      details: reports.details,
      status: reports.status,
      createdAt: reports.createdAt,
      reporterName: users.discordUsername,
      reporterDisplayName: users.displayName,
      reporterImage: users.image,
    })
    .from(reports)
    .innerJoin(users, eq(reports.reporterId, users.id))
    .orderBy(
      sql`CASE WHEN ${reports.status} = 'pending' THEN 0 ELSE 1 END`,
      desc(reports.createdAt),
    );

  const enriched: ReportRow[] = await Promise.all(
    rows.map(async (row) => {
      const { title, authorId } = await getContentPreview(row.contentType, row.contentId);
      return {
        ...row,
        contentPreview: title,
        contentAuthorId: authorId,
      };
    }),
  );

  return enriched;
}

export default async function AdminReportsPage() {
  const allReports = await getAllReports();

  return <ReportsManager initialReports={allReports} />;
}
