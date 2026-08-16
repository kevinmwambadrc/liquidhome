"use client";

import { PageBanner } from "@/components/sections/PageBanner";
import { useRouter, Route } from "@/lib/router";
import { ShieldCheck, Cookie, FileText, BookOpen, Lock } from "lucide-react";

const LEGAL_CONTENT: Record<
  string,
  { title: string; icon: typeof ShieldCheck; sections: { heading: string; body: string }[] }
> = {
  "privacy-policy": {
    title: "Politique de confidentialité",
    icon: ShieldCheck,
    sections: [
      {
        heading: "1. Introduction",
        body: "Liquid Home RDC, filiale de Liquid Intelligent Technologies, s'engage à protéger la vie privée de ses utilisateurs. Cette politique décrit comment nous collectons, utilisons et protégeons vos données personnelles conformément à la législation en vigueur en République Démocratique du Congo.",
      },
      {
        heading: "2. Données collectées",
        body: "Nous collectons : votre nom, prénom, adresse email, numéro de téléphone, adresse d'installation, données de géolocalisation (lors de la vérification de couverture), données de consommation internet et informations de paiement. Ces données sont nécessaires à la fourniture de nos services fibre optique.",
      },
      {
        heading: "3. Utilisation des données",
        body: "Vos données servent à : fournir et maintenir votre connexion internet, traiter vos paiements, vous assister techniquement, vous informer des offres et mises à jour, respecter les obligations légales et réglementaires.",
      },
      {
        heading: "4. Conservation des données",
        body: "Vos données sont conservées pendant toute la durée de votre abonnement et jusqu'à 5 ans après la fin de la relation contractuelle, conformément aux obligations légales de conservation.",
      },
      {
        heading: "5. Partage avec des tiers",
        body: "Nous ne vendons jamais vos données. Nous les partageons uniquement avec nos partenaires techniques (installateurs, fournisseurs d'équipements) dans la mesure strictement nécessaire au service, et avec les autorités si la loi l'exige.",
      },
      {
        heading: "6. Vos droits",
        body: "Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à DRCfibre@liquid.tech ou au 4757.",
      },
      {
        heading: "7. Sécurité",
        body: "Nous mettons en œuvre des mesures techniques et organisationnelles (chiffrement, accès restreint, audits) pour protéger vos données contre tout accès non autorisé ou fraude.",
      },
    ],
  },
  "cookies-policy": {
    title: "Politique des cookies",
    icon: Cookie,
    sections: [
      {
        heading: "1. Qu'est-ce qu'un cookie ?",
        body: "Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d'un site web. Il permet de mémoriser des informations relatives à votre navigation.",
      },
      {
        heading: "2. Cookies utilisés",
        body: "Nous utilisons des cookies essentiels (session, sécurité), des cookies de performance (Google Analytics pour mesurer l'audience de manière anonyme) et des cookies fonctionnels (mémorisation de votre langue et type de site).",
      },
      {
        heading: "3. Gestion des cookies",
        body: "Vous pouvez à tout moment configurer votre navigateur pour accepter, refuser ou supprimer les cookies. Le refus des cookies essentiels peut altérer le fonctionnement du site.",
      },
      {
        heading: "4. Cookies tiers",
        body: "Des cookies tiers (réseaux sociaux, outils de chat) peuvent être déposés. Ces tiers sont soumis à leurs propres politiques de confidentialité.",
      },
    ],
  },
  usage: {
    title: "Utilisation acceptable",
    icon: BookOpen,
    sections: [
      {
        heading: "1. Objet",
        body: "Cette politique définit les règles d'utilisation acceptable du service internet Liquid Home RDC afin de garantir une expérience optimale à tous les abonnés.",
      },
      {
        heading: "2. Usages interdits",
        body: "Sont interdits : l'envoi massif de emails non sollicités (spam), le téléchargement ou la diffusion de contenus illégaux, les attaques contre des réseaux ou systèmes, l'hébergement de serveurs publics sans autorisation, la revente du service sans accord écrit.",
      },
      {
        heading: "3. Gestion du trafic",
        body: "Liquid Home applique une gestion raisonnable du trafic pour éviter la congestion : priorisation des usages interactifs (voix, vidéo, navigation) pendant les pics de consommation.",
      },
      {
        heading: "4. Sécurité",
        body: "Vous êtes responsable de la sécurisation de votre réseau local (mot de passe Wi-Fi, pare-feu). Liquid Home n'est pas responsable des accès non autorisés à votre réseau.",
      },
      {
        heading: "5. Sanctions",
        body: "Tout manquement peut entraîner la suspension ou la résiliation du service, sans préjudice des poursuites légales applicables.",
      },
    ],
  },
  "terms-and-conditions": {
    title: "Termes et conditions",
    icon: FileText,
    sections: [
      {
        heading: "1. Acceptation des termes",
        body: "En souscrivant aux services Liquid Home RDC, vous acceptez sans réserve les présents termes et conditions. Si vous n'êtes pas d'accord, veuillez ne pas utiliser nos services.",
      },
      {
        heading: "2. Description du service",
        body: "Liquid Home fournit un accès internet par fibre optique (FTTH) avec un débit et un volume définis selon le forfait Libota souscrit. Le débit maximal dépend de la distance et de l'état du réseau jusqu'à votre domicile.",
      },
      {
        heading: "3. Tarification et paiement",
        body: "Les prix sont en USD. Le paiement est mensuel, d'avance. Une pénalité de 5% est appliquée en cas de retard supérieur à 5 jours. Le service est suspendu après 15 jours d'impayé.",
      },
      {
        heading: "4. Installation",
        body: "L'installation est gratuite dans les zones couvertes. Le délai d'installation est de 5 jours ouvrés. Le client doit autoriser l'accès à son domicile pour le passage des câbles.",
      },
      {
        heading: "5. Durée et résiliation",
        body: "Les forfaits sont sans engagement. La résiliation prend effet en fin de période payée. Un préavis de 7 jours est demandé. Les frais d'installation ne sont pas remboursables.",
      },
      {
        heading: "6. Responsabilité",
        body: "Liquid Home n'est pas responsable des interruptions causées par des cas de force majeure, des travaux tiers ou une coupure d'électricité. Notre engagement de disponibilité est de 99,5% sur un mois.",
      },
      {
        heading: "7. Loi applicable",
        body: "Les présents termes sont régis par le droit congolais. Tout litige relève des tribunaux de Kinshasa/Gombe.",
      },
    ],
  },
};

