import {
  Home,
  Building2,
  Package,
  Phone,
  HelpCircle,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Send,
  Trophy,
  ShieldCheck,
  CalendarClock,
  Headphones,
  Wifi,
  Gauge,
  Infinity as InfinityIcon,
  Rocket,
  Tv,
  Router as RouterIcon,
  CheckCircle2,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Domicile", route: "home" as const, icon: Home },
  { label: "Produits & Services", route: "products-and-services" as const, icon: Package },
  { label: "Contact", route: "contact-us" as const, icon: Phone },
];

export const SITE_TYPE_OPTIONS = [
  { id: "home" as const, label: "Domicile", labelEn: "Home", icon: Home },
  { id: "business" as const, label: "Petite et Moyenne Enterprise", labelEn: "Small & Medium Enterprise", icon: Building2 },
];

export const CONTACT_INFO = {
  shortPhone: "4757",
  fullPhone: "+243 90 300 39 00",
  whatsapp: "+243 811 023 222",
  whatsappChat: "https://wa.me/243903003900",
  whatsappChannel: "https://whatsapp.com/channel/0029VaCeVwcJUM2TUWbZIG1U",
  email: "DRCfibre@liquid.tech",
  website: "https://cd.liquidhome.tech",
  hoursWeekday: "8h à 22h",
  hoursWeekend: "9h à 21h",
  city: "Kinshasa, RDC",
  currency: "USD",
};

export const SOCIAL_LINKS = [
  { label: "Facebook", url: "https://www.facebook.com/LiquidHomeDRC", icon: Facebook },
  { label: "X (Twitter)", url: "https://www.x.com/liquidhomedrc", icon: Twitter },
  { label: "Instagram", url: "https://instagram.com/liquidhome.rdc", icon: Instagram },
  { label: "WhatsApp Channel", url: "https://whatsapp.com/channel/0029VaCeVwcJUM2TUWbZIG1U", icon: Send },
  { label: "WhatsApp Chat", url: "https://wa.me/243903003900", icon: MessageCircle },
];

export interface PackagePlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  speed: string;
  volume: string;
  install: string;
  setup: string;
  streams: string;
  router: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export const PACKAGES: PackagePlan[] = [
  {
    id: "libota-flex",
    name: "Libota Flex",
    price: 49,
    currency: "USD",
    speed: "Jusqu'à 75 Mbps",
    volume: "Illimités",
    install: "Pas de frais",
    setup: "Mise en service rapide",
    streams: "5 streaming HD simultanés",
    router: "Routeur USD 26",
    features: [
      "Idéal pour les petits foyers",
      "Streaming HD sur 5 appareils",
      "Installation gratuite",
      "Routeur en option : USD 26",
    ],
    badge: "Essentiel",
  },
  {
    id: "libota-super",
    name: "Libota Super",
    price: 89,
    currency: "USD",
    speed: "Jusqu'à 200 Mbps",
    volume: "Illimités",
    install: "Pas de frais",
    setup: "Mise en service rapide",
    streams: "10 streaming HD simultanés",
    router: "Routeur USD 11",
    features: [
      "Parfait pour familles connectées",
      "Streaming HD sur 10 appareils",
      "Installation gratuite",
      "Routeur en option : USD 11",
    ],
    highlighted: true,
    badge: "Populaire",
  },
  {
    id: "libota-ultra",
    name: "Libota Ultra",
    price: 149,
    currency: "USD",
    speed: "Jusqu'à 300 Mbps",
    volume: "Illimités",
    install: "Pas de frais",
    setup: "Mise en service rapide",
    streams: "20 streaming HD simultanés",
    router: "Routeur USD 1",
    features: [
      "Performances maximales",
      "Streaming HD sur 20 appareils",
      "Installation gratuite",
      "Routeur en option : USD 1",
    ],
    badge: "Premium",
  },
];

