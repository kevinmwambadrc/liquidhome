# Déploiement — Liquid Home RDC

Checklist complète pour passer de ce projet de développement à un site en production.

## 1. Prérequis serveur
- **Node.js ≥ 20.9** (LTS recommandé) sur un VPS (2 vCPU / 2 Go RAM suffisent au départ)
- Un nom de domaine (ex. `cd.liquidhome.tech`) avec DNS pointant vers le serveur
- **HTTPS obligatoire** : Let's Encrypt via Caddy (un `Caddyfile` est déjà fourni) ou Nginx + certbot

## 2. Variables d'environnement (fichier `.env`, jamais commité)
```bash
DATABASE_URL="file:/chemin/absolu/vers/db/custom.db"   # chemin ABSOLU en production
SMTP_URL="smtp://utilisateur:motdepasse@smtp.fournisseur.tld:587"  # envoi réel des emails
MAIL_FROM="Liquid Home RDC <DRCfibre@liquid.tech>"
NODE_ENV="production"
```
- Sans `SMTP_URL`, les emails (identifiants, confirmations, reçus) restent **journalisés uniquement** dans le back-office → onglet Emails.
- Fournisseurs SMTP compatibles RDC : Brevo, Mailgun, Gmail SMTP (avec mot de passe d'application).

## 3. Build et démarrage
```bash
npm ci
npx prisma db push        # (ou prisma migrate deploy avec de vraies migrations)
node scripts/seed-content.mjs   # forfaits/équipements/articles de départ
node scripts/seed.mjs           # comptes admin + démo (optionnel, changer les mots de passe !)
npm run build             # produit .next/standalone
npm run start             # lance le serveur standalone sur le port 3000
```
- Process manager : **PM2** (`pm2 start npm --name liquidhome -- run start`) ou service systemd.
- Le port est derrière Caddy/Nginx en reverse-proxy HTTPS.

## 4. Ce qui manque / à faire avant la mise en production
- [ ] **Changer tous les mots de passe démo** (admin@liquid.tech, jean@demo.cd) puis supprimer les seeds de démo
- [ ] Configurer **SMTP_URL** et tester un envoi réel (onglet Emails → sent = SMTP ✓)
- [ ] **Sauvegardes SQLite** : cron quotidien `sqlite3 db/custom.db ".backup backup.db"` + copie hors serveur
- [ ] Remplacer le **paiement simulé** (Mobile Money/carte) par une vraie passerelle (ex.集成 FlexPay, MaxiCash, Stripe) dans `/api/topup` et `/api/invoices/pay`
- [ ] Clé **Google Maps** si vous voulez leurs tuiles/Places (le géocodage Nominatim actuel est gratuit et sans clé)
- [ ] Clé **reCAPTCHA/hCaptcha** sur les formulaires publics (contact, demande de couverture) si spam constaté
- [ ] Vérifier le **CSP** dans `next.config.ts` si vous ajoutez des scripts tiers
- [ ] Monitoring : logs PM2 + uptime (UptimeRobot) ; le rate-limiter est en mémoire (mono-instance) → passer à Redis si plusieurs instances
- [ ] Mentions légales : relire les textes (confidentialité/CGV) avec un juriste RDC
- [ ] SEO : `robots.txt` présent ; ajouter sitemap.xml et Search Console
- [ ] Favicon/OG déjà en place ; tester le partage sur WhatsApp/Facebook

## 5. Sécurité déjà en place
- Sessions httpOnly + expiry 7j, mots de passe scrypt, cookie `secure` en production
- Mot de passe provisoire envoyé par email + **réinitialisation forcée** à la première connexion
- Rate-limiting (login, géocodage, demandes, commandes) + cache géocodage
- En-têtes : CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
- Uploads admin : types/mime vérifiés, 12 Mo max, noms aléatoires
- Toutes les routes d'écriture admin protégées par `requireAdmin` (403 sinon)
- Prix des commandes **recalculés serveur** (jamais trusts depuis le client)

## 6. Conversion vers d'autres technologies
Voir la réponse détaillée en fin de conversation. Résumé :
- **Thème WordPress** : possible (design 100% conservable), mais l'espace client/factures/topup nécessitera des plugins (WooCommerce + memberships) ou du PHP custom — maintenance plus lourde.
- **PHP natif** : réécriture complète possible (même SQLite/MySQL), coût de développement important, aucun gain net.
- **Recommandation** : rester sur Next.js (déjà fonctionnel, moderne, SEO-friendly). Une export statique n'est PAS possible (auth + DB requises).
