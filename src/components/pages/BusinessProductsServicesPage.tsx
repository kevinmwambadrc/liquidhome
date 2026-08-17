"use client";

import { PageBanner } from "@/components/sections/PageBanner";
import { Newsletter } from "@/components/sections/Newsletter";
import { useRouter } from "@/lib/router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Gauge,
  Headphones,
  Network,
  Phone,
  Rocket,
  Router as RouterIcon,
  ShieldCheck,
} from "lucide-react";

const BUSINESS_SERVICES = [
  {
    icon: Gauge,
    title: "Fibre Internet Professionnelle",
    description:
      "Une connexion fibre haut débit pensée pour l'entreprise : débit symétrique garanti, bande passante dédiée et latence maîtrisée pour vos outils critiques.",
    points: [
      "Débit symétrique jusqu'à 1 Gbps",
      "Bande passante garantie en heures ouvrées",
      "Adresses IP fixes disponibles",
      "Installation coordonnée avec vos équipes",
    ],
    cta: "Nous contacter",
  },
  {
    icon: Network,
    title: "Connectivité multisites",
    description:
      "Interconnectez vos bureaux, agences et entrepôts au sein d'un réseau privé sécurisé, supervisé depuis un portail unique.",
    points: [
      "Liaisons inter-sites sécurisées",
      "Gestion centralisée de toutes vos adresses",
      "VLAN et segmentation réseau",
      "Supervision proactive 24/7",
    ],
    cta: "Nous contacter",
  },
  {
    icon: RouterIcon,
    title: "Équipements professionnels",
    description:
      "Routeurs, switches et bornes Wi-Fi 6 d'entreprise, fournis, configurés et maintenus par nos équipes pour une couverture totale de vos locaux.",
    points: [
      "Wi-Fi 6 haute densité",
      "Secours 4G/LTE en option",
      "Configuration et maintenance incluses",
      "Remplacement matériel sous 24h",
    ],
    cta: "Nous contacter",
  },
  {
    icon: Phone,
    title: "Téléphonie IP & Cloud",
    description:
      "Modernisez votre téléphonie : standard virtuel, postes fixes et mobiles unifiés, avec des tarifs d'appels professionnels compétitifs.",
    points: [
      "Standard téléphonique virtuel (PBX)",
      "Numéros fixes et mobiles unifiés",
      "Conférences et files d'attente",
      "Bientôt disponible — nous consulter",
    ],
    cta: "Nous contacter",
    comingSoon: true,
  },
  {
    icon: ShieldCheck,
    title: "SLA & Continuité d'activité",
    description:
      "Un engagement contractuel de disponibilité 99,9 % avec compensation en cas de panne, pour une continuité d'activité sans compromis.",
    points: [
      "Disponibilité garantie 99,9 %",
      "Compensation contractuelle en cas de panne",
      "Rapports de disponibilité mensuels",
      "Secours LTE automatique en option",
    ],
    cta: "Nous contacter",
  },
  {
    icon: Headphones,
    title: "Support prioritaire",
    description:
      "Une ligne directe dédiée aux entreprises, avec intervention sur site sous 4 heures ouvrées à Kinshasa et un ingénieur assigné à votre compte.",
    points: [
      "Hotline entreprise dédiée",
      "Intervention sous 4h ouvrées",
      "Ingénieur account dédié",
      "Support 24/7 pour les incidents critiques",
    ],
    cta: "Nous contacter",
  },
];

export function BusinessProductsServicesPage() {
  const { navigate } = useRouter();

  return (
    <>
      <PageBanner
        title="Produits & Services pour entreprises"
        subtitle="De la fibre professionnelle aux solutions multisites, Liquid Home équipe votre TPE, PME ou grand compte avec une connectivité sur-mesure, un SLA garanti et un support prioritaire dédié."
      >
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => navigate("/contact")}
            className="btn-brand inline-flex"
          >
            Nous contacter
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate("/business")}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-6 py-3 rounded-md transition-colors"
          >
            <Building2 className="h-4 w-4" />
            Découvrir l'univers PME
          </button>
        </div>
      </PageBanner>

      {/* Key commitments band */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { value: "99,9 %", label: "SLA de disponibilité garanti" },
            { value: "4h", label: "Intervention sur site ouvrées" },
            { value: "1 Gbps", label: "Débit symétrique professionnel" },
            { value: "24/7", label: "Support incidents critiques" },
          ].map((s, i) => (
            <div key={i} className="bg-brand-soft rounded-xl px-4 py-6">
              <div className="text-3xl font-extrabold text-brand-navy mb-1">{s.value}</div>
              <div className="text-sm text-brand-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Business services grid */}
      <section className="py-16 bg-brand-soft">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
              <Building2 className="h-3.5 w-3.5" />
              Petite et Moyenne Enterprise
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-2">
              Nos solutions professionnelles
            </h2>
            <p className="text-brand-muted max-w-2xl mx-auto">
              Une suite complète de produits et services pour connecter, sécuriser
              et faire grandir votre entreprise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BUSINESS_SERVICES.map((service, i) => {
              const Icon = service.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow p-7 flex flex-col relative overflow-hidden"
                >
                  <div className="absolute -right-4 -top-5 text-7xl font-extrabold text-brand-navy/5 select-none">
                    0{i + 1}
                  </div>
                  {service.comingSoon && (
                    <span className="absolute top-5 right-5 bg-brand-orange/10 text-brand-orange text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
                      Bientôt
                    </span>
                  )}
                  <div className="h-12 w-12 rounded-xl bg-brand-orange/10 flex items-center justify-center mb-5">
                    <Icon className="h-6 w-6 text-brand-orange" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-2">{service.title}</h3>
                  <p className="text-sm text-brand-muted leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mb-6 mt-auto">
                    {service.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-brand-navy">
                        <CheckCircle2 className="h-4 w-4 text-brand-orange flex-shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate("/contact")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:gap-3 transition-all"
                  >
                    {service.cta}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Packages CTA band */}
      <section className="bg-gradient-to-r from-brand-navy to-brand-navy-light text-white py-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
              <Rocket className="h-3.5 w-3.5" />
              Forfaits fibre entreprise
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Un forfait adapté à la taille de votre entreprise
            </h2>
            <p className="text-white/85">
              Comparez nos forfaits fibre et choisissez la puissance dont votre
              activité a besoin — notre équipe reste à votre écoute pour toute
              configuration sur-mesure.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <button
              onClick={() => navigate("/packages")}
              className="bg-white text-brand-navy font-bold uppercase px-6 py-3 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              Voir les forfaits
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/souscrire")}
              className="bg-brand-orange text-white font-bold uppercase px-6 py-3 rounded-md hover:bg-brand-orange-hover transition-colors"
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
