"use client";

import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { CtaRow } from "@/components/sections/CtaRow";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { CoverageAreas } from "@/components/sections/CoverageAreas";
import { FAQ } from "@/components/sections/FAQ";
import { Newsletter } from "@/components/sections/Newsletter";
import { ServiceOptions } from "@/components/sections/ServiceOptions";
import { useRouter } from "@/lib/router";
import { Rocket, ArrowRight, Wifi, Sparkles } from "lucide-react";

export function HomePage() {
  const { navigate } = useRouter();

  return (
    <>
      <HeroCarousel />
      <CtaRow />

      {/* Featured highlight band */}
      <section className="bg-gradient-to-r from-brand-navy to-brand-navy-light text-white py-14">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Offre spéciale
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Passez en mode Fibre & faites vivre votre maison !
            </h2>
            <p className="text-white/85 max-w-2xl">
              Meilleure connexion, meilleure sensation ! Découvrez nos forfaits
              Libota dès 49 USD/mois avec installation gratuite et données illimitées.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => navigate("packages")}
              className="btn-brand btn-brand-lg inline-flex"
            >
              <Rocket className="h-5 w-5" />
              Découvrir Libota
            </button>
          </div>
        </div>
      </section>

      <ServiceOptions />
      <WhyChooseUs />
      <CoverageAreas />
      <FAQ />
      <Newsletter />
    </>
  );
}
