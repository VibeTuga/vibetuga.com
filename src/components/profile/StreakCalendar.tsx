"use client";

import { useState, useMemo, useCallback } from "react";
import { Flame, Snowflake } from "lucide-react";

// ─── types ───────────────────────────────────────────────────

interface DayActivity {
  date: string; // YYYY-MM-DD
  count: number;
}

interface StreakCalendarProps {
  /** Activity data from API */
  activities: DayActivity[];
  /** Current streak in days */
  currentStreak: number;
  /** Longest streak ever */
  longestStreak: number;
  /** Whether the freeze button should be shown (own profile + eligible) */
  showFreezeButton?: boolean;
  /** Last time streak freeze was used (null if never) */
  streakFreezeUsedAt?: string | null;
}

// ─── constants ───────────────────────────────────────────────

const DAYS_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

const MONTHS_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

function getActivityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

const LEVEL_CLASSES = ["bg-white/5", "bg-primary/20", "bg-primary/50", "bg-primary/80"] as const;

// ─── helpers ─────────────────────────────────────────────────

function formatDatePT(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d} ${MONTHS_PT[Number(m) - 1]} ${y}`;
}

function toISODateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function canUseFreezeToday(freezeUsedAt: string | null | undefined): boolean {
  if (!freezeUsedAt) return true;
  const lastUsed = new Date(freezeUsedAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 30;
}

function daysUntilFreezeAvailable(freezeUsedAt: string | null | undefined): number {
  if (!freezeUsedAt) return 0;
  const lastUsed = new Date(freezeUsedAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, 30 - diffDays);
}

// ─── component ───────────────────────────────────────────────

export function StreakCalendar({
  activities,
  currentStreak,
  longestStreak,
  showFreezeButton = false,
  streakFreezeUsedAt,
}: StreakCalendarProps) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);
  const [freezing, setFreezing] = useState(false);
  const [freezeUsed, setFreezeUsed] = useState(streakFreezeUsedAt ?? null);

  // Build activity map
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of activities) {
      map.set(a.date, a.count);
    }
    return map;
  }, [activities]);

  // Generate grid: 53 weeks x 7 days, ending today
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Go back 364 days (52 full weeks + today's week)
    const start = new Date(today);
    start.setDate(start.getDate() - 364);

    // Align to Monday (ISO: Monday=1)
    const startDay = start.getDay();
    const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
    start.setDate(start.getDate() + mondayOffset);

    const result: { date: string; count: number }[][] = [];
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;

    const cursor = new Date(start);
    let weekIdx = 0;

    while (cursor <= today || result.length < 53) {
      const week: { date: string; count: number }[] = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const dateStr = toISODateStr(cursor);
        const isFuture = cursor > today;
        const count = isFuture ? -1 : (activityMap.get(dateStr) ?? 0);

        // Track month labels
        if (cursor.getMonth() !== lastMonth && !isFuture) {
          lastMonth = cursor.getMonth();
          months.push({ label: MONTHS_PT[lastMonth], col: weekIdx });
        }

        week.push({ date: dateStr, count });
        cursor.setDate(cursor.getDate() + 1);
      }
      result.push(week);
      weekIdx++;
      if (result.length >= 53) break;
    }

    return { weeks: result, monthLabels: months };
  }, [activityMap]);

  const handleMouseEnter = useCallback((e: React.MouseEvent, date: string, count: number) => {
    if (count < 0) return; // future
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({ date, count, x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleFreeze = useCallback(async () => {
    if (freezing) return;
    setFreezing(true);
    try {
      const res = await fetch("/api/users/me/streak-freeze", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setFreezeUsed(data.streakFreezeUsedAt);
      }
    } finally {
      setFreezing(false);
    }
  }, [freezing]);

  const freezeEligible = canUseFreezeToday(freezeUsed);
  const freezeDaysLeft = daysUntilFreezeAvailable(freezeUsed);

  return (
    <div className="bg-surface-container-low p-6 border border-white/5">
      {/* Header: streak stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-orange-400" />
            <div>
              <span className="font-mono text-lg font-bold text-white">{currentStreak}</span>
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest ml-2">
                Streak Atual
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-white/30" />
            <div>
              <span className="font-mono text-sm font-bold text-white/60">{longestStreak}</span>
              <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest ml-2">
                Recorde
              </span>
            </div>
          </div>
        </div>

        {showFreezeButton && (
          <div>
            {freezeEligible ? (
              <button
                onClick={handleFreeze}
                disabled={freezing}
                className="flex items-center gap-2 px-3 py-1.5 bg-tertiary/10 text-tertiary text-xs font-bold uppercase tracking-wider hover:bg-tertiary/20 transition-colors disabled:opacity-50"
              >
                <Snowflake size={14} />
                {freezing ? "A congelar..." : "Congelar Streak"}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-white/30 text-xs font-mono uppercase">
                <Snowflake size={14} />
                Disponível em {freezeDaysLeft}d
              </div>
            )}
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0.5 min-w-fit">
          {/* Month labels */}
          <div className="flex gap-0.5 ml-8 mb-1">
            {monthLabels.map((m, i) => {
              const prevCol = i > 0 ? monthLabels[i - 1].col : -2;
              const colSpan = m.col - prevCol;
              return (
                <span
                  key={`${m.label}-${m.col}`}
                  className="font-mono text-[9px] text-white/30 uppercase"
                  style={{
                    width: `${colSpan * 13}px`,
                    textAlign: "left",
                  }}
                >
                  {colSpan >= 2 ? m.label : ""}
                </span>
              );
            })}
          </div>

          {/* Day rows */}
          {DAYS_PT.map((dayLabel, dayIndex) => (
            <div key={dayLabel} className="flex items-center gap-0.5">
              {/* Day label */}
              <span className="w-7 font-mono text-[9px] text-white/30 text-right pr-1 shrink-0">
                {dayIndex % 2 === 0 ? dayLabel : ""}
              </span>

              {/* Squares */}
              {weeks.map((week, weekIndex) => {
                const day = week[dayIndex];
                if (!day || day.count < 0) {
                  return <div key={`${weekIndex}-${dayIndex}`} className="w-[11px] h-[11px]" />;
                }
                const level = getActivityLevel(day.count);
                return (
                  <div
                    key={day.date}
                    className={`w-[11px] h-[11px] rounded-[2px] ${LEVEL_CLASSES[level]} cursor-pointer transition-opacity hover:opacity-80`}
                    onMouseEnter={(e) => handleMouseEnter(e, day.date, day.count)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4">
        <span className="font-mono text-[9px] text-white/20 uppercase">Últimos 365 dias</span>
        <div className="flex items-center gap-1">
          <span className="font-mono text-[9px] text-white/20 mr-1">Menos</span>
          {LEVEL_CLASSES.map((cls, i) => (
            <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${cls}`} />
          ))}
          <span className="font-mono text-[9px] text-white/20 ml-1">Mais</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-1.5 bg-surface-bright border border-white/10 text-xs font-mono pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 36,
            transform: "translateX(-50%)",
          }}
        >
          <span className="text-white/80">{formatDatePT(tooltip.date)}</span>
          {" — "}
          <span className="text-primary font-bold">
            {tooltip.count === 0
              ? "Sem atividade"
              : `${tooltip.count} ${tooltip.count === 1 ? "atividade" : "atividades"}`}
          </span>
        </div>
      )}
    </div>
  );
}
