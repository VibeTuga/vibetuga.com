import Link from "next/link";

const timeTabs = [
  { label: "Semanal", active: true },
  { label: "Mensal", active: false },
  { label: "All-Time", active: false },
] as const;

const categoryPills = [
  { label: "Geral", active: true },
  { label: "Criadores de Projetos", active: false },
  { label: "Top Sellers", active: false },
  { label: "Mais Helpful", active: false },
] as const;

const podium = [
  {
    rank: "#2",
    username: "CyberTuga",
    level: "SENTINEL_LVL45",
    xp: "84.200 XP",
    color: "tertiary",
    borderColor: "border-tertiary",
    bgColor: "bg-tertiary",
    textColor: "text-tertiary",
    shadow: "shadow-[0_0_20px_rgba(129,233,255,0.3)]",
    size: "w-24 h-24",
    padding: "p-8",
    order: "order-2 md:order-1",
    xpSize: "text-2xl",
    isFirst: false,
  },
  {
    rank: "#1",
    username: "VibeMaster_99",
    level: "GOD_PROTOCOL_LVL99",
    xp: "120.450 XP",
    color: "primary",
    borderColor: "border-primary",
    bgColor: "bg-primary",
    textColor: "text-primary",
    shadow: "shadow-[0_0_30px_rgba(161,255,194,0.4)]",
    size: "w-32 h-32",
    padding: "p-10",
    order: "order-1 md:order-2",
    xpSize: "text-4xl",
    isFirst: true,
  },
  {
    rank: "#3",
    username: "LisbonGlow",
    level: "VIBE_REBEL_LVL38",
    xp: "72.900 XP",
    color: "secondary",
    borderColor: "border-secondary",
    bgColor: "bg-secondary",
    textColor: "text-secondary",
    shadow: "shadow-[0_0_20px_rgba(216,115,255,0.3)]",
    size: "w-24 h-24",
    padding: "p-8",
    order: "order-3 md:order-3",
    xpSize: "text-2xl",
    isFirst: false,
  },
] as const;

const tableData = [
  {
    rank: "#04",
    username: "RetroCoder",
    level: "LVL 32",
    xp: "68.420",
    projects: 12,
    badges: ["verified", "diamond"],
  },
  {
    rank: "#05",
    username: "NeonPanda",
    level: "LVL 29",
    xp: "55.100",
    projects: 8,
    badges: ["rocket"],
  },
  {
    rank: "#06",
    username: "GlitchArt_pt",
    level: "LVL 28",
    xp: "52.890",
    projects: 24,
    badges: ["palette"],
  },
  {
    rank: "#07",
    username: "CodeAlquimista",
    level: "LVL 25",
    xp: "48.320",
    projects: 15,
    badges: ["code"],
  },
  {
    rank: "#08",
    username: "PortoHacker",
    level: "LVL 22",
    xp: "41.750",
    projects: 9,
    badges: ["shield"],
  },
] as const;

