# Liquid Home RDC — Recreation Worklog

## Project Overview
Faithful recreation of https://cd.liquidhome.tech (Liquid Home RDC, a fiber internet ISP in Democratic Republic of Congo) using Next.js 16.3.1, TypeScript, Tailwind CSS 4, and shadcn/ui.

## Task ID: ALL
Agent: main (orchestrator)

---

## Task ID: 1
Agent: main
Task: Recreate cd.liquidhome.tech 100% with Next.js

Work Log:
- Analyzed original site via web-reader skill (full report covering 10 areas: structure, pages, design, content, images, components, contact, branding, features, footer)
- Downloaded original brand assets from cd.liquidhome.tech to /public/img/: logos (liquid_home2.png, colour_liquid_home2.png, myliquid.png, chat_logo.png), 4 hero banners (banner001-004.jpg), favicons (16.png, 32.png)
- Set up brand color system in globals.css: brand-navy #273C88, brand-orange #F89E3C, brand-orange-hover #e29037, brand-soft #F0F0F0, brand-muted #666666
- Configured Montserrat font via next/font/google in layout.tsx
- Built custom hash-based client router (src/lib/router.tsx) with 11 routes since only `/` is user-visible
- Created comprehensive content data file (src/lib/content.ts) with nav, packages, social links, FAQ, coverage areas, etc.
- Built layout components: SiteHeader (sticky navy→orange gradient header with logo, nav, site-type switcher, language switcher, login, mobile hamburger menu), AvailabilityChecker (address form under header with API integration), SiteFooter (4-column with legal links, contact info, social icons, copyright)
- Built sections: HeroCarousel (4 auto-rotating banners with arrows + dots), CtaRow (stats band + 3 CTA buttons), WhyChooseUs (4-reason grid on navy bg with orange icons), CoverageAreas (stylized map with animated coverage dots), FAQ (accordion), Newsletter (subscribe form with API), ServiceOptions (4 service cards), PageBanner (reusable navy banner)
- Built pages: HomePage (carousel+CTA+services+whychoose+coverage+FAQ+newsletter), BusinessPage (carousel+3 sidebar boxes+features+CTA), ProductsServicesPage (banner+service cards+detailed services+whychoose+existing customer CTA), PackagesPage (Libota banner+3 pricing cards Flex/Super/Ultra+comparison table+trust band), ContactPage (banner+contact form with conditional Home/Business fields+how it works sidebar+help info), SignupPage (4-step wizard: location with interactive map → offers → details → confirmation), LegalPage (privacy/cookies/usage/terms with sidebar nav), MyLiquidPage (login form + features preview)
- Built widgets: WhatsAppFloat (floating chat button with expandable card + pulse animation), SiteTypeModal (first-visit site-type chooser modal)
- Created 5 API routes: /api/newsletter/subscribe, /api/contact/submit, /api/signup/location (with simulated coverage DB), /api/signup/submit (order creation), /api/complaint
- Wired everything together in src/app/page.tsx with RouterProvider
- Fixed lint errors: removed unused eslint-disable directive, refactored initial route reading from useEffect to useState initializer to avoid setState-in-effect error
- Fixed accessibility: added DialogTitle + DialogDescription (sr-only) to SiteTypeModal, fixed image aspect ratio warnings

