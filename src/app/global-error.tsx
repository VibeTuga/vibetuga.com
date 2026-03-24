"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };

  unstable_retry: (() => void) | unknown;
};

export default function GlobalError({ error, unstable_retry }: Props) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const retry =
    typeof unstable_retry === "function" ? () => (unstable_retry as () => void)() : undefined;

  return (
    <html lang="pt">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#0a0a0f",
          color: "#ffffff",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 500, width: "100%", textAlign: "center", padding: "0 24px" }}>
          {/* Terminal error header */}
          <div
            style={{
              backgroundColor: "#131313",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              padding: "8px 16px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "monospace",
              fontSize: 12,
              color: "rgba(239, 68, 68, 0.8)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#ef4444",
                display: "inline-block",
              }}
            />
            <span>CRITICAL_FAILURE</span>
            {error.digest && (
              <span
                style={{
                  marginLeft: "auto",
                  color: "rgba(255,255,255,0.2)",
                  fontSize: 10,
                }}
              >
                #{error.digest}
              </span>
            )}
          </div>

          <h1
            style={{
              fontFamily: "'Space Grotesk', Inter, sans-serif",
              fontSize: "2rem",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              marginBottom: 12,
            }}
          >
            Erro Inesperado
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              fontFamily: "monospace",
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Ocorreu um erro crítico na aplicação. A equipa foi notificada automaticamente.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {retry && (
              <button
                onClick={retry}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  backgroundColor: "#a1ffc2",
                  color: "#000000",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Tentar novamente
              </button>
            )}
          </div>

          {/* Neon accent line */}
          <div
            style={{
              marginTop: 48,
              height: 2,
              background: "linear-gradient(90deg, transparent, #a1ffc2, transparent)",
              opacity: 0.3,
            }}
          />
          <p
            style={{
              marginTop: 16,
              fontSize: 11,
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.15)",
            }}
          >
            VibeTuga // SYSTEM_RECOVERY
          </p>
        </div>
      </body>
    </html>
  );
}
