// Shared legal document content (server + client safe — no React here).
export const LEGAL_CONTENT: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
  "privacy": {
    title: "Politique de confidentialité",
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
  "cookies": {
    title: "Politique des cookies",
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
  "terms": {
    title: "Termes et conditions",
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
  }
}

export const LEGAL_TITLES_EN: Record<string, string> = {
  privacy: "Privacy Policy",
  cookies: "Cookies Policy",
  usage: "Acceptable Use Policy",
  terms: "Terms & Conditions",
};
