"use client";

import { useRouter } from "@/lib/router";
import { WHY_CHOOSE_REASONS, WHY_CHOOSE_REASONS_EN } from "@/lib/content";

export function WhyChooseUs() {
  const { language, t } = useRouter();
  const reasons = language === "en" ? WHY_CHOOSE_REASONS_EN : WHY_CHOOSE_REASONS;

  return (
    <section className="bg-brand-navy text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("home.whyTitle")}</h2>
          <p className="text-white/85 max-w-2xl mx-auto">{t("home.whySub")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, i) => {
            const Icon = WHY_CHOOSE_REASONS[i].icon;
            return (
              <div
                key={i}
                className="text-center group"
              >
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-brand-orange group-hover:bg-white transition-colors flex items-center justify-center">
                  <Icon className="h-9 w-9 text-white group-hover:text-brand-orange transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2 leading-tight">{reason.title}</h3>
                <p className="text-white/75 text-sm leading-relaxed">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