Stage Summary:
- Site loads cleanly at http://localhost:3000 with correct title "Fast Internet Connectivity | Home | Liquid Home"
- All 11 routes work via hash navigation (#home, #business, #products-and-services, #packages, #contact-us, #signup, #myliquid, #privacy-policy, #cookies-policy, #usage, #terms-and-conditions)
- All forms verified end-to-end via agent-browser: availability checker (returns "Excellente nouvelle! La fibre...est disponible"), contact form ("Merci Jean! Votre message a bien été envoyé"), newsletter ("Merci Jean Mutombo de vous être abonné"), signup wizard 4-step flow (location→offers→details→confirmation)
- Mobile responsive verified (375x667 viewport): header 64px, carousel visible, mobile menu button present
- Zero console errors, zero page errors, clean lint
- Brand colors and original assets faithfully reproduced
- Sticky footer at bottom (min-h-screen flex flex-col + mt-auto pattern)

Verification Results (agent-browser):
- Page title: ✓ "Fast Internet Connectivity | Home | Liquid Home"
- Home page: ✓ carousel + 3 CTAs + 4 service cards + 4 why-choose reasons + coverage map + 6 FAQ items + newsletter
- Packages page: ✓ 3 Libota cards (Flex $49, Super $89 highlighted, Ultra $149) + comparison table
- Signup wizard: ✓ step 1 location form → step 2 package selection → step 3 details → step 4 confirmation
- Contact form: ✓ all fields + conditional Home/Business fields + successful submit
- Business page: ✓ 3 sidebar boxes (Connectivité illimitée, Évolution Constante, Expertise Technique) + features + CTA
- Legal pages: ✓ privacy policy with 7 sections, cookies (4), usage (5), terms (7)
- MyLiquid page: ✓ login form + 4 feature cards
- Mobile menu: ✓ hamburger opens nav

Unresolved / Future Work:
- WhatsApp chat widget could be replaced with real Anywhere365 integration if needed
- Google Maps API key integration for real coverage map (currently stylized)
- Captcha for contact/complaint forms (currently no captcha, real site uses it)
- Email/SMS backend for actual form delivery (currently stubbed API routes)
- Customer portal (MyLiquid) full implementation with auth + dashboard
- Complaint modal not yet built (API route exists, but modal UI not added)
- Could add more polish: animations between page transitions, skeleton loaders

---
Task ID: 2
Agent: main (orchestrator)
Task: Update to latest Next.js, center nav menu, add real interactive Google-style map with KMZ coverage overlay on signup page

Work Log:
- Upgraded Next.js from 16.1.3 to 16.3.1 (latest stable on npm — there is no "Next.js 22"; the current major version line is 16.x)
- Added `allowedDevOrigins` to next.config.ts for preview domain
- Installed `react-leaflet@5.0.0`, `leaflet@1.9.4`, and `@types/leaflet@1.9.22` for real interactive map
- Centered the navigation menu in SiteHeader: changed layout to 3-zone (logo left | nav absolutely centered | Souscrire CTA right) using `absolute left-1/2 -translate-x-1/2` on the `<nav>` element. Verified: nav_center_x=640, window_mid=640, offset=0px (perfectly centered)
- Created coverage data file `src/lib/coverage.ts` with 12 Kinshasa commune coverage zones (8 available: Gombe, Ngaliema, Kintambo, Bandalungwa, Kasa-Vubu, Limete, Lemba, Ngiri-Ngiri, Kinshasa Centre; 3 coming-soon: Selembao, Bumbu, Makala). Includes `findZoneAt()` point-in-polygon function for real coverage detection
- Built `CoverageMap` component (`src/components/widgets/CoverageMap.tsx`) using react-leaflet v5:
  - Real OpenStreetMap street tiles + Esri World Imagery satellite tiles with toggle button
  - 12 coverage polygon overlays (orange = available, gray dashed = coming-soon) simulating KMZ overlay
  - Draggable orange marker pin with popup showing GPS coordinates
  - Click-to-place on map to set location
  - 5 custom controls: Satellite/Plan toggle, Zoom +, Zoom -, Recenter on Kinshasa, Geolocation ("Ma position")
  - Popups on coverage zones showing commune name + availability status
  - Color legend below the map
- Updated `SignupPage` to dynamically import CoverageMap with `ssr: false` (avoids Leaflet window reference during SSR)
- Replaced the stylized fake map with the real Leaflet map in signup wizard step 1
- Added real-time coverage status indicator: when user drags/clicks pin into a coverage zone, shows green "Fibre disponible" or orange "Bientôt disponible" with commune name
- Added GPS coordinates display panel showing live lat/lng
- Fixed hydration mismatch error: router now always initializes route="home" (matching server), then syncs from URL hash via deferred `Promise.resolve().then(() => setRoute(hash))` after hydration commit. Verified: 0 hydration errors in dev.log
- Fixed react-leaflet v5 `useMap()` outside MapContainer error: moved all map-control components inside `<MapContainer>` as children (MapControls component renders absolutely-positioned buttons via `.leaflet-top` classes)

Stage Summary:
- Next.js updated to 16.3.1 (latest)
- Navigation menu is perfectly centered (verified: 0px offset from window center)
- Real interactive Leaflet map renders on signup page with:
  - 6 OSM tiles loaded (HTTP 200)
  - 12 coverage polygon paths (KMZ-style overlay)
  - 1 draggable orange marker
  - 5 interactive controls (satellite toggle, zoom +/-, recenter, geolocation)
  - Map size 387x387px
- Satellite toggle verified: clicking switches from OSM street tiles to Esri World Imagery (satellite) tiles
- Coverage status indicator shows commune name + availability when pin is in a coverage zone
- Zero hydration errors, zero page errors, clean lint
- All original functionality preserved (all 11 routes, forms, carousel, etc.)

Verification Results (agent-browser):
- Nav centered: ✓ offset=0px (nav_center=640 = window_mid=640)
- Signup page: ✓ H1 "Forfaits internet", H2 "Découvrez si vous pouvez bénéficier de nos services"
- Map rendered: ✓ container=true, tiles=6, paths=12, markers=1, controls=5
- Map controls: ✓ "Basculer carte/satellite | Zoom + | Zoom - | Recentrer sur Kinshasa | Utiliser ma position"
- Satellite toggle: ✓ clicking switches to Esri World Imagery tiles (arcgis=true)
- Hydration errors: ✓ 0 (fixed)
- Page errors: ✓ none

Unresolved / Future Work:
- Could replace OpenStreetMap with actual Google Maps API if a valid API key is provided (currently using free OSM/Esri tiles which are visually equivalent)
- Could load a real .kmz file from the original site if the URL is known (currently using programmatically-defined coverage polygons based on Kinshasa commune boundaries)
- favicon.ico 404 (harmless — browser requests /favicon.ico by default, but we serve /favicon.png)
- Customer portal (MyLiquid) full implementation with auth + dashboard
- Complaint modal UI (API route exists, modal not yet built)

---
Task ID: 3 (cron review)
Agent: main (automated web dev review)
Task: 15-minute scheduled review of the Liquid Home RDC site

Work Log:
- Dev server had stopped; restarted with `node node_modules/.bin/next dev -p 3000`
- Fixed recurring image aspect ratio warning in SiteTypeModal: changed Image props from width={180} height={56} + conflicting style to width={324} height={100} (actual intrinsic dimensions) + className="h-14 w-auto" only
- Ran full verification of all 11 routes via agent-browser
- Verified signup page Leaflet map, centered nav, console warnings, page errors, hydration

Stage Summary:
- All 11 pages load correctly with proper H1 headings:
  - products-and-services → "Produits & Services"
  - packages → "Libota"
  - contact-us → "Contact"
  - signup → "Forfaits internet"
  - business → "Des solutions internet pensées pour votre entreprise"
  - myliquid → "Espace Client MyLiquid"
  - privacy-policy → "Politique de confidentialité"
  - cookies-policy → "Politique des cookies"
  - usage → "Utilisation acceptable"
  - terms-and-conditions → "Termes et conditions"
  - home → (hero carousel first, no visible H1 — matches original site design)
- Signup map: OK (6 tiles + 12 coverage zones + 1 draggable marker)
- Nav centered: offset=0px (perfectly centered)
- Image aspect ratio warnings: 0 (FIXED)
- Page errors: 0
- Hydration errors: 0
- Lint: clean

No issues found. Site is fully operational.

---
Task ID: 4 (cron review)
Agent: main (automated web dev review)
Task: 15-minute scheduled review of the Liquid Home RDC site

Work Log:
- Dev server had stopped; restarted with `node node_modules/.bin/next dev -p 3000`
- Ran full verification of all 11 routes, signup map, centered nav, console warnings, page errors, hydration

Stage Summary:
- All 11 pages load correctly with proper H1 headings (home has hero carousel first as designed)
- Signup Leaflet map: OK (6 tiles + 12 coverage zones + 1 draggable marker)
- Nav centered: offset=0px (perfectly centered)
- Console image warnings: 0
- Page errors: 0
- Hydration errors: 0

No issues found. Site is fully operational.

---
Task ID: 5 (cron review)
Agent: main (automated web dev review)
Task: 15-minute scheduled review of the Liquid Home RDC site

Work Log:
- Dev server had stopped; restarted with `node node_modules/.bin/next dev -p 3000`
- Fixed 2 LCP (Largest Contentful Paint) optimization warnings:
  1. SiteTypeModal logo: added `loading="eager"` to the colour_liquid_home2.png Image
  2. HeroCarousel banners: added `loading="eager"` to non-priority carousel banners (i > 0) since they rotate above the fold
- Ran full verification of all 11 routes, signup map, centered nav, console warnings, page errors, hydration

Stage Summary:
- All 11 pages load correctly with proper H1 headings (home has hero carousel first as designed)
- Signup Leaflet map: OK (6 tiles + 12 coverage zones + 1 draggable marker)
- Nav centered: offset=0px (perfectly centered)
- Console LCP warnings: 0 (FIXED)
- Page errors: 0
- Hydration errors: 0
- Lint: clean

No issues found. Site is fully operational.

---
Task ID: 6 (cron review)
Agent: main (automated web dev review)
Task: 15-minute scheduled review of the Liquid Home RDC site

Work Log:
- Dev server had stopped; restarted with `node node_modules/.bin/next dev -p 3000`
- Ran full verification of all 11 routes, signup map, centered nav, console warnings, page errors, hydration, lint

Stage Summary:
- All 11 pages load correctly with proper H1 headings (home has hero carousel first as designed)
- Signup Leaflet map: OK (6 tiles + 12 coverage zones + 1 draggable marker)
- Nav centered: offset=0px (perfectly centered)
- Console warnings (LCP/image): 0
- Page errors: 0
- Hydration errors: 0
- Lint: clean

No issues found. Site is fully operational.

---
Task ID: 7 (cron review)
Agent: main (automated web dev review)
Task: 15-minute scheduled review of the Liquid Home RDC site

Work Log:
- Dev server had stopped; restarted with `node node_modules/.bin/next dev -p 3000`
- Ran full verification of all 11 routes, signup map, centered nav, console warnings, page errors, hydration, lint

Stage Summary:
- All 11 pages load correctly with proper H1 headings (home has hero carousel first as designed)
- Signup Leaflet map: OK (6 tiles + 12 coverage zones + 1 draggable marker)
- Nav centered: offset=0px (perfectly centered)
- Console warnings (LCP/image): 0
- Page errors: 0
- Hydration errors: 0
- Lint: clean

No issues found. Site is fully operational.

---
Task ID: 8 (cron review)
Agent: main (automated web dev review)
Task: 15-minute scheduled review of the Liquid Home RDC site

Work Log:
- Dev server had stopped; restarted with `node node_modules/.bin/next dev -p 3000`
- Ran full verification of all 11 routes, signup map, centered nav, console warnings, page errors, hydration, lint

Stage Summary:
- All 11 pages load correctly with proper H1 headings (home has hero carousel first as designed)
- Signup Leaflet map: OK (6 tiles + 12 coverage zones + 1 draggable marker)
- Nav centered: offset=0px (perfectly centered)
- Console warnings (LCP/image): 0
- Page errors: 0
- Hydration errors: 0
- Lint: clean

No issues found. Site is fully operational.

---
Task ID: 9 (cron review)
Agent: main (automated web dev review)
Task: 15-minute scheduled review of the Liquid Home RDC site

Work Log:
- Dev server had stopped; restarted with `node node_modules/.bin/next dev -p 3000`
- Ran full verification of all 11 routes, signup map, centered nav, console warnings, page errors, hydration, lint

Stage Summary:
- All 11 pages load correctly with proper H1 headings (home has hero carousel first as designed)
- Signup Leaflet map: OK (6 tiles + 12 coverage zones + 1 draggable marker)
- Nav centered: offset=0px (perfectly centered)
- Console warnings (LCP/image): 0
- Page errors: 0
- Hydration errors: 0
- Lint: clean

No issues found. Site is fully operational.

---
Task ID: 10 (cron review)
Agent: main (automated web dev review)
Task: 15-minute scheduled review of the Liquid Home RDC site

Work Log:
- Dev server had stopped; restarted with `node node_modules/.bin/next dev -p 3000`
- Ran full verification of all 11 routes, signup map, centered nav, console warnings, page errors, hydration, lint

Stage Summary:
- All 11 pages load correctly with proper H1 headings (home has hero carousel first as designed)
- Signup Leaflet map: OK (6 tiles + 12 coverage zones + 1 draggable marker)
- Nav centered: offset=0px (perfectly centered)
- Console warnings (LCP/image): 0
- Page errors: 0
- Hydration errors: 0
- Lint: clean

No issues found. Site is fully operational.

---
Task ID: 11 (cron review)
Agent: main (automated web dev review)
Task: 15-minute scheduled review of the Liquid Home RDC site

Work Log:
- Dev server had stopped; restarted with `node node_modules/.bin/next dev -p 3000`
- Ran full verification of all 11 routes, signup map, centered nav, console warnings, page errors, hydration, lint

Stage Summary:
- All 11 pages load correctly with proper H1 headings (home has hero carousel first as designed)
- Signup Leaflet map: OK (6 tiles + 12 coverage zones + 1 draggable marker)
- Nav centered: offset=0px (perfectly centered)
- Console warnings (LCP/image): 0
- Page errors: 0
- Hydration errors: 0
- Lint: clean

No issues found. Site is fully operational.

---
Task ID: 12 (cron review)
Agent: main (automated web dev review)
Task: 15-minute scheduled review of the Liquid Home RDC site

Work Log:
- Dev server had stopped; restarted with `node node_modules/.bin/next dev -p 3000`
- Ran full verification of all 11 routes, signup map, centered nav, console warnings, page errors, hydration, lint

Stage Summary:
- All 11 pages load correctly with proper H1 headings (home has hero carousel first as designed)
- Signup Leaflet map: OK (6 tiles + 12 coverage zones + 1 draggable marker)
- Nav centered: offset=0px (perfectly centered)
- Console warnings (LCP/image): 0
- Page errors: 0
- Hydration errors: 0
- Lint: clean

No issues found. Site is fully operational.

---

## Task ID: 2 (2026-08-16)
Agent: main
Task: Modernisation UI + fonctionnalités opérationnelles (couverture, souscription, dashboard client, back-office admin)

Work Log:
- Fixed .env DATABASE_URL (Linux sandbox path -> local absolute path)
- New Prisma schema: User (roles client/admin, passwordHash scrypt, customerNo), Session (tokens, expiry), Order (GPS lat/lng, commune, statuts), ContactMessage, NewsletterSubscriber, Complaint, Invoice, Ticket
- Auth: src/lib/auth.ts (scrypt hash/verify, sessions en DB, cookie httpOnly lh_session, guards requireUser/requireAdmin)
- API réelles avec persistance: /api/auth/{login,logout,me}, /api/signup/location (point-in-polygon via lib/coverage + fallback textuel), /api/signup/submit (commande + création compte si mot de passe), /api/contact/submit, /api/newsletter/subscribe, /api/complaint, /api/tickets, /api/invoices/pay (Mobile Money), /api/profile
- API admin: /api/admin/overview (KPIs + graphiques 14j + répartition forfaits), /api/admin/orders (PATCH statut; passage en "installed" génère automatiquement la 1re facture), /api/admin/complaints, /api/admin/messages
- Pop-up bienvenue: logo couleur -> logo blanc (identique navbar)
- Modernisation UI (ligne éditoriale conservée navy #273C88 / orange #F89E3C / Montserrat):
  - globals.css: boutons dégradés + ombre portée + hover lift (spring), inputs arrondis focus 4px, utilitaire .glass, scroll-behavior smooth, selection orange, cartes hover adoucies
  - framer-motion: transitions de pages (AnimatePresence), composant Reveal/RevealGroup (révélation au scroll), hero carousel avec Ken Burns + dots de progression animés, menu mobile animé, header verre dépoli au scroll
- Dashboard client MyLiquid (#myliquid): login réel, onglets Aperçu (KPIs, graphique consommation recharts, ligne fibre), Mes commandes (timeline), Factures (paiement Mobile Money), Support (tickets), Profil
- Back-office admin (#admin, lien discret footer): login dédié, KPIs, graphiques commandes/forfaits, gestion des statuts de commandes, messages, réclamations, abonnés newsletter
- Wizard souscription: vérification couverture réelle via API (GPS + adresse), champ mot de passe pour créer le compte MyLiquid, référence de commande affichée en confirmation
- Seed: scripts/seed.mjs — admin@liquid.tech/Admin1234, jean@demo.cd/Client1234 (commande installée, 2 factures, ticket), réclamation + message + abonné démo
- Corrections: bug houseNo Prisma (500), balisage JSX menu mobile, lint template shadcn (use-mobile, carousel)
- Tests E2E navigateur validés: pop-up + logo blanc, checker couverture (adresse couverte), wizard 4 étapes avec commande LH-xxx persistée et liée au compte, login client, ticket support, admin: passage commande en Installée -> facture 89 USD auto-générée -> payée par le client via Mobile Money, réclamation résolue

Verification Results:
- npm run lint: 0 erreur
- GET / 200, toutes les API testées renvoient 200 avec persistance vérifiée en base

---

## Task ID: 3 (2026-08-16)
Agent: main
Task: Vraies routes (fin du routage hash), correctif placeholder/icône, transitions légales fluides, retrait "KMZ Couverture"

Work Log:
- Routage hash -> routes Next.js réelles: PATHS centralisés dans src/lib/router.tsx (SiteProvider + navigate via next/navigation), 12 pages créées (/, /business, /produits-et-services, /packages, /contact, /souscrire, /myliquid, /admin, /confidentialite, /cookies, /utilisation, /conditions-generales)
- Shell partagé déplacé dans src/components/layout/SiteShell.tsx rendu par app/layout.tsx (header, checker masqué sur portails, footer, WhatsApp, pop-up)
- app/template.tsx: transition d'entrée douce (fade + slide) sur chaque navigation, sans animation de sortie -> pages légales s'enchaînent fluidement
- État actif du header basé sur usePathname; menu mobile se ferme au changement de route; data-scroll-behavior="smooth" sur <html> (avertissement Next)
- Fix placeholder/icône: classes .input-brand et .btn-brand déplacées dans @layer components -> les utilitaires Tailwind (pl-10) repriment le padding; le texte saisi démarre après l'icône (40px vérifié)
- Libellé "KMZ Couverture" supprimé de l'étape 1 du wizard
- Tous les navigate() migrés vers les chemins réels; LEGAL_LINKS clés simplifiées (privacy/cookies/usage/terms)

Verification Results:
- 12/12 routes en 200; tsc sans erreur; eslint 0 erreur
- Navigateur: deep-link /contact, transitions sidebar légales (confidentialite -> cookies -> conditions-generales), padding-left 40px sur l'input email, /souscrire sans KMZ, header/logo/footer navigations, login admin OK

---

## Task ID: 4 (2026-08-16)
Agent: main
Task: Session header, géocodage réel, catalogues admin (forfaits/équipements), blog Infos + tutos, i18n EN complet, correctifs visuels

Work Log:
- Header session-aware: puce utilisateur (initiales + nom, clic -> espace selon rôle) + bouton déconnexion, "Se connecter" si déconnecté; suivi /api/auth/me par route
- Géocodage réel: /api/geocode (proxy Nominatim, biais Kinshasa); checker d'adresse et wizard géocodent l'adresse saisie -> déplacement de l'épingle + zone réelle (testé: Ngaliema dispo, Masina non dispo); barre de recherche d'adresse intégrée à la carte Leaflet + recentrage auto
- Demande de couverture: modale publique (nom/tél/email/message + adresse/GPS auto) -> CoverageRequest en base; bouton visible quand non dispo (checker + wizard); vue admin avec statuts nouvelle/contactée/couverte
- Catalogues pilotés par l'admin: modèles Package + Equipment (router/extender/powerbank) + Post (info/tuto) + API CRUD; forfaits page et wizard lisent /api/packages; équipements affichés par catégorie
- Admin étendu à 9 onglets: Forfaits (CRUD complet, activer/désactiver), Équipements (CRUD), Infos & Tutos (éditeur à blocs: paragraphe, titre, citation, image+upload, YouTube, audio+upload, bouton; image de couverture; brouillon/publié), Demandes couverture
- Menu "Infos" (/infos) entre Produits & Services et Contact: blog avec onglets Actualités/Tutoriels, cartes avec couverture, page article /infos/[slug] avec rendu riche; 3 articles seedés dont 2 tutos (routeur, réabonnement)
- i18n: dictionnaire src/lib/i18n.ts (~150 clés), t() dans le contexte site, sélecteur FR/EN fonctionnel (header + mobile), variantes EN des contenus (FAQ, pourquoi-nous, services, étapes); appliqué au header/footer/checker/wizard/contact/myliquid/pop-up/infos
- Accueil: bandeau stats (100%/300Mbps/24-7/5j) et section couverture retirés
- Correctif FAQ rectangle coupé: keyframes animate-accordion-down/up ajoutées (Tailwind v4 @theme)
- Correctif bouton forfait: classe .btn-navy dédiée (plus de conflit dégradé/navy)
- Restart dev server nécessaire après db push (client Prisma chargé au démarrage)

Verification Results:
- tsc 0 erreur, eslint 0 erreur, /api/packages|equipments|posts -> 200
- Navigateur: EN complet vérifié (nav/FAQ/checker/CTA), puce session admin, géocodage réel (Ngaliema dispo / Masina non dispo + demande DCV enregistrée et visible admin), CRUD forfait vérifié en base (49->55->49), articles/équipements/demandes visibles admin, FAQ accordéon OK

---

## Task ID: 5 (2026-08-16)
Agent: main
Task: Sécurité, KYC, ventes/topup, cookies-tracking, PDF, i18n, correctifs UI

Work Log:
- Sécurité: rate-limiting (login/covreq/eqorder/geocode+cache TTL), en-têtes CSP+XFO+nosniff+Referrer+Permissions via next.config, cookie secure en prod, logs Prisma réduits, caps longueur entrées, prix recalculés serveur, uploads publics KYC typés/limités 8Mo à noms aléatoires
- Auth: mot de passe provisoire généré + email identifiants (EmailLog + SMTP_URL optionnel nodemailer), mustResetPassword -> vue de réinitialisation forcée (8+ car., lettres+chiffres), événement lh:auth -> header session instantané
- KYC: pièce d'identité (passeport/carte électeur/permis) téléversée au signup, statut pending -> validation/rejet admin (onglet Vérifications avec aperçu du document), carte de statut sur le dashboard client
- Ventes: bouton Acheter sur les équipements -> modale commande (quantité, livraison) -> EquipmentOrder + email confirmation; onglet admin Ventes équip. avec statuts; onglet client Mes achats
- Réabonnement: bouton Réabonnement sur le dashboard -> modale topup (choix forfait, Mobile Money simulé) -> facture payée + email reçu
- Revenus: classification mensuelle 12 mois (abonnements vs équipements) + exports CSV/Excel (BOM, ;) ventes et emails
- Cookies: bannière de consentement, tracking pageview/clics/consent uniquement après acceptation (lh_sid + lh_consent), onglet admin Cookies: sessions, top pages, top clics, parcours visiteurs, activité récente
- Blog: icône H2 supprimée devant les titres (rendu partagé PostBlocks), options alignement (gauche/centre/droite) + styles de bouton (orange/navy/contour), prévisualisation en direct, guide couverture 16:9 (1200x675)
- PDF: /api/legal/pdf?doc=privacy|terms (pdf-lib, bandeau navy + logo couleur, pagination) + boutons Télécharger en PDF
- Menus: Domicile et PME séparés, 4 entrées sur une ligne chacun, ancres /business#home #services #why #contact avec scroll, siteType/langue persistés (localStorage)
- Divers: page 404 brandée, déconnexion admin corrigée (appel API réel), logo couleur sur carte de connexion blanche, zoom Ken Burns retiré du hero (slide conservé), double flèche retour corrigée

Verification Results:
- tsc 0 erreur, eslint 0 erreur
- API testées: achat EQ-... (26 USD en base), KYC complet (upload->pending->approved), login temp pwd -> mustReset -> reset OK, topup 89 USD + facture septembre, export CSV conforme, tracking (consent+pageview+clics en base), PDF application/pdf
- Navigateur: menu PME persistant 4 items + ancre #services, article sans badge H2, bannière cookies fonctionnelle
