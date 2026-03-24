"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "cookie-consent";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSnapshot() {
  return localStorage.getItem(COOKIE_CONSENT_KEY);
}

function getServerSnapshot() {
  return "unknown";
}

export function CookieConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const accept = useCallback(() => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    window.dispatchEvent(new StorageEvent("storage"));
  }, []);

  const reject = useCallback(() => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    window.dispatchEvent(new StorageEvent("storage"));
  }, []);

  // Don't show during SSR or if consent already given
  if (consent !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-[900px] mx-auto bg-surface-container-high/95 backdrop-blur-xl border border-white/10 rounded-sm p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] tracking-widest uppercase text-primary mb-2">
            Cookie_Protocol
          </p>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Utilizamos cookies essenciais para o funcionamento do site e cookies de analytics para
            melhorar a tua experiência. Consulta a nossa{" "}
            <Link
              href="/privacy"
              className="text-tertiary hover:text-tertiary/80 underline underline-offset-2 transition-colors"
            >
              política de privacidade
            </Link>{" "}
            para mais informações.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={reject}
            className="px-4 py-2 bg-transparent border border-white/10 text-on-surface-variant font-mono text-xs uppercase tracking-widest hover:border-white/30 hover:text-white transition-all"
          >
            Rejeitar
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 bg-primary text-black font-mono text-xs uppercase tracking-widest hover:shadow-[0_0_15px_rgba(161,255,194,0.3)] transition-all"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
