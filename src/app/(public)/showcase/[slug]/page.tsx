import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProjectBySlug, getUserProjectVote } from "@/lib/db/queries/showcase";
import { ReportButton } from "@/components/shared/ReportButton";
import { VoteButtons } from "@/components/showcase/VoteButtons";
import { BarChart3 } from "lucide-react";
import { auth } from "@/lib/auth";
import { getProjectJsonLd } from "@/lib/jsonld";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Projeto não encontrado | VibeTuga" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vibetuga.com";
  const authorName = project.authorDisplayName ?? project.authorName ?? "VibeTuga";
  const ogParams = new URLSearchParams({ title: project.title, author: authorName });
  if (project.techStack?.length) ogParams.set("techStack", project.techStack.join(","));
  const ogImageUrl = `${baseUrl}/api/og/project?${ogParams.toString()}`;

  return {
    title: `${project.title} | VibeTuga Showcase`,
    description: project.description ?? `Projeto ${project.title} da comunidade VibeTuga.`,
    openGraph: {
      title: project.title,
      description: project.description ?? undefined,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description ?? undefined,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `https://vibetuga.com/showcase/${slug}`,
    },
  };
}

export const revalidate = 60;

export default async function ShowcaseProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, session] = await Promise.all([getProjectBySlug(slug), auth()]);

  if (!project) {
    notFound();
  }

  const currentUserId = session?.user?.id ?? null;
  const userVote = currentUserId ? await getUserProjectVote(project.id, currentUserId) : null;

  const authorName = project.authorDisplayName ?? project.authorName ?? "Autor";

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getProjectJsonLd(project)) }}
      />
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase tracking-widest">
        <Link href="/showcase" className="hover:text-primary transition-colors">
          Showcase
        </Link>
        <span>/</span>
        <span className="text-white/50">{project.title}</span>
      </nav>

      {/* Cover Image */}
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-surface-container-lowest mb-8">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-container-highest via-surface-container to-surface-container-low" />
        )}
        {project.status === "featured" && (
          <div className="absolute top-4 left-4">
            <span className="bg-secondary text-on-secondary px-3 py-1 font-label text-[10px] font-bold tracking-widest uppercase">
              Projeto em Destaque
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Title & Author */}
          <div className="mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter text-white uppercase mb-4">
              {project.title}
            </h1>
            <div className="flex items-center gap-3">
              {project.authorImage ? (
                <img
                  src={project.authorImage}
                  alt={authorName}
                  className="w-10 h-10 rounded-full border border-primary/30 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/50 flex items-center justify-center text-sm font-bold text-white/50">
                  {authorName[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-[10px] font-label text-white/30 uppercase tracking-widest">
                  Criado por
                </p>
                <p className="text-sm font-bold text-white">@{project.authorName ?? "anon"}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="mb-8">
              <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">
                Descrição
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          )}

          {/* Gallery */}
          {(project.galleryImages ?? []).length > 0 && (
            <div className="mb-8">
              <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">
                Galeria
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {project.galleryImages!.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-video overflow-hidden bg-surface-container-lowest"
                  >
                    <Image
                      src={img}
                      alt={`${project.title} screenshot ${i + 1}`}
                      fill
                      sizes="(max-width: 1200px) 50vw, 400px"
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack */}
          {(project.techStack ?? []).length > 0 && (
            <div className="mb-8">
              <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">
                Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack!.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 bg-surface-container-highest border border-outline-variant text-[10px] text-white/70 font-label uppercase"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Tools */}
          {(project.aiToolsUsed ?? []).length > 0 && (
            <div className="mb-8">
              <h2 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">
                Ferramentas de IA
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.aiToolsUsed!.map((tool) => (
                  <span
                    key={tool}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-tertiary/10 border border-tertiary/20 text-[10px] text-tertiary font-label uppercase"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Vote Count */}
          <div className="bg-surface-container-low border border-white/5 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center bg-surface-container-lowest border border-primary/20 px-4 py-3">
                <VoteButtons
                  projectId={project.id}
                  initialVotesCount={project.votesCount}
                  initialUserVote={userVote as "up" | "down" | null}
                  authorId={project.authorId}
                  currentUserId={currentUserId}
                />
              </div>
              <div>
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  Votos
                </p>
                <p className="text-xs text-white/50">da comunidade</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-surface-container-low border border-white/5 p-6 space-y-3">
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
              Links
            </p>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/70 hover:text-primary transition-colors group"
              >
                <svg
                  className="w-4 h-4 text-white/30 group-hover:text-primary transition-colors flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <span className="font-mono text-xs truncate">Ver Projeto Live</span>
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/70 hover:text-primary transition-colors group"
              >
                <svg
                  className="w-4 h-4 text-white/30 group-hover:text-primary transition-colors flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="font-mono text-xs truncate">Repositório</span>
              </a>
            )}
            {project.videoUrl && (
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-white/70 hover:text-primary transition-colors group"
              >
                <svg
                  className="w-4 h-4 text-white/30 group-hover:text-primary transition-colors flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-mono text-xs truncate">Ver Vídeo Demo</span>
              </a>
            )}
            {!project.liveUrl && !project.repoUrl && !project.videoUrl && (
              <p className="text-[10px] font-mono text-white/20">Sem links disponíveis</p>
            )}
          </div>

          {/* Date */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-[10px] font-mono text-white/20">
              Submetido em{" "}
              {new Date(project.createdAt).toLocaleDateString("pt-PT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex items-center gap-3">
              {session?.user &&
                (project.authorId === currentUserId ||
                  session.user.role === "admin" ||
                  session.user.role === "moderator") && (
                  <Link
                    href={`/dashboard/analytics/projects/${project.id}`}
                    className="flex items-center gap-1.5 text-[10px] font-mono text-white/30 hover:text-tertiary transition-colors"
                    title="Ver análises"
                  >
                    <BarChart3 size={14} />
                    Análises
                  </Link>
                )}
              {session?.user && (
                <ReportButton contentType="project" contentId={project.id} size="sm" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="mt-12 pt-8 border-t border-white/5">
        <Link
          href="/showcase"
          className="flex items-center gap-2 text-xs font-mono text-white/40 hover:text-primary transition-colors uppercase tracking-widest w-fit"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Voltar ao Showcase
        </Link>
      </div>
    </div>
  );
}
