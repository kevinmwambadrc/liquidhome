# Liquid Home RDC — Portale FAI & Espace Client

Plateforme web moderne pour **Liquid Home RDC** (Fournisseur d'Accès Internet Fibre Optique en République Démocratique du Congo), développée avec **Next.js 16**, **TypeScript**, **Tailwind CSS 4**, **Prisma ORM (SQLite)**, **Leaflet** et intégration de la passerelle de paiement **MaishaPay**.

---

## 🌟 Fonctionnalités

* 🌐 **Site Public Moderne** : Présentation des offres Fibre Résidentielles (Libota Flex, Super, Ultra) et Solutions Entreprises (PME / Business).
* 🗺️ **Carte de Couverture Interactive** : Géocodage réel OpenStreetMap/Nominatim Kinshasa avec polygones de couverture FTTH (Gombe, Ngaliema, Limete, Kasa-Vubu, etc.).
* 📝 **Tunnel de Souscription en 4 Étapes** : Vérification d'éligibilité, choix du forfait, téléversement de pièce d'identité KYC et commande.
* 👤 **Espace Client MyLiquid (`/myliquid`)** :
  * Suivi de consommation et état de la ligne fibre.
  * Facturation & règlement en ligne instantané via **MaishaPay** (M-Pesa, Orange Money, Airtel Money, Visa, Mastercard).
  * Réabonnement et changement de forfait en ligne.
  * Centre de tickets de support client.
* 🛒 **Boutique Équipements (`/produits-et-services`)** : Catalogue d'équipements (Routeurs Wi-Fi 6, Répéteurs Mesh, Mini-UPS) avec paiement direct en ligne ou à la livraison.
* 📰 **Blog & Guides Tutoriels (`/infos`)** : Articles riches par blocs pour l'assistance et les actualités.
* 🛡️ **Back-Office Administrateur (`/admin`)** :
  * Tableau de bord KPIs & statistiques de revenus.
  * Gestion des commandes, forfaits, équipements et articles.
  * Validation des pièces d'identité KYC.
  * Supervision en direct des transactions MaishaPay.
  * Export comptable CSV/Excel.
* 🌍 **Bilinguisme Complet** : Basculement instantané Français / Anglais (FR / EN).

---

## 🛠️ Stack Technique

* **Framework** : [Next.js 16 (App Router)](https://nextjs.org/)
* **Langage** : [TypeScript](https://www.typescriptlang.org/)
* **Styles** : [Tailwind CSS 4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
* **Base de Données** : [Prisma ORM](https://www.prisma.io/) avec SQLite
* **Animations** : [Framer Motion](https://www.framer.com/motion/)
* **Cartographie** : [React Leaflet](https://react-leaflet.js.org/) & OpenStreetMap
* **Passerelle de Paiement** : [MaishaPay](https://www.maishapay.online/)

---

## 🚀 Installation & Démarrage Local

```bash
# 1. Cloner le dépôt
git clone https://github.com/kevinmwambadrc/liquidhome.git
cd liquidhome

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env

# 4. Synchroniser la base de données & initialiser les données
npx prisma db push
node scripts/seed-content.mjs
node scripts/seed.mjs

# 5. Démarrer le serveur de développement
npm run dev
```

Accédez ensuite à `http://localhost:3000`.

---

## 🔑 Identifiants Démo (Local)

* **Administrateur (`/admin`)** : `admin@liquid.tech` / `Admin1234`
* **Client Démo (`/myliquid`)** : `jean@demo.cd` / `Client1234`

---

## 📄 Licence

Propriété de **Liquid Home RDC** / **Liquid Intelligent Technologies**.