export const WHY_CHOOSE_REASONS = [
  {
    title: "Connectivité internet ultra-rapide",
    description: "Profitez d'une vitesse de fibre optique inégalée pour toute la maison, sans compromis.",
    icon: Trophy,
  },
  {
    title: "Réseau sécurisé et fiable",
    description: "Une infrastructure de pointe, surveillée 24/7 pour une connexion toujours disponible.",
    icon: ShieldCheck,
  },
  {
    title: "Des durées de contrat qui vous conviennent",
    description: "Choisissez la flexibilité : engagements adaptés à vos besoins et votre budget.",
    icon: CalendarClock,
  },
  {
    title: "Equipe d'assistance dédiée",
    description: "Un support client local basé à Kinshasa, joignable du lundi au dimanche.",
    icon: Headphones,
  },
];

export const HOME_CTAS = [
  { label: "Souscrire", route: "signup" as const, icon: Rocket, primary: true },
  { label: "Produits & Services", route: "products-and-services" as const, icon: Package, primary: false },
  { label: "Besoin d'aide?", route: "contact-us" as const, icon: HelpCircle, primary: false },
];

export const BUSINESS_SIDEBARS = [
  {
    title: "Connectivité illimitée",
    description:
      "Nous ne proposons pas seulement une connexion Internet, mais une expérience de vie numérique exceptionnelle pour toute votre famille.",
    icon: InfinityIcon,
  },
  {
    title: "Évolution Constante",
    description:
      "Nous évoluons constamment pour répondre à vos besoins, offrant des vitesses et des volumes de forfait Internet qui repoussent les limites.",
    icon: Gauge,
  },
  {
    title: "Expertise Technique",
    description:
      "Notre équipe d'experts est dédiée à vous offrir une installation sans tracas et à vous guider à chaque étape.",
    icon: Wifi,
  },
];

export const BANNERS = [
  {
    id: 1,
    src: "/img/banners/cd/banner001.jpg",
    alt: "Votre connexion sans interruption partout chez vous",
    overlay: {
      lines: [
        { text: "VOTRE CONNEXION", color: "orange" },
        { text: "SANS INTERRUPTION", color: "navy" },
        { text: "& PARTOUT CHEZ VOUS", color: "orange" },
      ],
      position: "left",
    },
  },
  {
    id: 2,
    src: "/img/banners/cd/banner002.jpg",
    alt: "Liquid Home, Leader de la Fibre en RDC",
    overlay: {
      lines: [
        { text: "Liquid home,", color: "navy" },
        { text: "Leader de la Fibre en RDC", color: "orange" },
      ],
      sublines: [
        "Passez en mode Fibre & faites vivre votre maison !",
        "Meilleure connexion, meilleure sensation !",
      ],
      hashtag: "#NETtement Mieux",
      position: "left",
    },
  },
  {
    id: 3,
    src: "/img/banners/cd/banner003.jpg",
    alt: "Passez en mode Fibre",
    overlay: {
      lines: [
        { text: "WELCOME", color: "orange" },
        { text: "BIENVENUE", color: "navy" },
      ],
      sublines: [
        "Passez en mode Fibre & faites vivre votre maison !",
        "Meilleure connexion, meilleure sensation !",
      ],
      hashtag: "#NETtement Mieux",
      footer: "Liquid home, Leader de la Fibre en RDC !",
      position: "center",
    },
  },
  {
    id: 4,
    src: "/img/banners/cd/banner004.jpg",
    alt: "La Fibre LIQUID HOME, plus qu'une connexion internet",
    overlay: {
      lines: [
        { text: "La Fibre LIQUID HOME,", color: "navy" },
        { text: "Plus qu'une simple", color: "orange" },
        { text: "CONNEXION INTERNET", color: "orange" },
      ],
      sublines: ["Service client : 4757", "DRCfibre@liquid.tech"],
      position: "left",
    },
  },
];

