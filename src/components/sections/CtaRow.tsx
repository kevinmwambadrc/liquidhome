"use client";

import { useRouter } from "@/lib/router";
import { HOME_CTAS } from "@/lib/content";

export function CtaRow() {
  const { navigate, language } = useRouter();
  const label = (cta: (typeof HOME_CTAS)[number]) =>
    language === "en"
      ? cta.route === "/souscrire"
        ? "Subscribe"
        : cta.route === "/produits-et-services"
          ? "Products & Services"
          : "Need help?"
      : cta.label;

  return (
    <section className="bg-brand-soft py-10">
      <div className="max-w-7xl mx-auto px-4">
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
                {label(cta)}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
