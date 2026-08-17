"use client";

import { PageBanner } from "@/components/sections/PageBanner";
import { useRouter, LegalRoute, PATHS, LEGAL_ROUTES } from "@/lib/router";
import { ShieldCheck, Cookie, FileText, BookOpen, Lock, Download } from "lucide-react";
import { LEGAL_CONTENT } from "@/lib/legal";
import { LEGAL_ICONS } from "@/lib/legal-icons";



export function LegalPage({ route }: { route: LegalRoute }) {
  const { navigate } = useRouter();
  const content = LEGAL_CONTENT[route];
  if (!content) return null;
  const Icon = LEGAL_ICONS[route] ?? ShieldCheck;

  return (
    <>
      <PageBanner title={content.title} subtitle="Dernière mise à jour : Janvier 2026" />

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            {/* Sidebar nav */}
            <aside>
              <div className="rounded-lg border border-gray-200 overflow-hidden sticky top-24">
                <div className="bg-brand-navy text-white px-4 py-3">
                  <h3 className="font-bold text-sm uppercase">Documents</h3>
                </div>
                <nav className="p-2 bg-white">
                  {LEGAL_ROUTES.map((key) => {
                    const c = LEGAL_CONTENT[key];
                    const LIcon = LEGAL_ICONS[key] ?? FileText;
                    const active = route === key;
                    return (
                      <button
                        key={key}
                        onClick={() => navigate(PATHS[key])}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-left transition-colors ${
                          active
                            ? "bg-orange-50 text-brand-orange font-semibold"
                            : "text-brand-navy hover:bg-gray-50"
                        }`}
                      >
                        <LIcon className="h-4 w-4 flex-shrink-0" />
                        {c.title}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <article className="prose prose-sm max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-brand-orange" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-brand-navy m-0">
                  {content.title}
                </h1>
              </div>

              {route === "cookies" && <InteractiveCookieManager />}

              <div className="space-y-6">
                {content.sections.map((s, i) => (
                  <div key={i}>
                    <h2 className="text-lg font-bold text-brand-navy mb-2">{s.heading}</h2>
                    <p className="text-brand-muted leading-relaxed">{s.body}</p>
                  </div>
                ))}
              </div>

              {(route === "privacy" || route === "terms") && (
                <a
                  href={`/api/legal/pdf?doc=${route}`}
                  className="btn-brand w-full mt-8 inline-flex justify-center"
                  download
                >
                  <Download className="h-4 w-4" />
                  Télécharger en PDF
                </a>
              )}

              <div className="mt-8 p-4 bg-brand-soft rounded-lg flex items-start gap-3">
                <Lock className="h-5 w-5 text-brand-orange flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-brand-navy mb-1">
                    Une question sur ce document ?
                  </p>
                  <p className="text-brand-muted">
                    Contactez-nous à{" "}
                    <a href="mailto:DRCfibre@liquid.tech" className="text-brand-orange hover:underline">
                      DRCfibre@liquid.tech
                    </a>{" "}
                    ou au 4757.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

function InteractiveCookieManager() {
  const [prefs, setPrefs] = useState({
    necessary: true,
    functional: true,
    analytics: true,
    marketing: false,
  });
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cookies/consent", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setClientInfo(d.details);
          if (d.consent) {
            setPrefs({
              necessary: true,
              functional: !!d.consent.functional,
              analytics: !!d.consent.analytics,
              marketing: !!d.consent.marketing,
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/cookies/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...prefs, source: "page" }),
      });
      const data = await res.json();
      if (data.ok) {
        setFeedback(
          `✓ Préférences enregistrées pour l'IP ${data.details?.ip || "Client"} (${data.details?.city || "Kinshasa"})`
        );
      }
    } catch {
      setFeedback("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="not-prose mb-10 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
            <Cookie className="h-5 w-5 text-brand-orange" />
            Gestionnaire en direct de vos Cookies
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Activez ou désactivez les catégories utiles et urgentes de cookies
          </p>
        </div>
        {clientInfo && (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold self-start sm:self-auto font-mono">
            IP : {clientInfo.ip} ({clientInfo.city})
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Urgent */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600"></span>
              <p className="font-bold text-sm text-slate-900">🔴 Cookies Urgents &amp; Essentiels</p>
              <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[10px] font-bold uppercase">
                Requis
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Session client, sécurité, protection CSRF et validation des paiements.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Toujours Actif</span>
        </div>

        {/* Useful */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
              <p className="font-bold text-sm text-slate-900">🟢 Cookies Utiles &amp; Navigation</p>
            </div>
            <p className="text-xs text-slate-600">
              Langue préférée (FR/EN) et mémorisation de votre adresse GPS pour la fibre.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={prefs.functional}
              onChange={(e) => setPrefs({ ...prefs, functional: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
              <p className="font-bold text-sm text-slate-900">🔵 Cookies de Performance &amp; Speed Test</p>
            </div>
            <p className="text-xs text-slate-600">
              Mesure de la latence des POPs Liquid et historique de vos tests de débit.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={prefs.analytics}
              onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Marketing */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-600"></span>
              <p className="font-bold text-sm text-slate-900">🟣 Cookies Marketing &amp; Offres Communes</p>
            </div>
            <p className="text-xs text-slate-600">
              Offres promotionnelles adaptées aux communes de Kinshasa (Gombe, Limete, etc.).
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={prefs.marketing}
              onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-brand text-xs py-2.5 px-5 font-bold w-full sm:w-auto"
        >
          {saving ? "Enregistrement..." : "Mettre à jour mes préférences"}
        </button>

        {feedback && (
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            {feedback}
          </span>
        )}
      </div>
    </div>
  );
}
