"use client";

import { PageBanner } from "@/components/sections/PageBanner";
import { ServiceOptions } from "@/components/sections/ServiceOptions";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Newsletter } from "@/components/sections/Newsletter";
import { useRouter } from "@/lib/router";
import { LogIn, ArrowRight, Wifi, Tv, Router as RouterIcon, Headphones } from "lucide-react";

export function ProductsServicesPage() {
  const { navigate } = useRouter();

  return (
    <>
      <PageBanner
        title="Produits & Services"
        subtitle="Tout ce dont vous avez besoin est disponible chez Liquid home. Profitez d'un accès 24/7, à une connexion internet haut débit, aux jeux vidéo, aux applications cinématiques et bien d'autres outils interactifs, éducatifs et professionnels !"
      />

      <ServiceOptions />

      {/* Detailed services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-2">
              Nos solutions connectées
            </h2>
            <p className="text-brand-muted max-w-2xl mx-auto">
              Une suite complète de services pour couvrir tous vos besoins numériques au quotidien
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ServiceDetailCard
              icon={Wifi}
              title="Fibre optique FTTH"
              description="Connexion internet ultra-rapide et illimitée, jusqu'à 300 Mbps, livrée directement à votre domicile via notre réseau fibre optique de pointe."
              points={["Jusqu'à 300 Mbps", "Données illimitées", "Installation en 5 jours", "Support 24/7"]}
              cta="Voir les forfaits"
              onClick={() => navigate("packages")}
            />
            <ServiceDetailCard
              icon={Tv}
              title="Streaming & Divertissement"
              description="Profitez d'une expérience streaming fluide en HD/4K sur Netflix, Disney+, Prime Video, YouTube et bien d'autres plateformes sans buffering."
              points={["Streaming HD/4K", "Multi-appareils", "Faible latence", "Gaming en ligne"]}
              cta="En savoir plus"
              onClick={() => navigate("contact-us")}
              accent
            />
            <ServiceDetailCard
              icon={RouterIcon}
              title="Équipements & Routeurs"
              description="Routeurs Wi-Fi dernière génération fournis et configurés par nos techniciens pour une couverture optimale dans toute votre maison."
              points={["Wi-Fi 6 disponible", "Configuration incluse", "Garantie 12 mois", "Remplacement gratuit"]}
              cta="Voir les options"
              onClick={() => navigate("packages")}
            />
            <ServiceDetailCard
              icon={Headphones}
              title="Support dédié"
              description="Une équipe d'assistance locale basée à Kinshasa, joignable 7j/7 par téléphone, WhatsApp et email pour résoudre tous vos problèmes."
              points={["Support local RDC", "7j/7 de 8h à 22h", "Intervention à domicile", "Hotline 4757 gratuite"]}
              cta="Nous contacter"
              onClick={() => navigate("contact-us")}
              accent
            />
          </div>
        </div>
      </section>

      <WhyChooseUs />

      {/* Existing customer CTA */}
      <section className="py-16 bg-brand-soft">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-10">
              <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
                Espace client
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-3">
                Déjà avec Liquid Home ?
              </h2>
              <p className="text-brand-muted mb-6 leading-relaxed">
                Connectez-vous pour tout gérer en ligne, en toute simplicité :
                factures, consommation, support technique et bien plus encore.
              </p>
              <button
                onClick={() => navigate("myliquid")}
                className="btn-brand inline-flex"
              >
                <LogIn className="h-4 w-4" />
                CONNECTEZ VOUS
              </button>
            </div>
            <div className="bg-brand-navy p-8 md:p-10 text-white flex flex-col justify-center">
              <div className="space-y-4">
                <FeatureLine label="Consulter et payer vos factures en ligne" />
                <FeatureLine label="Suivre votre consommation de données" />
                <FeatureLine label="Demander une intervention technique" />
                <FeatureLine label="Gérer vos abonnements et options" />
                <FeatureLine label="Contacter le support en direct" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}

function ServiceDetailCard({
  icon: Icon,
  title,
  description,
  points,
  cta,
  onClick,
  accent,
}: {
  icon: typeof Wifi;
  title: string;
  description: string;
  points: string[];
  cta: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border ${
        accent ? "border-brand-orange/40 bg-orange-50/40" : "border-gray-100 bg-white"
      } shadow-sm hover:shadow-xl transition-shadow`}
    >
      <div className={`p-6 ${accent ? "bg-brand-orange text-white" : "bg-brand-navy text-white"}`}>
        <div className="h-14 w-14 rounded-xl bg-white/15 flex items-center justify-center mb-3">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <div className="p-6">
        <p className="text-brand-muted leading-relaxed mb-4">{description}</p>
        <ul className="space-y-2 mb-5">
          {points.map((p, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-brand-navy">
              <ArrowRight className="h-4 w-4 text-brand-orange flex-shrink-0" />
              {p}
            </li>
          ))}
        </ul>
        <button onClick={onClick} className="btn-brand btn-brand-block">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function FeatureLine({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-6 w-6 rounded-full bg-brand-orange flex-shrink-0 flex items-center justify-center mt-0.5">
        <ArrowRight className="h-3.5 w-3.5 text-white" />
      </div>
      <span className="text-white/90 text-sm">{label}</span>
    </div>
  );
}
