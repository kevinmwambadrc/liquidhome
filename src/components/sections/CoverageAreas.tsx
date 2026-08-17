"use client";

import { COVERAGE_AREAS } from "@/lib/content";
import { MapPin, CheckCircle2 } from "lucide-react";
import { useRouter } from "@/lib/router";

export function CoverageAreas() {
  const { navigate } = useRouter();
  return (
    <section className="py-16 bg-brand-soft">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
              <MapPin className="h-3.5 w-3.5" />
              Couverture fibre
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
              La fibre Liquid Home à Kinshasa
            </h2>
            <p className="text-brand-muted leading-relaxed mb-6">
              Notre réseau fibre optique couvre déjà les principales communes de
              Kinshasa et s'étend chaque mois. Vérifiez si votre adresse est
              éligible en quelques secondes.
            </p>
            <ul className="grid grid-cols-2 gap-2 mb-6">
              {COVERAGE_AREAS.map((area) => (
                <li
                  key={area}
                  className="flex items-center gap-2 text-sm text-brand-navy"
                >
                  <CheckCircle2 className="h-4 w-4 text-brand-orange flex-shrink-0" />
                  {area}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate("/souscrire")} className="btn-brand">
              Vérifier mon adresse
            </button>
          </div>

          {/* Stylized map */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto rounded-2xl overflow-hidden bg-brand-navy relative shadow-2xl">
              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(248,158,60,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(248,158,60,0.4) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              {/* Dots representing coverage */}
              {[
                { top: "20%", left: "30%", delay: "0s" },
                { top: "35%", left: "55%", delay: "0.3s" },
                { top: "50%", left: "40%", delay: "0.6s" },
                { top: "65%", left: "60%", delay: "0.9s" },
                { top: "25%", left: "65%", delay: "1.2s" },
                { top: "70%", left: "35%", delay: "1.5s" },
                { top: "45%", left: "75%", delay: "1.8s" },
              ].map((p, i) => (
                <span
                  key={i}
                  className="absolute h-3 w-3 rounded-full bg-brand-orange"
                  style={{
                    top: p.top,
                    left: p.left,
                    animation: `wa-pulse 2s ease-out ${p.delay} infinite`,
                    boxShadow: "0 0 0 4px rgba(248,158,60,0.3)",
                  }}
                />
              ))}
              {/* Center pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <MapPin className="h-10 w-10 text-brand-orange drop-shadow-lg" fill="currentColor" />
              </div>
              {/* Label */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-lg px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-brand-muted">
                  Zone principale
                </p>
                <p className="font-bold text-brand-navy">Kinshasa, RDC</p>
                <p className="text-xs text-brand-muted mt-0.5">
                  -4.315704°, 15.285092°
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
