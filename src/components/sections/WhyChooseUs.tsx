"use client";

import { WHY_CHOOSE_REASONS } from "@/lib/content";

export function WhyChooseUs() {
  return (
    <section className="bg-brand-navy text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Pourquoi choisir Liquid Home
          </h2>
          <p className="text-white/85 max-w-2xl mx-auto">
            Parce-que nous croyons que tout le monde devrait - être connecté
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_CHOOSE_REASONS.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <div
                key={i}
                className="text-center group"
              >
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-brand-orange group-hover:bg-white transition-colors flex items-center justify-center">
                  <Icon className="h-9 w-9 text-white group-hover:text-brand-orange transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2 leading-tight">
                  {reason.title}
                </h3>
                <p className="text-white/75 text-sm leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
