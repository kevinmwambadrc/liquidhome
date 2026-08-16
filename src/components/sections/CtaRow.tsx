"use client";

import { useRouter } from "@/lib/router";
import { HOME_CTAS, STATS } from "@/lib/content";

export function CtaRow() {
  const { navigate } = useRouter();
  return (
    <section className="bg-brand-soft py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Stats band */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-5 text-center shadow-sm border border-gray-100"
            >
              <div className="text-3xl md:text-4xl font-extrabold text-brand-navy">
                {s.value}
              </div>
              <div className="text-xs md:text-sm text-brand-muted mt-1 uppercase tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* 3 CTA buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOME_CTAS.map((cta, i) => {
            const Icon = cta.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(cta.route)}
                className={`group flex items-center justify-center gap-3 px-6 py-5 rounded-lg font-semibold uppercase text-sm tracking-wide transition-all hover:-translate-y-1 ${
                  cta.primary
                    ? "bg-brand-orange text-white shadow-lg hover:bg-brand-orange-hover"
                    : "bg-white text-brand-navy border-2 border-brand-navy hover:bg-brand-navy hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {cta.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
