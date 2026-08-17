"use client";

import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { CtaRow } from "@/components/sections/CtaRow";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { FAQ } from "@/components/sections/FAQ";
import { Newsletter } from "@/components/sections/Newsletter";
import { ServiceOptions } from "@/components/sections/ServiceOptions";
import { Reveal } from "@/components/motion/Reveal";
import { useRouter } from "@/lib/router";
import { Rocket, Sparkles } from "lucide-react";

export function HomePage() {
  const { navigate, t } = useRouter();

  return (
    <>
      <HeroCarousel />
      <CtaRow />

      {/* Featured highlight band */}
      <section className="bg-gradient-to-r from-brand-navy to-brand-navy-light text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 [background:radial-gradient(circle_at_85%_20%,#f89e3c_0,transparent_45%)]" />
        <Reveal className="relative max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              {t("home.offerBadge")}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t("home.offerTitle")}</h2>
            <p className="text-white/85 max-w-2xl">{t("home.offerText")}</p>
          </div>
          <div className="flex md:justify-end">
            <button
              onClick={() => navigate("/packages")}
              className="btn-brand btn-brand-lg inline-flex"
            >
              <Rocket className="h-5 w-5" />
              {t("home.offerCta")}
            </button>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <ServiceOptions />
      </Reveal>
      <Reveal>
        <WhyChooseUs />
      </Reveal>
      <Reveal>
        <FAQ />
      </Reveal>
      <Reveal>
        <Newsletter />
      </Reveal>
    </>
  );
}