export function LegalPage({ route }: { route: Route }) {
  const { navigate } = useRouter();
  const content = LEGAL_CONTENT[route];
  if (!content) return null;
  const Icon = content.icon;

  return (
    <>
      <PageBanner title={content.title} subtitle="Dernière mise à jour : Janvier 2026" />

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            {/* Sidebar nav */}
            <aside>
              <div className="rounded-lg border border-gray-200 overflow-hidden sticky top-24">
                <div className="bg-brand-navy text-white px-4 py-3">
                  <h3 className="font-bold text-sm uppercase">Documents</h3>
                </div>
                <nav className="p-2 bg-white">
                  {Object.entries(LEGAL_CONTENT).map(([key, c]) => {
                    const LIcon = c.icon;
                    const active = route === key;
                    return (
                      <button
                        key={key}
                        onClick={() => navigate(key as Route)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-left transition-colors ${
                          active
                            ? "bg-orange-50 text-brand-orange font-semibold"
                            : "text-brand-navy hover:bg-gray-50"
                        }`}
                      >
                        <LIcon className="h-4 w-4 flex-shrink-0" />
                        {c.title}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <article className="prose prose-sm max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-brand-orange" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-brand-navy m-0">
                  {content.title}
                </h1>
              </div>

              <div className="space-y-6">
                {content.sections.map((s, i) => (
                  <div key={i}>
                    <h2 className="text-lg font-bold text-brand-navy mb-2">{s.heading}</h2>
                    <p className="text-brand-muted leading-relaxed">{s.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-brand-soft rounded-lg flex items-start gap-3">
                <Lock className="h-5 w-5 text-brand-orange flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-brand-navy mb-1">
                    Une question sur ce document ?
                  </p>
                  <p className="text-brand-muted">
                    Contactez-nous à{" "}
                    <a href="mailto:DRCfibre@liquid.tech" className="text-brand-orange hover:underline">
                      DRCfibre@liquid.tech
                    </a>{" "}
                    ou au 4757.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
