"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "@/lib/router";

export function Newsletter() {
  const { t } = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      setResult({
        ok: !!data.ok,
        message: data.message || "Merci de vous être abonné !",
      });
      if (data.ok) {
        setName("");
        setEmail("");
      }
    } catch {
      setResult({ ok: false, message: "Une erreur est survenue. Réessayez plus tard." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-brand-navy text-white py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-brand-orange flex items-center justify-center">
            <Mail className="h-7 w-7 text-white" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{t("home.newsletterTitle")}</h2>
        <p className="text-white/80 text-sm mb-6">{t("home.newsletterText")}</p>

        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("home.newsletterName")}
            className="flex-1 rounded-md px-4 py-3 text-sm text-gray-900 bg-white border border-gray-300 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("home.newsletterEmail")}
            required
            className="flex-1 rounded-md px-4 py-3 text-sm text-gray-900 bg-white border border-gray-300 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
          />
          <button type="submit" disabled={loading} className="btn-brand btn-brand-lg">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("covreq.sending")}
              </>
            ) : (
              t("home.newsletterBtn")
            )}
          </button>
        </form>

        {result && (
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm ${
              result.ok
                ? "bg-green-500/20 text-green-100 border border-green-400/40"
                : "bg-red-500/20 text-red-100 border border-red-400/40"
            }`}
          >
            {result.ok ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {result.message}
          </div>
        )}
      </div>
    </section>
  );
}
