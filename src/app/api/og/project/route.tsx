import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { getOgFonts } from "@/lib/og-fonts";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "VibeTuga Showcase";
  const author = searchParams.get("author") || "VibeTuga";
  const techStack = searchParams.get("techStack") || "";

  const techs = techStack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6);

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
      {/* Top: Logo + showcase badge */}
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
            backgroundColor: "rgba(161, 255, 194, 0.1)",
            border: "1px solid rgba(161, 255, 194, 0.3)",
            fontSize: "14px",
            fontWeight: 700,
            color: "#a1ffc2",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          Showcase
        </div>
      </div>

      {/* Center: Title + tech stack */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontSize: title.length > 50 ? "44px" : "56px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.15,
            letterSpacing: "-1.5px",
            margin: 0,
            maxWidth: "900px",
          }}
        >
          {title}
        </h1>

        {/* Tech stack pills */}
        {techs.length > 0 && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {techs.map((tech) => (
              <div
                key={tech}
                style={{
                  padding: "6px 14px",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "rgba(255, 255, 255, 0.6)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {tech}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom: Author + accent line */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            width: "100%",
            height: "2px",
            background: "linear-gradient(90deg, #a1ffc2, rgba(161, 255, 194, 0.1))",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "rgba(161, 255, 194, 0.15)",
                border: "1px solid rgba(161, 255, 194, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
                color: "#a1ffc2",
              }}
            >
              {author[0]?.toUpperCase() ?? "V"}
            </div>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.6)",
              }}
            >
              {author}
            </span>
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.25)",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            vibetuga.com/showcase
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    },
  );
}
