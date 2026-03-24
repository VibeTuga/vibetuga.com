import { db } from "@/lib/db";
import { showcaseProjects, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PendingProjectsTable } from "./PendingProjectsTable";

async function getPendingProjects() {
  return db
    .select({
      id: showcaseProjects.id,
      title: showcaseProjects.title,
      slug: showcaseProjects.slug,
      description: showcaseProjects.description,
      coverImage: showcaseProjects.coverImage,
      liveUrl: showcaseProjects.liveUrl,
      repoUrl: showcaseProjects.repoUrl,
      techStack: showcaseProjects.techStack,
      aiToolsUsed: showcaseProjects.aiToolsUsed,
      createdAt: showcaseProjects.createdAt,
      authorName: users.discordUsername,
      authorDisplayName: users.displayName,
      authorImage: users.image,
    })
    .from(showcaseProjects)
    .leftJoin(users, eq(showcaseProjects.authorId, users.id))
    .where(eq(showcaseProjects.status, "pending"))
    .orderBy(desc(showcaseProjects.createdAt));
}

export default async function ShowcasePage() {
  const projects = await getPendingProjects();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline font-black text-xl uppercase tracking-tight text-white">
          Showcase — Projetos Pendentes
        </h1>
        <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
          Projetos da comunidade aguardando aprovação
        </p>
      </div>

      <PendingProjectsTable projects={projects} />
    </div>
  );
}
