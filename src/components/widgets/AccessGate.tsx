"use client";

import { useState, useEffect, FormEvent } from "react";
import { Lock, ShieldCheck, KeyRound, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";

export function AccessGate({ children }: { children: React.ReactNode }) {
  const [required, setRequired] = useState(false);
  const [granted, setGranted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if access is granted via API
    fetch("/api/access/verify")
      .then((res) => res.json())
      .then((data) => {
        setRequired(Boolean(data.required));
        setGranted(Boolean(data.granted));
      })
      .catch(() => {
        setGranted(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Veuillez saisir votre code d'accès.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/access/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setGranted(true);
      } else {
        setError(data.error || "Code d'accès incorrect.");
      }
    } catch {
      setError("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return null;
  }

  if (required && !granted) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-brand-navy overflow-y-auto px-4 py-8">
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_50%_30%,#ff5c00_0,transparent_60%)]" />

        <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-white/20 text-center animate-in fade-in zoom-in-95 duration-300">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/img/logo.png"
              alt="Liquid Home RDC"
              width={160}
              height={45}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Accès Privé &amp; Développement
          </div>

          <h2 className="text-xl font-extrabold text-brand-navy mb-2">
            Plateforme en Déploiement
          </h2>
          <p className="text-sm text-brand-muted mb-6 leading-relaxed">
            Ce site est actuellement en phase de développement et de tests internes. Veuillez saisir le code d&apos;accès administrateur pour prévisualiser la plateforme.
          </p>

          {/* Form */}
          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div>
              <label htmlFor="dev-passcode" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5">
                Code d&apos;accès / Passcode
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="dev-passcode"
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Entrez le code d'accès..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-brand-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-xl shadow-lg shadow-brand-orange/30 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Déverrouiller l&apos;accès</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-brand-muted">
            <ShieldCheck className="h-4 w-4 text-brand-orange" />
            <span>Liquid Home RDC • Sécurisé</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