export default function LeaderboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-8 min-h-screen">
      {/* Header Section */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-on-background mb-2">
              Leaderboard
            </h1>
            <p className="font-label text-primary/60 uppercase tracking-widest text-sm">
              Quem está a vibrar mais forte.
            </p>
          </div>
          {/* Tab Toggle */}
          <div className="flex bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/20">
            {timeTabs.map((tab) => (
              <button
                key={tab.label}
                className={`px-6 py-2 text-xs font-label uppercase tracking-wider transition-all ${
                  tab.active
                    ? "text-on-background bg-surface-container-highest rounded shadow-lg"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="flex flex-wrap gap-3 mb-12">
        {categoryPills.map((pill) => (
          <button
            key={pill.label}
            className={`px-4 py-1.5 rounded-full text-xs font-label uppercase tracking-tighter transition-all ${
              pill.active
                ? "border border-primary text-primary bg-primary/5"
                : "border border-outline-variant/30 text-white/60 hover:border-white"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </section>

      {/* Top 3 Showcase */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
        {podium.map((entry) => (
          <div
            key={entry.rank}
            className={`${entry.order} flex flex-col items-center bg-surface-container-high/60 backdrop-blur-xl ${entry.padding} border-t-2 ${entry.borderColor}/50 relative ${
              entry.isFirst
                ? "transform md:scale-110 z-10 shadow-[0_20px_50px_rgba(161,255,194,0.15)]"
                : ""
            }`}
          >
            {entry.isFirst ? (
              <div
                className={`absolute -top-6 left-1/2 -translate-x-1/2 ${entry.bgColor} text-on-primary px-6 py-2 font-headline font-black italic text-xl tracking-tighter`}
              >
                THE ALPHA {entry.rank}
              </div>
            ) : (
              <div
                className={`absolute -top-4 ${entry.rank === "#2" ? "left-4" : "right-4"} ${entry.bgColor} ${entry.rank === "#2" ? "text-on-tertiary" : "text-on-secondary"} px-3 py-1 font-headline font-bold italic`}
              >
                {entry.rank}
              </div>
            )}

            <div
              className={`${entry.size} rounded-full border-4 ${entry.borderColor} p-1 mb-4 ${entry.shadow}`}
            >
              <div className="w-full h-full rounded-full bg-surface-container-highest" />
            </div>

            <h3
              className={`font-headline ${entry.isFirst ? "text-2xl font-black" : "text-xl font-bold"} ${entry.textColor} mb-1`}
            >
              {entry.username}
            </h3>

            <div
              className={`px-3 py-0.5 ${entry.isFirst ? `${entry.bgColor} text-on-primary font-bold` : `${entry.bgColor}/10 ${entry.textColor} border ${entry.borderColor}/20`} text-[10px] font-label uppercase mb-4`}
            >
              {entry.level}
            </div>

            <div
              className={`font-label ${entry.xpSize} font-black text-white ${entry.isFirst ? "tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" : ""}`}
            >
              {entry.xp}
            </div>
          </div>
        ))}
      </section>

      {/* Leaderboard Table */}
      <section className="mb-24 overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead className="font-label text-[10px] text-white/30 uppercase tracking-[0.2em]">
            <tr>
              <th className="px-6 py-4 font-normal">Rank</th>
              <th className="px-6 py-4 font-normal">Cidadão</th>
              <th className="px-6 py-4 font-normal">Credencial</th>
              <th className="px-6 py-4 font-normal">XP Protocol</th>
              <th className="px-6 py-4 font-normal">Obras</th>
              <th className="px-6 py-4 font-normal">Badges</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {tableData.map((row) => (
              <tr
                key={row.rank}
                className="bg-surface-container-low hover:bg-surface-container transition-colors group"
              >
                <td className="px-6 py-4 font-label font-bold text-white/40 group-hover:text-primary">
                  {row.rank}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30" />
                    <span className="font-bold">{row.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded-sm bg-surface-container-highest text-[10px] font-label text-white/60">
                    {row.level}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-primary-dim">{row.xp}</td>
                <td className="px-6 py-4 font-mono">{row.projects}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {row.badges.map((badge) => (
                      <span
                        key={badge}
                        className="w-4 h-4 rounded-full bg-surface-container-highest border border-outline-variant/20 inline-block"
                        title={badge}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Your Position (sticky bottom bar) */}
      <section className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 md:pb-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-surface-container-high border-l-4 border-primary shadow-[0_0_40px_rgba(0,0,0,0.8)] p-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="font-headline font-black text-2xl italic text-primary">#142</div>
              <div className="hidden md:block w-[1px] h-8 bg-white/10" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-primary" />
                <div>
                  <p className="font-bold text-sm">Tu (VibeUser_Zero)</p>
                  <p className="text-[10px] font-label text-primary uppercase">Você está aqui</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8 pr-4">
              <div className="text-right">
                <p className="text-[10px] font-label text-white/40 uppercase">Total XP</p>
                <p className="font-mono font-bold text-primary text-xl">12.450</p>
              </div>
              <Link
                href="#"
                className="bg-primary text-on-primary font-label text-[10px] font-bold uppercase px-4 py-2 hover:shadow-[0_0_15px_rgba(161,255,194,0.4)] transition-all"
              >
                Ver Perfil
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
