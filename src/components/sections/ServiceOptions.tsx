"use client";

import { useRouter } from "@/lib/router";
import { SERVICE_OPTIONS, SERVICE_OPTIONS_EN } from "@/lib/content";
import { ArrowRight, Sparkles } from "lucide-react";

export function ServiceOptions() {
  const { navigate, language } = useRouter();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICE_OPTIONS.map((opt, i) => {
            const en = SERVICE_OPTIONS_EN[i];
            const Icon = opt.icon;
            const title = language === "en" ? en.title : opt.title;
            const description = language === "en" ? en.description : opt.description;
            const cta = language === "en" ? en.cta : opt.cta;
            const colorClasses =
              opt.color === "navy"
                ? "bg-brand-navy text-white"
                : "bg-brand-orange text-white";
            return (
              <button
                key={opt.id}
                onClick={() => !opt.comingSoon && navigate(opt.route)}
                disabled={opt.comingSoon}
                className={`service-option text-left bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl ${
                  opt.comingSoon ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                }`}
              >
                {/* Header band */}
                <div className={`${colorClasses} p-6 relative`}>
                  {opt.comingSoon && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/20 text-white text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full">
                      <Sparkles className="h-3 w-3" /> {language === "en" ? "Soon" : "Bientôt"}
                    </span>
                  )}
                  <div className="h-12 w-12 rounded-lg bg-white/15 flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                {/* Body */}
                <div className="p-5">
                  <h3 className="font-bold text-brand-navy text-lg mb-1.5">{title}</h3>
                  <p className="text-sm text-brand-muted leading-relaxed mb-3">{description}</p>
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-semibold ${
                      opt.comingSoon
                        ? "text-gray-400"
                        : "text-brand-orange hover:gap-2 transition-all"
                    }`}
                  >
                    {cta}
                    {!opt.comingSoon && <ArrowRight className="h-4 w-4" />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