export const SERVICE_OPTIONS = [
  {
    id: "internet-packages",
    title: "Forfaits internet",
    description: "Ultra - rapide, illimitée et imbattable",
    cta: "Découvrez plus",
    route: "packages" as const,
    icon: Wifi,
    color: "navy",
  },
  {
    id: "mobile-data",
    title: "Données mobiles",
    description: "Restez connecté en mobilité avec nos forfaits data flexibles",
    cta: "Bientôt disponible",
    route: "products-and-services" as const,
    icon: Tv,
    color: "orange",
    comingSoon: true,
  },
  {
    id: "devices",
    title: "Équipements & Routeurs",
    description: "Routeurs Wi-Fi dernière génération pour une couverture optimale",
    cta: "En savoir plus",
    route: "packages" as const,
    icon: RouterIcon,
    color: "navy",
  },
  {
    id: "support",
    title: "Support dédié",
    description: "Une équipe d'experts à votre écoute, 7j/7 pour vous accompagner",
    cta: "Nous contacter",
    route: "contact-us" as const,
    icon: Headphones,
    color: "orange",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    title: "Vérifier la couverture",
    description: "Vérifier que vous êtes dans une zone couverte par notre réseau fibre.",
  },
  {
    title: "Commander en ligne",
    description: "Commander votre bouquet en ligne et payer directement.",
  },
  {
    title: "Installation rapide",
    description: "Patienter jusqu'à 5 jours ouvrés pour l'installation par nos techniciens.",
  },
  {
    title: "Service client 4757",
    description: "Appelez le service client au 4757 pour toute préoccupation.",
  },
];

export const STATS = [
  { value: "100%", label: "Fibre optique" },
  { value: "300", label: "Mbps max" },
  { value: "24/7", label: "Support local" },
  { value: "5j", label: "Installation" },
];

export const FAQ_ITEMS = [
  {
    question: "Comment vérifier si Liquid Home est disponible dans ma zone ?",
    answer:
      "Utilisez le formulaire de vérification de disponibilité en haut de chaque page. Entrez votre adresse et le numéro de votre maison pour savoir instantanément si la fibre Liquid Home vous est accessible.",
  },
  {
    question: "Quels sont les délais d'installation ?",
    answer:
      "L'installation est généralement effectuée dans un délai de 5 jours ouvrés après la signature de votre contrat. Nos techniciens se déplacent gratuitement chez vous à Kinshasa.",
  },
  {
    question: "Les forfaits Libota sont-ils vraiment illimités ?",
    answer:
      "Oui, tous nos forfaits Libota (Flex, Super et Ultra) offrent un volume de données illimité. Vous pouvez streamer, télécharger et jouer sans vous soucier de votre consommation.",
  },
  {
    question: "Quel forfait choisir pour ma famille ?",
    answer:
      "Pour 1 à 3 appareils, Libota Flex (75 Mbps) suffit. Pour une famille de 4 à 6 personnes connectées, Libota Super (200 Mbps) est idéal. Pour les gros foyers ou les usages intensifs (gaming, 4K), optez pour Libota Ultra (300 Mbps).",
  },
  {
    question: "Puis-je payer en Francs Congolais (CDF) ?",
    answer:
      "Nos prix sont affichés en USD pour des raisons de stabilité. Le paiement peut être effectué en USD ou en CDF au taux de change en vigueur auprès de nos agents agréés.",
  },
  {
    question: "Comment contacter le service client ?",
    answer:
      "Appelez le 4757 (gratuit) ou le +243 90 300 39 00, du lundi au vendredi de 8h à 22h, et le week-end de 9h à 21h. Vous pouvez aussi nous écrire sur WhatsApp au +243 811 023 222.",
  },
];

export const COVERAGE_AREAS = [
  "Gombe",
  "Ngaliema",
  "Lemba",
  "Limete",
  "Kintambo",
  "Bandalungwa",
  "Kasa-Vubu",
  "BKinshasa Centre",
  "Ngiri-Ngiri",
  "Selembao",
  "Bumbu",
  "Makala",
];

export const LEGAL_LINKS = [
  { label: "Politique de confidentialité", route: "privacy-policy" as const },
  { label: "Politique des cookies", route: "cookies-policy" as const },
  { label: "Utilisation", route: "usage" as const },
  { label: "Termes et conditions", route: "terms-and-conditions" as const },
];
