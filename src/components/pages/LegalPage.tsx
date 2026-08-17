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
