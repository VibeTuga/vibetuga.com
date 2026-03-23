import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  blogCategories,
  blogPosts,
  newsletterCampaigns,
  newsletterSubscribers,
  showcaseProjects,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { buildDigestHtml } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM_ADDRESS = process.env.EMAIL_FROM || "VibeTuga <noreply@vibetuga.com>";
const DIGEST_SUBJECT = "Resumo Semanal — VibeTuga";
const CHUNK_SIZE = 50;

export async function POST(req: NextRequest) {
  try {
    // Auth: admin session OR CRON_SECRET header
    const session = await auth();
    const isAdmin = session?.user && ["admin", "moderator"].includes(session.user.role ?? "");
    const cronSecretHeader = req.headers.get("CRON_SECRET");
    const isAutomated =
      !!cronSecretHeader &&
      !!process.env.CRON_SECRET &&
      cronSecretHeader === process.env.CRON_SECRET;

    if (!isAdmin && !isAutomated) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Query blog posts published in the last 7 days
    const posts = await db
      .select({
        title: blogPosts.title,
        slug: blogPosts.slug,
        categoryName: blogCategories.name,
        readingTimeMinutes: blogPosts.readingTimeMinutes,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(and(eq(blogPosts.status, "published"), gte(blogPosts.createdAt, sevenDaysAgo)))
      .orderBy(desc(blogPosts.createdAt))
      .limit(5);

    // Query showcase projects approved/featured in the last 7 days
    const projects = await db
      .select({
        title: showcaseProjects.title,
        slug: showcaseProjects.slug,
        techStack: showcaseProjects.techStack,
      })
      .from(showcaseProjects)
      .where(
        and(
          inArray(showcaseProjects.status, ["approved", "featured"]),
          gte(showcaseProjects.createdAt, sevenDaysAgo),
        ),
      )
      .orderBy(desc(showcaseProjects.createdAt))
      .limit(3);

    // Skip if no new content this week
    if (posts.length === 0 && projects.length === 0) {
      return NextResponse.json({ skipped: true });
    }

    const html = buildDigestHtml(posts, projects);

    // Create campaign record with status 'sent'
    const [campaign] = await db
      .insert(newsletterCampaigns)
      .values({
        subject: DIGEST_SUBJECT,
        content: html,
        status: "sent",
        sentAt: new Date(),
      })
      .returning();

    // Fetch all active subscribers
    const subscribers = await db
      .select({ email: newsletterSubscribers.email })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, "active"));

    let sentCount = 0;

    for (let i = 0; i < subscribers.length; i += CHUNK_SIZE) {
      const chunk = subscribers.slice(i, i + CHUNK_SIZE);
      const emails = chunk.map((s) => ({
        from: FROM_ADDRESS,
        to: s.email,
        subject: DIGEST_SUBJECT,
        html,
      }));
      try {
        await resend.batch.send(emails);
        sentCount += chunk.length;
      } catch (err) {
        console.error(`Error sending digest batch ${Math.floor(i / CHUNK_SIZE) + 1}:`, err);
      }
    }

    // Update campaign with final sent count
    await db
      .update(newsletterCampaigns)
      .set({ sentCount })
      .where(eq(newsletterCampaigns.id, campaign.id));

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (error) {
    console.error("Digest send error:", error);
    return NextResponse.json({ error: "Erro ao enviar digest" }, { status: 500 });
  }
}
