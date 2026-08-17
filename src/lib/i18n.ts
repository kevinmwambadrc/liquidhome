// Lightweight UI dictionary. `lang` lives in the SiteProvider context.
export type Lang = "fr" | "en";

type Entry = { fr: string; en: string };

export const DICT: Record<string, Entry> = {
  // Header / chrome
  "header.login": { fr: "Se connecter", en: "Sign in" },
  "header.logout": { fr: "Déconnexion", en: "Sign out" },
  "header.subscribe": { fr: "Souscrire", en: "Subscribe" },
  "header.language": { fr: "Français", en: "English" },

  // Availability checker
  "checker.title": { fr: "Vérifiez quel forfait internet est disponible dans votre zone", en: "Check which internet plan is available in your area" },
  "checker.street": { fr: "adresse de l'avenue", en: "street address" },
  "checker.house": { fr: "N° de la Maison", en: "House No." },
  "checker.search": { fr: "Recherche", en: "Search" },
  "checker.searching": { fr: "Recherche...", en: "Searching..." },

  // Home
  "home.offerBadge": { fr: "Offre spéciale", en: "Special offer" },
  "home.offerTitle": { fr: "Passez en mode Fibre & faites vivre votre maison !", en: "Switch to Fiber and bring your home to life!" },
  "home.offerText": { fr: "Meilleure connexion, meilleure sensation ! Découvrez nos forfaits Libota dès 49 USD/mois avec installation gratuite et données illimitées.", en: "Better connection, better feeling! Discover our Libota plans from $49/month with free installation and unlimited data." },
  "home.offerCta": { fr: "Découvrir Libota", en: "Discover Libota" },
  "home.faqBadge": { fr: "FAQ", en: "FAQ" },
  "home.faqTitle": { fr: "Questions fréquentes", en: "Frequently asked questions" },
  "home.faqSub": { fr: "Tout ce que vous devez savoir sur la fibre Liquid Home", en: "Everything you need to know about Liquid Home fiber" },
  "home.newsletterTitle": { fr: "Rester à jour avec toutes les dernières nouvelles et informations", en: "Stay up to date with the latest news and information" },
  "home.newsletterText": { fr: "Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives et l'actualité de la fibre en RDC.", en: "Subscribe to our newsletter to receive exclusive offers and fiber news in the DRC." },
  "home.newsletterName": { fr: "Votre nom (optionnel)", en: "Your name (optional)" },
  "home.newsletterEmail": { fr: "Votre adresse email", en: "Your email address" },
  "home.newsletterBtn": { fr: "S'abonner", en: "Subscribe" },
  "home.cta.subscribe": { fr: "Souscrire", en: "Subscribe" },
  "home.cta.products": { fr: "Produits & Services", en: "Products & Services" },
  "home.cta.help": { fr: "Besoin d'aide?", en: "Need help?" },
  "home.whyBadge": { fr: "Pourquoi nous", en: "Why us" },
  "home.whyTitle": { fr: "Pourquoi choisir Liquid Home", en: "Why choose Liquid Home" },
  "home.whySub": { fr: "Parce-que nous croyons que tout le monde devrait - être connecté", en: "Because we believe everyone should be connected" },
  "home.servicesBadge": { fr: "Nos services", en: "Our services" },
  "home.servicesTitle": { fr: "Découvrez tous nos services", en: "Discover all our services" },
  "home.servicesSub": { fr: "Des solutions internet et connectivité pour toute la famille", en: "Internet and connectivity solutions for the whole family" },

  // Packages page
  "packages.title": { fr: "Forfaits Libota", en: "Libota Plans" },
  "packages.subtitle": { fr: "A la maison ou au travail, parcourir, streamer ou télécharger, Liquid Home met à votre disposition une réponse ultra-rapide, illimitée et abordable.", en: "At home or at work, browse, stream or download — Liquid Home provides an ultra-fast, unlimited and affordable answer." },
  "packages.choose": { fr: "Choisir ce forfait", en: "Choose this plan" },
  "packages.month": { fr: "/mois", en: "/month" },
  "packages.compare": { fr: "Comparer les forfaits", en: "Compare plans" },
  "packages.subscribe": { fr: "Souscrire", en: "Subscribe" },
  "packages.equipTitle": { fr: "Équipements & Accessories", en: "Equipment & Accessories" },
  "packages.equipSub": { fr: "Optimisez votre connexion avec nos équipements officiels", en: "Optimize your connection with our official equipment" },
  "packages.catRouter": { fr: "Routeurs", en: "Routers" },
  "packages.catExtender": { fr: "Extendeurs Wi-Fi", en: "Wi-Fi Extenders" },
  "packages.catPowerbank": { fr: "Powerbanks", en: "Powerbanks" },
  "packages.option": { fr: "En option", en: "Optional" },

  // Signup wizard
  "signup.title": { fr: "Forfaits internet", en: "Internet plans" },
  "signup.stepLocation": { fr: "Location", en: "Location" },
  "signup.stepOffers": { fr: "Offres", en: "Offers" },
  "signup.stepDetails": { fr: "Détails", en: "Details" },
  "signup.stepConfirm": { fr: "Confirmation", en: "Confirmation" },
  "signup.findOut": { fr: "Découvrez si vous pouvez bénéficier de nos services", en: "Find out if you can benefit from our services" },
  "signup.findOutSub": { fr: "Entrer les détails de votre maison pour voir si vous pouvez bénéficier de nos services", en: "Enter your home details to see if you can benefit from our services" },
  "signup.street": { fr: "Adresse de la Rue", en: "Street Address" },
  "signup.house": { fr: "N° de la Maison", en: "House No." },
  "signup.lockAddr": { fr: "Adresse de verrouillage", en: "Lock address" },
  "signup.checking": { fr: "Checking availability...", en: "Checking availability..." },
  "signup.availability": { fr: "Disponibilité", en: "Availability" },
  "signup.mapHint": { fr: "Glissez et déposez l'épingle orange sur la carte pour choisir avec précision votre emplacement. Les zones orange indiquent les communes couvertes par la fibre.", en: "Drag and drop the orange pin on the map to pinpoint your location. Orange areas show the communes covered by fiber." },
  "signup.gps": { fr: "Coordonnées GPS sélectionnées", en: "Selected GPS coordinates" },
  "signup.choosePlan": { fr: "Choisissez votre forfait Libota", en: "Choose your Libota plan" },
  "signup.addrVerified": { fr: "Adresse vérifiée", en: "Verified address" },
  "signup.fiberAvail": { fr: "Fibre disponible", en: "Fiber available" },
  "signup.soon": { fr: "Bientôt", en: "Coming soon" },
  "signup.selected": { fr: "Sélectionné", en: "Selected" },
  "signup.chooseBtn": { fr: "Choisir", en: "Choose" },
  "signup.back": { fr: "Retour", en: "Back" },
  "signup.yourDetails": { fr: "Vos coordonnées", en: "Your details" },
  "signup.selectedPlan": { fr: "Forfait sélectionné", en: "Selected plan" },
  "signup.firstname": { fr: "Prénom", en: "First name" },
  "signup.lastname": { fr: "Nom", en: "Last name" },
  "signup.email": { fr: "Email", en: "Email" },
  "signup.phone": { fr: "Téléphone", en: "Phone" },
  "signup.instDate": { fr: "Date d'installation souhaitée", en: "Preferred installation date" },
  "signup.notes": { fr: "Notes (optionnel)", en: "Notes (optional)" },
  "signup.notesPh": { fr: "Informations complémentaires pour l'installation...", en: "Additional information for the installation..." },
  "signup.createAccount": { fr: "Créez votre compte MyLiquid (recommandé)", en: "Create your MyLiquid account (recommended)" },
  "signup.createAccountSub": { fr: "Suivez votre commande, payez vos factures et contactez le support depuis votre espace client.", en: "Track your order, pay your bills and reach support from your client area." },
  "signup.password": { fr: "Mot de passe", en: "Password" },
  "signup.passwordHint": { fr: "(6 caractères min., optionnel)", en: "(6 chars min., optional)" },
  "signup.confirm": { fr: "Confirmer la commande", en: "Confirm order" },
  "signup.submitting": { fr: "Soumission...", en: "Submitting..." },
  "signup.confirmed": { fr: "Commande confirmée !", en: "Order confirmed!" },
  "signup.newOrder": { fr: "Nouvelle commande", en: "New order" },
  "signup.backHome": { fr: "Retour à l'accueil", en: "Back to home" },
  "signup.notAvailable": { fr: "La fibre n'est pas encore disponible à cette adresse", en: "Fiber is not yet available at this address" },
  "signup.requestCoverage": { fr: "Demander la couverture", en: "Request coverage" },

  // Coverage request modal
  "covreq.title": { fr: "Demander la fibre dans ma zone", en: "Request fiber in my area" },
  "covreq.sub": { fr: "Laissez vos coordonnées : notre équipe réseau étudie votre quartier et vous rappelle sous 72h.", en: "Leave your details: our network team will study your area and call you back within 72h." },
  "covreq.name": { fr: "Nom complet", en: "Full name" },
  "covreq.phone": { fr: "Téléphone", en: "Phone" },
  "covreq.email": { fr: "Email (optionnel)", en: "Email (optional)" },
  "covreq.message": { fr: "Message (optionnel)", en: "Message (optional)" },
  "covreq.messagePh": { fr: "Précisions sur votre quartier, repères...", en: "Details about your area, landmarks..." },
  "covreq.send": { fr: "Envoyer la demande", en: "Send request" },
  "covreq.sending": { fr: "Envoi...", en: "Sending..." },

  // Contact page
  "contact.title": { fr: "Contactez-nous", en: "Contact us" },
  "contact.subtitle": { fr: "Une question, un devis ou besoin d'assistance ? Notre équipe est à votre écoute.", en: "A question, a quote or need assistance? Our team is here for you." },
  "contact.formTitle": { fr: "Envoyez-nous un message", en: "Send us a message" },
  "contact.send": { fr: "Envoyer le message", en: "Send message" },
  "contact.sending": { fr: "Envoi...", en: "Sending..." },

  // Auth / MyLiquid
  "myliquid.title": { fr: "Espace Client MyLiquid", en: "MyLiquid Client Area" },
  "myliquid.subtitle": { fr: "Connectez-vous pour gérer votre abonnement, consulter vos factures, suivre votre consommation et contacter notre support.", en: "Sign in to manage your subscription, view your bills, track your usage and contact support." },
  "myliquid.login": { fr: "Connexion", en: "Sign in" },
  "myliquid.loginSub": { fr: "Accédez à votre espace personnel", en: "Access your personal area" },
  "myliquid.emailOrId": { fr: "Email ou numéro client", en: "Email or customer number" },
  "myliquid.password": { fr: "Mot de passe", en: "Password" },
  "myliquid.remember": { fr: "Se souvenir de moi", en: "Remember me" },
  "myliquid.forgot": { fr: "Mot de passe oublié ?", en: "Forgot password?" },
  "myliquid.loggingIn": { fr: "Connexion...", en: "Signing in..." },
  "myliquid.noAccount": { fr: "Pas encore client ?", en: "Not a customer yet?" },
  "myliquid.subscribeLink": { fr: "Souscrire à un forfait", en: "Subscribe to a plan" },
  "myliquid.demoHint": { fr: "Compte démo", en: "Demo account" },
  "myliquid.hello": { fr: "Bonjour", en: "Hello" },
  "myliquid.clientNo": { fr: "Client n°", en: "Customer No." },
  "myliquid.tabOverview": { fr: "Aperçu", en: "Overview" },
  "myliquid.tabOrders": { fr: "Mes commandes", en: "My orders" },
  "myliquid.tabInvoices": { fr: "Factures", en: "Invoices" },
  "myliquid.tabSupport": { fr: "Support", en: "Support" },
  "myliquid.tabProfile": { fr: "Profil", en: "Profile" },

  // Infos / blog
  "infos.title": { fr: "Infos & Actualités", en: "News & Info" },
  "infos.subtitle": { fr: "Tout savoir sur la fibre Liquid Home : actualités, guides et tutoriels pour profiter au mieux de votre connexion.", en: "Everything about Liquid Home fiber: news, guides and tutorials to get the most out of your connection." },
  "infos.tabNews": { fr: "Actualités", en: "News" },
  "infos.tabTutos": { fr: "Tutoriels", en: "Tutorials" },
  "infos.readMore": { fr: "Lire l'article", en: "Read article" },
  "infos.back": { fr: "Retour aux infos", en: "Back to news" },
  "infos.empty": { fr: "Aucun article pour le moment.", en: "No articles yet." },

  // Footer
  "footer.legal": { fr: "Légal", en: "Legal" },
  "footer.info": { fr: "Informations", en: "Information" },
  "footer.contact": { fr: "Contact", en: "Contact" },
  "footer.social": { fr: "Réseaux Sociaux", en: "Social Media" },
  "footer.clientArea": { fr: "Espace client", en: "Client area" },
  "footer.backoffice": { fr: "Back-office", en: "Back-office" },
  "footer.terms": { fr: "Termes et conditions", en: "Terms & conditions" },
  "footer.rights": { fr: "© Copyright 2026 Liquid Home. Tous droits réservés.", en: "© Copyright 2026 Liquid Home. All rights reserved." },

  // Misc
  "common.required": { fr: "obligatoire", en: "required" },
  "common.loading": { fr: "Chargement...", en: "Loading..." },
  "common.close": { fr: "Fermer", en: "Close" },

  // Welcome modal
  "modal.welcome": { fr: "Bienvenue chez Liquid Home RDC", en: "Welcome to Liquid Home DRC" },
  "modal.chooseProfile": { fr: "Choisissez votre profil pour une expérience personnalisée", en: "Choose your profile for a personalized experience" },
  "modal.home": { fr: "Domicile", en: "Home" },
  "modal.homeSub": { fr: "Internet fibre pour la maison", en: "Fiber internet for your home" },
  "modal.business": { fr: "Petite et Moyenne Enterprise", en: "Small & Medium Enterprise" },
  "modal.businessSub": { fr: "Solutions pro pour entreprises", en: "Pro solutions for businesses" },
  "modal.skip": { fr: "Continuer sans choisir →", en: "Continue without choosing →" },
};

export function translate(lang: Lang, key: string): string {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[lang] ?? entry.fr;
}
