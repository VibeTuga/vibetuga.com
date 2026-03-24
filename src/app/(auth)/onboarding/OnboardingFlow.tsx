"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const INTERESTS = [
  { id: "ai-tools", label: "AI Tools", icon: ">" },
  { id: "vibe-coding", label: "Vibe Coding", icon: "$" },
  { id: "web-dev", label: "Web Dev", icon: "#" },
  { id: "agents", label: "Agents", icon: "@" },
  { id: "prompts", label: "Prompts", icon: "%" },
] as const;

type Interest = (typeof INTERESTS)[number]["id"];

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const toggleInterest = useCallback((id: Interest) => {
    setInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  async function handleComplete() {
    if (!displayName.trim()) {
      setStep(1);
      setError("Precisas de definir um nome de exibição.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Erro ao guardar perfil.");
        setSaving(false);
        return;
      }

      // Show confetti and success state
      setShowConfetti(true);

      // Redirect after animation
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch {
      setError("Erro de ligação. Tenta novamente.");
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-lg px-6 py-12 relative">
      {/* Confetti overlay */}
      {showConfetti && <ConfettiEffect />}

      {/* Progress bar */}
      <div className="flex gap-2 mb-12">
        {[0, 1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              s <= step ? "bg-primary" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <section className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Logo size="lg" className="inline-block" />

          <div className="space-y-4">
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tighter text-white">
              Bem-vindo à{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">
                VibeTuga
              </span>
            </h1>
            <p className="text-on-surface-variant text-lg">
              A comunidade portuguesa de vibe coding, AI tooling e desenvolvimento assistido por
              agentes.
            </p>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 text-on-surface-variant text-sm">
              <span className="text-primary font-mono">&gt;</span>
              <span>Partilha projetos e ganha XP</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant text-sm">
              <span className="text-tertiary font-mono">&gt;</span>
              <span>Publica artigos e tutoriais</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant text-sm">
              <span className="text-secondary font-mono">&gt;</span>
              <span>Compete no leaderboard</span>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full py-3 bg-primary text-black font-mono text-sm uppercase tracking-widest hover:shadow-[0_0_15px_rgba(161,255,194,0.3)] transition-all"
          >
            Começar
          </button>

          <p className="text-on-surface-variant/50 text-xs">
            Ao continuar, aceitas os nossos{" "}
            <Link href="/terms" className="text-tertiary hover:underline">
              termos de serviço
            </Link>{" "}
            e{" "}
            <Link href="/privacy" className="text-tertiary hover:underline">
              política de privacidade
            </Link>
            .
          </p>
        </section>
      )}

      {/* Step 1: Profile */}
      {step === 1 && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-primary uppercase mb-3">
              Profile_Config
            </p>
            <h2 className="font-headline text-2xl font-black tracking-tighter text-white mb-2">
              Configura o teu perfil
            </h2>
            <p className="text-on-surface-variant text-sm">
              Como queres ser conhecido na comunidade?
            </p>
          </div>

          {error && (
            <div className="rounded-sm border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label
                htmlFor="displayName"
                className="block font-mono text-xs tracking-widest uppercase text-white/40 mb-2"
              >
                Nome de exibição *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-mono text-sm select-none">
                  $
                </span>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="O teu nome"
                  maxLength={50}
                  className="w-full bg-surface-container-lowest border border-white/10 focus:border-tertiary/50 focus:shadow-[0_0_10px_rgba(129,233,255,0.1)] text-sm py-3 pl-8 pr-3 text-white placeholder:text-white/20 font-mono outline-none transition-all"
                  autoFocus
                />
              </div>
              <p className="text-white/20 text-xs mt-1 font-mono">{displayName.length}/50</p>
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block font-mono text-xs tracking-widest uppercase text-white/40 mb-2"
              >
                Bio (opcional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-tertiary font-mono text-sm select-none">
                  $
                </span>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conta-nos sobre ti..."
                  maxLength={500}
                  rows={3}
                  className="w-full bg-surface-container-lowest border border-white/10 focus:border-tertiary/50 focus:shadow-[0_0_10px_rgba(129,233,255,0.1)] text-sm py-3 pl-8 pr-3 text-white placeholder:text-white/20 font-mono outline-none transition-all resize-none"
                />
              </div>
              <p className="text-white/20 text-xs mt-1 font-mono">{bio.length}/500</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="px-6 py-3 bg-transparent border border-white/10 text-on-surface-variant font-mono text-xs uppercase tracking-widest hover:border-white/30 transition-all"
            >
              Voltar
            </button>
            <button
              onClick={() => {
                if (!displayName.trim()) {
                  setError("O nome de exibição é obrigatório.");
                  return;
                }
                setError("");
                setStep(2);
              }}
              className="flex-1 py-3 bg-primary text-black font-mono text-sm uppercase tracking-widest hover:shadow-[0_0_15px_rgba(161,255,194,0.3)] transition-all"
            >
              Continuar
            </button>
          </div>
        </section>
      )}

      {/* Step 2: Interests */}
      {step === 2 && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-secondary uppercase mb-3">
              Interest_Matrix
            </p>
            <h2 className="font-headline text-2xl font-black tracking-tighter text-white mb-2">
              O que te interessa?
            </h2>
            <p className="text-on-surface-variant text-sm">
              Escolhe os tópicos que mais te interessam.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {INTERESTS.map((interest) => {
              const selected = interests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex items-center gap-4 px-4 py-4 text-left transition-all ${
                    selected
                      ? "bg-primary/10 border border-primary/30 text-white"
                      : "bg-surface-container border border-white/5 text-on-surface-variant hover:border-white/15"
                  }`}
                >
                  <span
                    className={`font-mono text-lg ${selected ? "text-primary" : "text-white/20"}`}
                  >
                    {interest.icon}
                  </span>
                  <span className="font-mono text-sm uppercase tracking-widest">
                    {interest.label}
                  </span>
                  {selected && <span className="ml-auto text-primary font-mono text-xs">[ON]</span>}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-transparent border border-white/10 text-on-surface-variant font-mono text-xs uppercase tracking-widest hover:border-white/30 transition-all"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-primary text-black font-mono text-sm uppercase tracking-widest hover:shadow-[0_0_15px_rgba(161,255,194,0.3)] transition-all"
            >
              Continuar
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Complete */}
      {step === 3 && !showConfetti && (
        <section className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-primary font-mono text-3xl">+50</span>
          </div>

          <div className="space-y-3">
            <h2 className="font-headline text-2xl font-black tracking-tighter text-white">
              Tudo pronto!
            </h2>
            <p className="text-on-surface-variant text-sm">
              O teu perfil está configurado. Vais receber o badge de{" "}
              <span className="text-primary font-semibold">Boas-Vindas</span> e{" "}
              <span className="text-primary font-mono">+50 XP</span> para começar.
            </p>
          </div>

          {/* Summary */}
          <div className="bg-surface-container-lowest border border-white/5 p-4 text-left space-y-2">
            <p className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-3">
              Profile_Summary
            </p>
            <div className="flex items-center gap-2">
              <span className="text-primary font-mono text-xs">nome:</span>
              <span className="text-white text-sm">{displayName}</span>
            </div>
            {bio && (
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono text-xs">bio:</span>
                <span className="text-white/70 text-sm">{bio}</span>
              </div>
            )}
            {interests.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-primary font-mono text-xs">interesses:</span>
                <span className="text-white/70 text-sm">
                  {interests.map((id) => INTERESTS.find((i) => i.id === id)?.label).join(", ")}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-sm border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              disabled={saving}
              className="px-6 py-3 bg-transparent border border-white/10 text-on-surface-variant font-mono text-xs uppercase tracking-widest hover:border-white/30 transition-all disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="flex-1 py-3 bg-primary text-black font-mono text-sm uppercase tracking-widest hover:shadow-[0_0_15px_rgba(161,255,194,0.3)] transition-all disabled:opacity-50"
            >
              {saving ? "A guardar..." : "Concluir"}
            </button>
          </div>
        </section>
      )}

      {/* Confetti success state */}
      {showConfetti && (
        <section className="space-y-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 border-2 border-primary">
            <span className="text-primary font-headline text-4xl font-black">V</span>
          </div>

          <div className="space-y-3">
            <h2 className="font-headline text-3xl font-black tracking-tighter text-white">
              Bem-vindo à{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">
                Vibe
              </span>
              !
            </h2>
            <p className="text-on-surface-variant text-sm">
              Badge de boas-vindas desbloqueado! A redirecionar para o dashboard...
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-primary uppercase">
              Redirecting...
            </span>
          </div>
        </section>
      )}
    </div>
  );
}

const CONFETTI_COLORS = ["#a1ffc2", "#d873ff", "#81e9ff", "#ffffff"];

function generateConfettiParticles() {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: (i * 37 + 13) % 100,
    delay: ((i * 41 + 7) % 200) / 100,
    duration: 2 + ((i * 53 + 11) % 300) / 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotation: (i * 67 + 23) % 360,
  }));
}

function ConfettiEffect() {
  const particles = useMemo(() => generateConfettiParticles(), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          <div
            className="w-2 h-2 rounded-sm"
            style={{
              backgroundColor: p.color,
              transform: `rotate(${p.rotation}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
