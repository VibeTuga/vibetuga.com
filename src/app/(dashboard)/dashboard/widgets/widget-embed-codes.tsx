"use client";

import { useState } from "react";
import { Copy, Check, Code, Image as ImageIcon, Trophy, User } from "lucide-react";

interface Badge {
  slug: string;
  name: string;
  icon: string | null;
}

interface WidgetEmbedCodesProps {
  userId: string;
  displayName: string;
  earnedBadges: Badge[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/60 hover:text-primary bg-white/5 hover:bg-primary/10 rounded-md transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-white/40 uppercase tracking-wider">{label}</span>
        <CopyButton text={code} />
      </div>
      <pre className="bg-black/40 border border-white/5 rounded-lg p-3 text-xs font-mono text-white/70 overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
    </div>
  );
}

function WidgetCard({
  title,
  description,
  icon: Icon,
  previewUrl,
  previewWidth,
  previewHeight,
  htmlCode,
  markdownCode,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number }>;
  previewUrl: string;
  previewWidth: number;
  previewHeight: number;
  htmlCode: string;
  markdownCode: string;
}) {
  return (
    <div className="border border-white/5 rounded-xl bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-white/40">{description}</p>
        </div>
      </div>

      {/* Preview */}
      <div className="px-6 py-6 border-b border-white/5 bg-black/20">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">
          Pr&eacute;-visualiza&ccedil;&atilde;o
        </p>
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={title}
            width={previewWidth}
            height={previewHeight}
            className="max-w-full h-auto"
          />
        </div>
      </div>

      {/* Embed codes */}
      <div className="px-6 py-4 space-y-4">
        <CodeBlock code={htmlCode} label="HTML" />
        <CodeBlock code={markdownCode} label="Markdown" />
      </div>
    </div>
  );
}

export function WidgetEmbedCodes({ userId, displayName, earnedBadges }: WidgetEmbedCodesProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://vibetuga.com";

  const profileUrl = `${baseUrl}/api/widgets/profile/${userId}`;
  const leaderboardUrl = `${baseUrl}/api/widgets/leaderboard`;
  const profileLink = `${baseUrl}/profile/${userId}`;
  const leaderboardLink = `${baseUrl}/leaderboard`;

  return (
    <div className="space-y-6">
      {/* Profile Widget */}
      <WidgetCard
        title="Cart&atilde;o de Perfil"
        description={`O teu cartão VibeTuga — ${displayName}`}
        icon={User}
        previewUrl={profileUrl}
        previewWidth={800}
        previewHeight={200}
        htmlCode={`<a href="${profileLink}"><img src="${profileUrl}" alt="VibeTuga Profile - ${displayName}" width="800" height="200" /></a>`}
        markdownCode={`[![VibeTuga Profile - ${displayName}](${profileUrl})](${profileLink})`}
      />

      {/* Leaderboard Widget */}
      <WidgetCard
        title="Leaderboard"
        description="Top 5 membros da comunidade"
        icon={Trophy}
        previewUrl={leaderboardUrl}
        previewWidth={400}
        previewHeight={500}
        htmlCode={`<a href="${leaderboardLink}"><img src="${leaderboardUrl}" alt="VibeTuga Leaderboard" width="400" height="500" /></a>`}
        markdownCode={`[![VibeTuga Leaderboard](${leaderboardUrl})](${leaderboardLink})`}
      />

      {/* Badge Widgets */}
      {earnedBadges.length > 0 && (
        <div className="border border-white/5 rounded-xl bg-white/[0.02] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Badges</h3>
              <p className="text-xs text-white/40">Mostra as tuas conquistas individualmente</p>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {earnedBadges.map((badge) => {
              const badgeUrl = `${baseUrl}/api/widgets/badge/${userId}/${badge.slug}`;
              return (
                <div key={badge.slug} className="px-6 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg">{badge.icon}</span>
                    <span className="text-sm font-medium text-white">{badge.name}</span>
                  </div>

                  {/* Preview */}
                  <div className="mb-3 bg-black/20 rounded-lg p-3 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={badgeUrl} alt={badge.name} width={200} height={40} />
                  </div>

                  <div className="space-y-3">
                    <CodeBlock
                      code={`<img src="${badgeUrl}" alt="${badge.name}" width="200" height="40" />`}
                      label="HTML"
                    />
                    <CodeBlock code={`![${badge.name}](${badgeUrl})`} label="Markdown" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {earnedBadges.length === 0 && (
        <div className="border border-white/5 rounded-xl bg-white/[0.02] p-8 text-center">
          <ImageIcon size={32} className="mx-auto text-white/20 mb-3" />
          <p className="text-sm text-white/40">
            Ainda n&atilde;o tens badges. Participa na comunidade para desbloquear conquistas!
          </p>
        </div>
      )}
    </div>
  );
}
