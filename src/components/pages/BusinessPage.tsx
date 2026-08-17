"use client";

import { useEffect } from "react";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { Newsletter } from "@/components/sections/Newsletter";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { BUSINESS_SIDEBARS } from "@/lib/content";
import { useRouter } from "@/lib/router";
import { ArrowRight, Building2, Phone, BarChart3, Rocket, CheckCircle2 } from "lucide-react";

export function BusinessPage() {
  // Scroll explicitly to the section matching the URL hash (#home, #services,
  // #why, #contact), on first mount AND when the hash changes while already
  // on this page (e.g. clicking "Services" again in the header).
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 300);
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);
  const { navigate } = useRouter();

  return (
    <>
      <HeroCarousel />

      {/* Hero text */}
      <section id="home" className="bg-brand-navy text-white py-12 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
            <Building2 className="h-3.5 w-3.5" />
            Petite et Moyenne Enterprise
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Des solutions internet pensées pour votre entreprise
          </h1>
          <p className="text-white/85 max-w-2xl mx-auto">
            Que vous soyez une TPE, une PME ou un grand compte, Liquid Home vous accompagne avec des forfaits fibre sur-mesure, une SLA garanti et un support dédié.
          </p>
        </div>
      </section>

      {/* Services — right after the hero section */}
      <section id="services" className="py-16 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-2">
              Nos services
            </h2>
            <p className="text-brand-muted max-w-2xl mx-auto mb-4">
              Des services conçus pour la performance et la sérénité de votre entreprise
            </p>
            <button
              onClick={() => navigate("/business/produits-et-services")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:gap-3 transition-all"
            >
              Découvrir tous nos produits &amp; services
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BUSINESS_SIDEBARS.map((box, i) => {
              const Icon = box.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-shadow bg-white"
                >
                  <div className="bg-brand-navy p-6 text-white relative">
                    <div className="absolute right-4 top-4 text-7xl font-extrabold text-white/10">
                      0{i + 1}
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-brand-orange flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold leading-tight">{box.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-brand-muted leading-relaxed">{box.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business features */}
      <section id="why" className="py-16 bg-brand-soft scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-2">
              Pourquoi choisir Liquid Home pour votre entreprise ?
            </h2>
            <p className="text-brand-muted max-w-2xl mx-auto">
              Une connectivité fiable et performante pour faire grandir votre activité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Rocket, title: "SLA garanti", desc: "Engagement de disponibilité 99,9% avec compensation en cas de panne" },
              { icon: BarChart3, title: "Débit symétrique", desc: "Upload et download équivalents pour visioconférence et cloud" },
              { icon: Phone, title: "Support prioritaire", desc: "Ligne directe dédiée et intervention sous 4h ouvrées" },
              { icon: CheckCircle2, title: "Adresses multiples", desc: "Gérez tous vos sites depuis un portail unique centralisé" },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className="h-12 w-12 rounded-lg bg-brand-orange/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-brand-orange" />
                  </div>
                  <h3 className="font-bold text-brand-navy mb-2">{f.title}</h3>
                  <p className="text-sm text-brand-muted leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <WhyChooseUs />

      {/* CTA band */}
      <section id="contact" className="bg-gradient-to-r from-brand-orange to-brand-orange-hover text-white py-12 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Prêt à passer à la fibre pour votre entreprise ?
            </h2>
            <p className="text-white/90">
              Contactez notre équipe commerciale pour une solution sur-mesure.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/contact")}
              className="bg-white text-brand-navy font-bold uppercase px-6 py-3 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              Nous contacter
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/souscrire")}
              className="bg-brand-navy text-white font-bold uppercase px-6 py-3 rounded-md hover:bg-brand-navy-light transition-colors"
            >
              Souscrire maintenant
            </button>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
