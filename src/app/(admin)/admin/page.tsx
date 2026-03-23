import { db } from "@/lib/db";
import { users, blogPosts } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { Users, FileText, AlertCircle, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";

async function getStats() {
  try {
    const [totalUsersResult] = await db.select({ value: count() }).from(users);

    const [totalPostsResult] = await db.select({ value: count() }).from(blogPosts);

    const [pendingResult] = await db
      .select({ value: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, "pending_review"));

    const [publishedResult] = await db
      .select({ value: count() })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"));

    return {
      totalUsers: totalUsersResult?.value ?? 0,
      totalPosts: totalPostsResult?.value ?? 0,
      pendingReviews: pendingResult?.value ?? 0,
      publishedPosts: publishedResult?.value ?? 0,
    };
  } catch {
    return {
      totalUsers: 0,
      totalPosts: 0,
      pendingReviews: 0,
      publishedPosts: 0,
    };
  }
}

const quickLinks = [
  {
    href: "/admin/blog",
    label: "Gerir Posts",
    icon: FileText,
    hoverColor: "hover:bg-primary/5 hover:border-primary/50",
    iconColor: "group-hover:text-primary",
  },
  {
    href: "/admin/categories",
    label: "Categorias",
    icon: BookOpen,
    hoverColor: "hover:bg-secondary/5 hover:border-secondary/50",
    iconColor: "group-hover:text-secondary",
  },
  {
    href: "/admin/users",
    label: "Utilizadores",
    icon: Users,
    hoverColor: "hover:bg-tertiary/5 hover:border-tertiary/50",
    iconColor: "group-hover:text-tertiary",
  },
  {
    href: "/admin/blog/new",
    label: "Novo Post",
    icon: FileText,
    hoverColor: "hover:bg-primary/5 hover:border-primary/50",
    iconColor: "group-hover:text-primary",
  },
];

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={<Users size={18} />}
          trend="+12.4%"
          accentColor="primary"
        />
        <StatCard
          label="Total Posts"
          value={stats.totalPosts}
          icon={<FileText size={18} />}
          badge="Active"
          accentColor="secondary"
        />
        <StatCard
          label="Pending Reviews"
          value={stats.pendingReviews}
          icon={<AlertCircle size={18} />}
          urgent
          accentColor="error"
        />
        <StatCard
          label="Published"
          value={stats.publishedPosts}
          icon={<TrendingUp size={18} />}
          accentColor="tertiary"
        />
      </div>

      {/* Quick Management Links */}
      <section className="mt-8">
        <h3 className="font-headline font-bold text-sm uppercase tracking-widest mb-6 px-2">
          Gestão Rápida
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`bg-surface-container-high ${link.hoverColor} transition-all border border-white/5 p-6 flex flex-col items-center text-center group`}
              >
                <Icon
                  size={28}
                  className={`text-white/40 ${link.iconColor} mb-3 transition-colors`}
                />
                <span className="text-[10px] font-headline font-bold uppercase text-white">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  trend,
  badge,
  urgent,
  accentColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
  badge?: string;
  urgent?: boolean;
  accentColor: "primary" | "secondary" | "tertiary" | "error";
}) {
  const borderColorMap = {
    primary: "hover:border-primary",
    secondary: "hover:border-secondary",
    tertiary: "hover:border-tertiary",
    error: "hover:border-error",
  };

  const textColorMap = {
    primary: "text-primary",
    secondary: "text-secondary",
    tertiary: "text-tertiary",
    error: "text-error",
  };

  return (
    <div
      className={`bg-surface-container p-6 border-b-2 border-transparent ${borderColorMap[accentColor]} transition-all group`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">
          {label}
        </span>
        {trend && (
          <div className={`flex items-center ${textColorMap[accentColor]} text-[10px] font-mono`}>
            <TrendingUp size={12} className="mr-1" />
            <span>{trend}</span>
          </div>
        )}
        {badge && (
          <span
            className={`${textColorMap[accentColor]} text-[10px] font-mono uppercase tracking-widest`}
          >
            {badge}
          </span>
        )}
        {urgent && (
          <div className="w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(255,113,108,0.8)]" />
        )}
      </div>
      <div className="flex items-end justify-between">
        <h3
          className={`text-3xl font-headline font-black ${urgent ? textColorMap[accentColor] : "text-white"}`}
        >
          {value.toLocaleString("pt-PT")}
        </h3>
        <div className={`${textColorMap[accentColor]} opacity-40`}>{icon}</div>
      </div>
    </div>
  );
}
