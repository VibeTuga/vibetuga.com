import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { getOgFonts } from "@/lib/og-fonts";

const LEVEL_NAMES: Record<number, string> = {
  1: "Noob",
  2: "Script Kiddie",
  3: "Vibe Coder",
  4: "Prompt Whisperer",
  5: "AI Tamer",
  6: "Code Wizard",
  7: "Agent Builder",
  8: "Tuga Master",
  9: "Vibe Lord",
  10: "Lenda",
};

function getLevelColor(level: number): string {
  if (level <= 3) return "#a1ffc2";
  if (level <= 6) return "#00F0FF";
  if (level <= 9) return "#d873ff";
  return "#FFD700";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name") || "VibeTuga User";
  const level = parseInt(searchParams.get("level") || "1", 10);
  const xp = searchParams.get("xp") || "0";
  const badges = searchParams.get("badges") || "0";

  const levelName = LEVEL_NAMES[level] || LEVEL_NAMES[1];
  const levelColor = getLevelColor(level);

  const fonts = await getOgFonts();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#0A0A0A",
        padding: "60px",
        fontFamily: "Space Grotesk",
      }}
    >
      {/* Top: Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #a1ffc2, #00F0FF)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 700,
              color: "#0A0A0A",
            }}
          >
            V
          </div>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.5px",
            }}
          >
            VibeTuga
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "6px 16px",
            backgroundColor: "rgba(216, 115, 255, 0.1)",
            border: "1px solid rgba(216, 115, 255, 0.3)",
            fontSize: "14px",
            fontWeight: 700,
            color: "#d873ff",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          Perfil
        </div>
      </div>

      {/* Center: User info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "40px",
          flex: 1,
          justifyContent: "flex-start",
          paddingTop: "20px",
        }}
      >
        {/* Avatar circle with level ring */}
        <div
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            border: `4px solid ${levelColor}`,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "64px",
            fontWeight: 700,
            color: levelColor,
            flexShrink: 0,
            boxShadow: `0 0 30px ${levelColor}33`,
          }}
        >
          {name[0]?.toUpperCase() ?? "V"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-1px",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {name}
          </h1>

          {/* Level badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: levelColor,
              }}
            >
              Lv.{level}
            </span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              {levelName}
            </span>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "32px", marginTop: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#00F0FF",
                }}
              >
                {parseInt(xp, 10).toLocaleString("pt-PT")}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "rgba(255, 255, 255, 0.35)",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                XP Total
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#d873ff",
                }}
              >
                {badges}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "rgba(255, 255, 255, 0.35)",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                Badges
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: accent line + URL */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            width: "100%",
            height: "2px",
            background: `linear-gradient(90deg, ${levelColor}, ${levelColor}1A)`,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.25)",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            vibetuga.com/profile
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
