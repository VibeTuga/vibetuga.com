"use client";

import { useState } from "react";

type DataPoint = {
  date: string;
  views: number;
};

type Props = {
  data: DataPoint[];
};

export function AnalyticsChart({ data }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-6">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
          Visualizações Diárias
        </p>
        <div className="flex items-center justify-center h-48 text-sm text-white/20 font-mono">
          Sem dados disponíveis
        </div>
      </div>
    );
  }

  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const chartHeight = 200;
  const chartWidth = 700;
  const barGap = 2;
  const barWidth = Math.max((chartWidth - barGap * (data.length - 1)) / data.length, 4);
  const totalWidth = data.length * (barWidth + barGap) - barGap;

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6">
      <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
        Visualizações Diárias
      </p>

      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${totalWidth + 60} ${chartHeight + 40}`}
          className="w-full min-w-[400px]"
          preserveAspectRatio="xMinYMin meet"
        >
          {/* Y-axis max label */}
          <text
            x={0}
            y={14}
            className="fill-white/30 text-[10px]"
            fontFamily="monospace"
            fontSize="10"
          >
            {maxViews}
          </text>

          {/* Y-axis zero label */}
          <text
            x={0}
            y={chartHeight + 4}
            className="fill-white/30 text-[10px]"
            fontFamily="monospace"
            fontSize="10"
          >
            0
          </text>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={40}
              y1={chartHeight * (1 - ratio)}
              x2={totalWidth + 40}
              y2={chartHeight * (1 - ratio)}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Baseline */}
          <line
            x1={40}
            y1={chartHeight}
            x2={totalWidth + 40}
            y2={chartHeight}
            stroke="rgba(255,255,255,0.05)"
          />

          {/* Bars */}
          {data.map((d, i) => {
            const barH = (d.views / maxViews) * chartHeight;
            const x = 40 + i * (barWidth + barGap);
            const y = chartHeight - barH;
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={d.date}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Hover area (invisible, full height) */}
                <rect x={x} y={0} width={barWidth} height={chartHeight} fill="transparent" />

                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barH, 1)}
                  fill={isHovered ? "#d873ff" : "#a1ffc2"}
                  opacity={isHovered ? 1 : 0.8}
                  rx={1}
                />

                {/* X-axis labels (every 5th) */}
                {i % 5 === 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 16}
                    textAnchor="middle"
                    fontFamily="monospace"
                    fontSize="8"
                    className="fill-white/30"
                  >
                    {formatDate(d.date)}
                  </text>
                )}

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.min(x - 30, totalWidth - 20)}
                      y={Math.max(y - 38, 0)}
                      width={80}
                      height={28}
                      rx={4}
                      fill="rgba(0,0,0,0.9)"
                      stroke="rgba(161,255,194,0.3)"
                      strokeWidth={1}
                    />
                    <text
                      x={Math.min(x - 30, totalWidth - 20) + 40}
                      y={Math.max(y - 38, 0) + 12}
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontSize="8"
                      className="fill-white/50"
                    >
                      {formatDate(d.date)}
                    </text>
                    <text
                      x={Math.min(x - 30, totalWidth - 20) + 40}
                      y={Math.max(y - 38, 0) + 23}
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#a1ffc2"
                    >
                      {d.views} views
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
