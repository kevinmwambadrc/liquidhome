"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Check, X } from "lucide-react";

const CHOICE_KEY = "lh-consent";

function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};path=/;max-age=${days * 86400};samesite=lax`;
}

export function getConsent(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)lh_consent=([^;]+)/);
  return m ? m[1] : null;
}

export function track(kind: string, payload: Record<string, unknown> = {}) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...payload }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tracking never breaks the UI */
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the banner when no choice was stored yet
    const stored = getConsent() ?? window.localStorage.getItem(CHOICE_KEY);
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const choose = (value: "accepted" | "refused") => {
    setCookie("lh_consent", value, 365);
    window.localStorage.setItem(CHOICE_KEY, value);
    setVisible(false);
    // Consent events are always recorded (even when refused)
    track("consent", { label: value });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[90] max-w-3xl mx-auto"
          role="dialog"
          aria-label="Consentement cookies"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-brand-header-gradient flex items-center justify-center flex-shrink-0">
              <Cookie className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-bold text-brand-navy mb-0.5">Votre vie privée compte 🍪</p>
              <p className="text-brand-muted leading-relaxed">
                Nous utilisons des cookies pour mesurer l&apos;audience du site et améliorer votre expérience
                (pages visitées, éléments cliqués). Aucune donnée n&apos;est partagée à des tiers.{" "}
                <Link href="/cookies" className="text-brand-orange font-semibold hover:underline">
                  Politique des cookies
                </Link>
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => choose("refused")}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border-2 border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" />
                Refuser
              </button>
              <button
                onClick={() => choose("accepted")}
                className="flex-1 md:flex-none btn-brand text-sm"
              >
                <Check className="h-4 w-4" />
                Accepter
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
