"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PageBanner } from "@/components/sections/PageBanner";
import { Newsletter } from "@/components/sections/Newsletter";
import { useRouter } from "@/lib/router";
import {
  Check,
  ArrowRight,
  Zap,
  Crown,
  Star,
  Wifi,
  Infinity as InfinityIcon,
  Rocket,
  Shield,
  Router as RouterIcon,
  WifiOff,
  BatteryCharging,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { BuyEquipmentModal, type BuyItem } from "@/components/widgets/BuyEquipmentModal";
import { ShoppingCart } from "lucide-react";

interface DbPackage {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  speed: string;
  volume: string;
  features: string[];
  badge: string | null;
  highlighted: boolean;
}

interface DbEquipment {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string | null;
}

const EQUIP_ICONS: Record<string, typeof RouterIcon> = {
  router: RouterIcon,
  extender: WifiOff,
  powerbank: BatteryCharging,
};

export function PackagesPage() {
  const { navigate, setSignupPackage, language, t } = useRouter();
  const [packages, setPackages] = useState<DbPackage[] | null>(null);
  const [equipments, setEquipments] = useState<DbEquipment[]>([]);
  const [buyItem, setBuyItem] = useState<BuyItem | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);

  useEffect(() => {
    fetch("/api/packages", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPackages(d.packages ?? []))
      .catch(() => setPackages([]));
    fetch("/api/equipments", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEquipments(d.equipments ?? []))
      .catch(() => setEquipments([]));
  }, []);

  const onSelect = (slug: string) => {
    setSignupPackage(slug);
    navigate("/souscrire");
  };

  const byCategory = (cat: string) => equipments.filter((e) => e.category === cat);

  return (
    <>
      <PageBanner
        title="Libota"
        subtitle={
          language === "en"
            ? "At home or at work, when you need to interact, browse, stream or download, Liquid Home is the answer — ultra fast, unlimited and affordable."
            : "À la maison ou au travail, lorsque vous avez besoin d'interagir, de naviguer, de diffuser ou de télécharger, Liquid Home est la réponse, ultra rapide, illimitée et abordable."
        }
      />

      {/* Pricing cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
              <Zap className="h-3.5 w-3.5" />
              {language === "en" ? "Our fiber plans" : "Nos forfaits fibre"}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-2">
              {language === "en" ? "Choose your Libota" : "Choisissez votre Libota"}
            </h2>
            <p className="text-brand-muted">
              {language === "en"
                ? "All plans include free installation and unlimited data"
                : "Tous nos forfaits incluent l'installation gratuite et des données illimitées"}
            </p>
          </div>

          {packages === null ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
              style={{ gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))` }}
            >
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  language={language}
                  subscribeLabel={t("packages.subscribe")}
                  onSelect={() => onSelect(pkg.slug)}
                />
              ))}
            </div>
          )}

          {/* Comparison table */}
          {packages && packages.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-brand-navy mb-6 text-center">
                {t("packages.compare")}
              </h3>
              <div className="overflow-x-auto scroll-area-brand rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-navy text-white">
                      <th className="text-left px-4 py-3 font-semibold">
                        {language === "en" ? "Feature" : "Caractéristique"}
                      </th>
                      {packages.map((p) => (
                        <th key={p.id} className="text-center px-4 py-3 font-semibold">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <CompareRow
                      label={language === "en" ? "Monthly price" : "Prix mensuel"}
                      values={packages.map((p) => `${p.currency} ${p.price}`)}
                    />
                    <CompareRow
                      label={language === "en" ? "Speed" : "Débit"}
                      values={packages.map((p) => p.speed)}
                      highlight
                    />
                    <CompareRow
                      label={language === "en" ? "Data volume" : "Volume de données"}
                      values={packages.map((p) => p.volume)}
                    />
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Equipment section */}
      <section className="py-14 bg-brand-soft/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3">
              <RouterIcon className="h-3.5 w-3.5" />
              {t("packages.equipTitle")}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">{t("packages.equipSub")}</h2>
          </div>

          <div className="space-y-10">
            {(["router", "extender", "powerbank"] as const).map((cat) => {
              const items = byCategory(cat);
              if (items.length === 0) return null;
              const Icon = EQUIP_ICONS[cat];
              const catLabel =
                cat === "router"
                  ? t("packages.catRouter")
                  : cat === "extender"
                    ? t("packages.catExtender")
                    : t("packages.catPowerbank");
              return (
                <div key={cat}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 rounded-xl bg-brand-navy flex items-center justify-center text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy">{catLabel}</h3>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((eq, i) => (
                      <motion.div
                        key={eq.id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="relative h-20 w-20 rounded-xl bg-brand-soft flex-shrink-0 overflow-hidden">
                          {eq.imageUrl ? (
                            <Image src={eq.imageUrl} alt={eq.name} fill className="object-cover" sizes="80px" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Icon className="h-9 w-9 text-brand-navy" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex flex-col">
                          <h4 className="font-bold text-brand-navy leading-tight">{eq.name}</h4>
                          <p className="text-xs text-brand-muted mt-1 line-clamp-3">{eq.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-extrabold text-brand-orange">{eq.price} USD</span>
                            <span className="text-[10px] uppercase tracking-wide text-brand-muted bg-brand-soft px-2 py-0.5 rounded-full">
                              {t("packages.option")}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setBuyItem({ slug: eq.slug, name: eq.name, price: eq.price });
                              setBuyOpen(true);
                            }}
                            className="btn-brand text-xs px-4 py-2 mt-3 w-full"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            {language === "en" ? "Buy" : "Acheter"}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust band */}
      <section className="bg-brand-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <TrustItem icon={Shield} label={language === "en" ? "No commitment" : "Sans engagement"} sub={language === "en" ? "Cancel anytime" : "Annulez à tout moment"} />
          <TrustItem icon={InfinityIcon} label={language === "en" ? "Unlimited data" : "Données illimitées"} sub={language === "en" ? "No volume cap" : "Aucune limite de volume"} />
          <TrustItem icon={Rocket} label={language === "en" ? "Fast installation" : "Installation rapide"} sub={language === "en" ? "Within 5 working days" : "Sous 5 jours ouvrés"} />
          <TrustItem icon={Wifi} label={language === "en" ? "24/7 network" : "Réseau 24/7"} sub={language === "en" ? "Permanent monitoring" : "Surveillance permanente"} />
        </div>
      </section>

      <Newsletter />

      <BuyEquipmentModal open={buyOpen} onOpenChange={setBuyOpen} item={buyItem} />
    </>
  );
}

function PackageCard({
  pkg,
  language,
  subscribeLabel,
  onSelect,
}: {
  pkg: DbPackage;
  language: "fr" | "en";
  subscribeLabel: string;
  onSelect: () => void;
}) {
  const Icon = pkg.slug.includes("flex") ? Wifi : pkg.slug.includes("super") ? Star : Crown;

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
          <span className="text-sm font-semibold text-brand-muted">{pkg.currency}</span>
          <span className="text-5xl font-extrabold text-brand-orange">{pkg.price}</span>
          <span className="text-sm text-brand-muted mb-2">
            {language === "en" ? "/month" : "/mois"}
          </span>
        </div>
        <p className="text-xs text-brand-muted mt-1 uppercase tracking-wide">{pkg.speed}</p>
      </div>

      {/* Features */}
      <div className="p-6 flex flex-col h-full">
        <ul className="space-y-3 mb-6">
          {pkg.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-brand-navy">
              <Check className="h-4 w-4 text-brand-orange flex-shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {pkg.highlighted ? (
          <button onClick={onSelect} className="btn-brand btn-brand-block btn-brand-lg mt-auto">
            {subscribeLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={onSelect} className="btn-navy w-full py-3.5 mt-auto">
            {subscribeLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
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
