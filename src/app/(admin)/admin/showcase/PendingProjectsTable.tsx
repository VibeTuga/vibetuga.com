"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, X, Star, Loader2, ExternalLink, Github } from "lucide-react";

interface PendingProject {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  techStack: string[] | null;
  aiToolsUsed: string[] | null;
  createdAt: Date;
  authorName: string | null;
  authorDisplayName: string | null;
  authorImage: string | null;
}

export function PendingProjectsTable({ projects }: { projects: PendingProject[] }) {
  const router = useRouter();
  const [actioning, setActioning] = useState<string | null>(null);

  async function handleAction(projectId: string, status: "approved" | "featured" | "rejected") {
    setActioning(projectId);
    try {
      const res = await fetch(`/api/showcase/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        alert("Erro ao atualizar o projeto.");
        return;
      }

      router.refresh();
    } catch {
      alert("Erro ao atualizar o projeto.");
    } finally {
      setActioning(null);
    }
  }

  if (projects.length === 0) {
    return (
      <div className="bg-surface-container-low p-12 text-center">
        <p className="font-mono text-xs text-white/30 uppercase tracking-widest">QUEUE_EMPTY</p>
        <p className="text-white/20 text-sm mt-2">Não há projetos pendentes de aprovação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const authorName = project.authorDisplayName || project.authorName || "Anónimo";
        const isActioning = actioning === project.id;

        return (
          <div
            key={project.id}
            className="bg-surface-container-low p-6 hover:bg-surface-container transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {project.authorImage ? (
                    <Image
                      src={project.authorImage}
                      alt={authorName}
                      width={24}
                      height={24}
                      className="rounded-full border border-primary/20"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-surface-container-highest border border-primary/20" />
                  )}
                  <span className="text-xs font-bold text-white uppercase">{authorName}</span>
                </div>

                <h3 className="text-sm font-headline font-bold text-white mb-1 truncate">
                  {project.title}
                </h3>

                {project.description && (
                  <p className="text-xs text-white/40 line-clamp-2">{project.description}</p>
                )}

                <div className="flex items-center gap-3 mt-3">
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {project.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-[2px] text-[9px] font-mono uppercase bg-tertiary/10 text-tertiary"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="text-[9px] font-mono text-white/30">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/30 hover:text-primary transition-colors"
                      title="Live URL"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/30 hover:text-primary transition-colors"
                      title="Repositório"
                    >
                      <Github size={14} />
                    </a>
                  )}
                </div>

                <p className="text-[10px] font-mono text-white/20 mt-2">
                  Submetido: {new Date(project.createdAt).toLocaleDateString("pt-PT")}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAction(project.id, "featured")}
                  disabled={isActioning}
                  className="flex items-center gap-1.5 px-3 py-2 bg-secondary/10 text-secondary text-xs font-mono uppercase hover:bg-secondary/20 transition-all disabled:opacity-40"
                  title="Destacar"
                >
                  {isActioning ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Star size={14} />
                  )}
                  Destacar
                </button>
                <button
                  onClick={() => handleAction(project.id, "approved")}
                  disabled={isActioning}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary text-xs font-mono uppercase hover:bg-primary/20 transition-all disabled:opacity-40"
                  title="Aprovar"
                >
                  {isActioning ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Aprovar
                </button>
                <button
                  onClick={() => handleAction(project.id, "rejected")}
                  disabled={isActioning}
                  className="flex items-center gap-1.5 px-3 py-2 bg-error/10 text-error text-xs font-mono uppercase hover:bg-error/20 transition-all disabled:opacity-40"
                  title="Rejeitar"
                >
                  <X size={14} />
                  Rejeitar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
