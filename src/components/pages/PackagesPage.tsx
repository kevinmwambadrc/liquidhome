"use client";

import { PageBanner } from "@/components/sections/PageBanner";
import { Newsletter } from "@/components/sections/Newsletter";
import { useRouter } from "@/lib/router";
import { PACKAGES } from "@/lib/content";
import { Check, ArrowRight, Zap, Crown, Star, Wifi, Infinity as InfinityIcon, Rocket, Tv, Router as RouterIcon, Shield } from "lucide-react";

export function PackagesPage() {
  const { navigate, setSignupPackage } = useRouter();

  const onSelect = (id: string) => {
    setSignupPackage(id);
    navigate("signup");
  };

  return (
    <>
      <PageBanner
        title="Libota"
        subtitle="À la maison ou au travail, lorsque vous avez besoin d'interagir, de naviguer, de diffuser ou de télécharger, Liquid Home est la réponse, ultra rapide, illimitée et abordable."
      />

      {/* Pricing cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
              <Zap className="h-3.5 w-3.5" />
              Nos forfaits fibre
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-2">
              Choisissez votre Libota
            </h2>
            <p className="text-brand-muted">
              Tous nos forfaits incluent l'installation gratuite et des données illimitées
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onSelect={() => onSelect(pkg.id)} />
            ))}
          </div>

          {/* Comparison table */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-brand-navy mb-6 text-center">
              Comparatif détaillé
            </h3>
            <div className="overflow-x-auto scroll-area-brand rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-navy text-white">
                    <th className="text-left px-4 py-3 font-semibold">Caractéristique</th>
                    {PACKAGES.map((p) => (
                      <th key={p.id} className="text-center px-4 py-3 font-semibold">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <CompareRow label="Prix mensuel" values={PACKAGES.map((p) => `${p.currency} ${p.price}`)} />
                  <CompareRow label="Débit" values={PACKAGES.map((p) => p.speed)} highlight />
                  <CompareRow label="Volume de données" values={PACKAGES.map((p) => p.volume)} />
                  <CompareRow label="Frais d'installation" values={PACKAGES.map((p) => p.install)} />
                  <CompareRow label="Mise en service" values={PACKAGES.map((p) => p.setup)} />
                  <CompareRow label="Streaming HD simultané" values={PACKAGES.map((p) => p.streams)} />
                  <CompareRow label="Routeur (option)" values={PACKAGES.map((p) => p.router)} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Trust band */}
      <section className="bg-brand-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <TrustItem icon={Shield} label="Sans engagement" sub="Annulez à tout moment" />
          <TrustItem icon={InfinityIcon} label="Données illimitées" sub="Aucune limite de volume" />
          <TrustItem icon={Rocket} label="Installation rapide" sub="Sous 5 jours ouvrés" />
          <TrustItem icon={Wifi} label="Réseau 24/7" sub="Surveillance permanente" />
        </div>
      </section>

      <Newsletter />
    </>
  );
}

function PackageCard({
  pkg,
  onSelect,
}: {
  pkg: (typeof PACKAGES)[number];
  onSelect: () => void;
}) {
  const Icon =
    pkg.id === "libota-flex" ? Wifi : pkg.id === "libota-super" ? Star : Crown;

  return (
    <div
      className={`package-card relative rounded-2xl overflow-hidden bg-white border-2 ${
        pkg.highlighted ? "border-brand-orange shadow-xl" : "border-gray-100 shadow-sm"
      }`}
    >
      {pkg.badge && (
        <div
          className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
            pkg.highlighted ? "bg-brand-orange text-white" : "bg-brand-navy text-white"
          }`}
        >
          {pkg.badge}
        </div>
      )}

      {/* Header */}
      <div
        className={`p-6 text-center ${
          pkg.highlighted ? "bg-brand-orange text-white" : "bg-brand-navy text-white"
        }`}
      >
        <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-white/15 flex items-center justify-center">
          <Icon className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold">{pkg.name}</h3>
      </div>

      {/* Price */}
      <div className="p-6 text-center border-b border-gray-100">
        <div className="flex items-end justify-center gap-1">
          <span className="text-sm font-semibold text-brand-muted">
            {pkg.currency}
          </span>
          <span className="text-5xl font-extrabold text-brand-orange">
            {pkg.price}
          </span>
          <span className="text-sm text-brand-muted mb-2">/mois</span>
        </div>
        <p className="text-xs text-brand-muted mt-1 uppercase tracking-wide">
          {pkg.speed}
        </p>
      </div>

      {/* Features */}
      <div className="p-6">
        <ul className="space-y-3 mb-6">
          {pkg.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-brand-navy">
              <Check className="h-4 w-4 text-brand-orange flex-shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
          <li className="flex items-start gap-2 text-sm text-brand-navy">
            <Tv className="h-4 w-4 text-brand-orange flex-shrink-0 mt-0.5" />
            <span>{pkg.streams}</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-brand-navy">
            <RouterIcon className="h-4 w-4 text-brand-orange flex-shrink-0 mt-0.5" />
            <span>{pkg.router}</span>
          </li>
        </ul>

        <button
          onClick={onSelect}
          className={`btn-brand btn-brand-block btn-brand-lg ${
            pkg.highlighted ? "" : "bg-brand-navy hover:bg-brand-navy-light border-brand-navy"
          }`}
        >
          Souscrire
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  values,
  highlight,
}: {
  label: string;
  values: string[];
  highlight?: boolean;
}) {
  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-3 font-medium text-brand-navy bg-gray-50">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`px-4 py-3 text-center ${
            highlight ? "font-bold text-brand-orange" : "text-brand-muted"
          }`}
        >
          {v}
        </td>
      ))}
    </tr>
  );
}

function TrustItem({
  icon: Icon,
  label,
  sub,
}: {
  icon: typeof Shield;
  label: string;
  sub: string;
}) {
  return (
    <div>
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-brand-orange flex items-center justify-center">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <p className="font-semibold">{label}</p>
      <p className="text-white/70 text-xs mt-0.5">{sub}</p>
    </div>
  );
}
