// Seed catalog content: packages, equipment, blog posts (info + tutos).
// Idempotent: upserts by slug. Run with: node scripts/seed-content.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PACKAGES = [
  {
    slug: "libota-flex",
    name: "Libota Flex",
    price: 49,
    speed: "Jusqu'à 75 Mbps",
    badge: "Essentiel",
    features: JSON.stringify([
      "Idéal pour les petits foyers",
      "Streaming HD sur 5 appareils",
      "Installation gratuite",
      "Routeur en option : USD 26",
    ]),
    sortOrder: 1,
  },
  {
    slug: "libota-super",
    name: "Libota Super",
    price: 89,
    speed: "Jusqu'à 200 Mbps",
    badge: "Populaire",
    highlighted: true,
    features: JSON.stringify([
      "Parfait pour familles connectées",
      "Streaming HD sur 10 appareils",
      "Installation gratuite",
      "Routeur en option : USD 11",
    ]),
    sortOrder: 2,
  },
  {
    slug: "libota-ultra",
    name: "Libota Ultra",
    price: 149,
    speed: "Jusqu'à 300 Mbps",
    badge: "Premium",
    features: JSON.stringify([
      "Performances maximales",
      "Streaming HD sur 20 appareils",
      "Installation gratuite",
      "Routeur en option : USD 1",
    ]),
    sortOrder: 3,
  },
];

const EQUIPMENT = [
  {
    slug: "routeur-wifi-6",
    name: "Routeur Wi-Fi 6",
    category: "router",
    price: 26,
    description: "Routeur double bande Wi-Fi 6 pour une couverture optimale de votre domicile jusqu'à 150 m².",
    sortOrder: 1,
  },
  {
    slug: "repeteur-wifi-mesh",
    name: "Extendeur Wi-Fi (Répéteur Mesh)",
    category: "extender",
    price: 19,
    description: "Étendez la portée de votre Wi-Fi dans chaque pièce. Système mesh auto-synchronisé, installation en 1 clic.",
    sortOrder: 2,
  },
  {
    slug: "powerbank-20000",
    name: "Powerbank 20 000 mAh",
    category: "powerbank",
    price: 35,
    description: "Restez connecté même pendant les coupures d'électricité : 20 000 mAh, 2 ports USB + USB-C rapide.",
    sortOrder: 3,
  },
];

const POSTS = [
  {
    slug: "bienvenue-fibre-liquid-home",
    title: "Bienvenue sur la fibre Liquid Home",
    category: "info",
    excerpt: "Découvrez notre réseau 100% fibre optique à Kinshasa et ce qu'il change pour votre quotidien.",
    coverImage: "/img/banners/cd/banner002.jpg",
    content: JSON.stringify([
      { type: "paragraph", text: "Liquid Home déploie depuis 2023 un réseau 100% fibre optique (FTTH) dans les principales communes de Kinshasa. Contrairement aux technologies sans fil, la fibre offre une vitesse stable, une latence minimale et un débit identique en upload et en download." },
      { type: "heading", text: "Pourquoi la fibre change tout" },
      { type: "paragraph", text: "Streaming 4K sans mise en mémoire tampon, visioconférences fluides, gaming compétitif et télétravail : la fibre transforme votre expérience internet. Et avec nos forfaits Libota, le volume est illimité — sans surprise sur la facture." },
      { type: "image", url: "/img/banners/cd/banner003.jpg", alt: "Fibre Liquid Home à la maison" },
      { type: "button", label: "Découvrir les forfaits Libota", url: "/packages" },
    ]),
  },
  {
    slug: "tuto-installer-routeur",
    title: "Tuto : installer et sécuriser votre routeur Wi-Fi",
    category: "tuto",
    excerpt: "Étape par étape : brancher votre routeur, configurer le Wi-Fi et sécuriser votre réseau en 5 minutes.",
    coverImage: "/img/banners/cd/banner004.jpg",
    content: JSON.stringify([
      { type: "paragraph", text: "Vous venez de recevoir votre routeur Liquid Home ? Suivez ce guide pour être en ligne en quelques minutes." },
      { type: "heading", text: "1. Branchement" },
      { type: "paragraph", text: "Reliez le câble fibre au port WAN (bleu) du routeur, puis alimentez le routeur sur une prise électrique. Attendez que la LED devienne verte (environ 2 minutes)." },
      { type: "youtube", url: "https://www.youtube.com/embed/9bZkp7q19f0", title: "Vidéo de démonstration" },
      { type: "heading", text: "2. Configuration du Wi-Fi" },
      { type: "paragraph", text: "Connectez-vous au réseau indiqué sur l'étiquette du routeur, ouvrez 192.168.1.1 et suivez l'assistant. Changez le nom du réseau (SSID) et le mot de passe par défaut." },
      { type: "heading", text: "3. Sécurité" },
      { type: "paragraph", text: "Activez le chiffrement WPA3 (ou WPA2), désactivez le WPS et mettez à jour le firmware régulièrement. Notre support 4757 peut vous accompagner gratuitement." },
      { type: "button", label: "Besoin d'aide ? Contactez le 4757", url: "/contact" },
    ]),
  },
  {
    slug: "tuto-reabonnement",
    title: "Tuto : gérer votre réabonnement et vos paiements",
    category: "tuto",
    excerpt: "Comment renouveler votre abonnement Libota, payer par Mobile Money et suivre vos factures depuis MyLiquid.",
    coverImage: "/img/banners/cd/banner001.jpg",
    content: JSON.stringify([
      { type: "paragraph", text: "Le réabonnement chez Liquid Home est simple et flexible : aucun engagement forcé, vous renewez quand vous voulez." },
      { type: "heading", text: "Payer depuis MyLiquid" },
      { type: "paragraph", text: "Connectez-vous à votre espace client MyLiquid, onglet Factures, puis cliquez sur Payer. Le paiement Mobile Money (M-Pesa, Orange Money, Airtel Money) est instantané et génère un reçu électronique." },
      { type: "heading", text: "Changer de forfait" },
      { type: "paragraph", text: "Vous pouvez passer de Libota Flex à Super ou Ultra à tout moment : la modification prend effet au prochain cycle de facturation, sans frais." },
      { type: "button", label: "Accéder à mon espace MyLiquid", url: "/myliquid" },
    ]),
  },
];

async function main() {
  for (const p of PACKAGES) {
    await prisma.package.upsert({ where: { slug: p.slug }, update: p, create: p });
  }
  console.log(`${PACKAGES.length} forfaits initialisés`);

  for (const e of EQUIPMENT) {
    await prisma.equipment.upsert({ where: { slug: e.slug }, update: e, create: e });
  }
  console.log(`${EQUIPMENT.length} équipements initialisés`);

  for (const post of POSTS) {
    await prisma.post.upsert({ where: { slug: post.slug }, update: post, create: post });
  }
  console.log(`${POSTS.length} articles initialisés`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
