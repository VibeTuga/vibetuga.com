import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getProjectBasicById } from "@/lib/db/queries/showcase";
import { getContentAnalytics, getContentAnalyticsSummary } from "@/lib/db/queries/analytics";
import { AnalyticsSummary } from "@/components/analytics/AnalyticsSummary";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { ReferralSourcesCard } from "@/components/analytics/ReferralSourcesCard";

export const metadata: Metadata = {
  title: "Análise de Projeto - VibeTuga",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectAnalyticsPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const project = await getProjectBasicById(id);
  if (!project) notFound();

  const isAuthor = project.authorId === session.user.id;
  const isStaff = session.user.role === "admin" || session.user.role === "moderator";

  if (!isAuthor && !isStaff) {
    notFound();
  }

  const [summary, dailyData] = await Promise.all([
    getContentAnalyticsSummary("project", id),
    getContentAnalytics("project", id, 30),
  ]);

  const topSource =
    summary.topReferralSources.length > 0 ? summary.topReferralSources[0].source : "—";

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
        <Link href="/dashboard" className="hover:text-primary transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span>Análises</span>
        <span>/</span>
        <span className="text-white/50 truncate max-w-[300px]">{project.title}</span>
      </nav>

      {/* Title */}
      <div>
        <h1 className="font-headline text-2xl md:text-3xl font-black text-white tracking-tighter">
          Análise do Projeto
        </h1>
        <p className="text-sm text-white/40 mt-1 truncate">{project.title}</p>
      </div>

      {/* Summary cards */}
      <AnalyticsSummary
        totalViews={summary.totalViews}
        viewsLast7Days={summary.viewsLast7Days}
        viewsLast30Days={summary.viewsLast30Days}
        topSource={topSource}
      />

      {/* Daily views chart */}
      <AnalyticsChart data={dailyData.map((d) => ({ date: d.date, views: d.views }))} />

      {/* Referral sources */}
      <ReferralSourcesCard sources={summary.topReferralSources} />

      {/* Back link */}
      <div className="pt-4 border-t border-white/5">
        <Link
          href={`/showcase/${project.slug}`}
          className="text-xs font-mono text-white/40 hover:text-primary transition-colors uppercase tracking-widest"
        >
          ← Ver projeto
        </Link>
      </div>
    </div>
  );
}
