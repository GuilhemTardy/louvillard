/**
 * Contenu éditorial du site. Tout ce qui est propre à Lou se modifie ici.
 */
export const site = {
  name: "Lou Villard",
  tagline: "Photographe d'événements — scène, spectacle & trail",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://louvillard.vercel.app",
  email: "contact@louvillard.fr",
  phone: "",
  city: "Grenoble & partout en France",
  instagram: "https://www.instagram.com/",
  instagramHandle: "@louvillard.photo",
  meta: "Grenoble · 45°11′N 5°43′E",
  kicker: "Photographe spectacle, scène et trail",
  disciplines: ["Spectacle", "Danse", "Concert", "Trail"],
  marquee: ["Spectacle", "Danse", "Théâtre", "Concert", "Galas", "Festivals", "Trail", "Courses nature"],
  intro:
    "Je photographie ce qui ne se rejoue pas : le saut au bon moment, la lumière qui tombe juste, le visage à l'arrivée d'un trail. Spectacles, galas, concerts et courses nature.",
  about: [
    "Photographe basée à Grenoble, je travaille au plus près de la scène et des sentiers. Danse, théâtre, concerts, galas d'écoles et courses de montagne : des moments qui durent une seconde et qu'on garde des années.",
    "En salle, je travaille sans flash, discrètement, pour ne jamais perturber les artistes ni le public. Sur les trails, je me poste là où la course raconte quelque chose : la montée, la crête, l'arrivée.",
    "Après chaque événement, les photos sont triées, retouchées une à une et mises en ligne dans une galerie privée. Chaque participant retrouve ses images grâce à un code, puis télécharge en haute définition celles qu'il préfère.",
  ],
  services: [
    {
      title: "Spectacles & galas",
      text: "Danse, théâtre, cirque, galas d'écoles et de conservatoires. Couverture complète de la générale ou de la représentation, galerie privée pour les familles.",
    },
    {
      title: "Concerts & festivals",
      text: "Scène, public, backstage. Images livrées rapidement pour les artistes, l'organisation et la presse.",
    },
    {
      title: "Trails & courses nature",
      text: "Plusieurs points de prise de vue sur le parcours, photos classées par dossard : chaque coureur retrouve les siennes en quelques secondes.",
    },
    {
      title: "Événements",
      text: "Soirées, séminaires, lancements, associations. Reportage discret et galerie partagée avec vos invités.",
    },
  ],
  steps: [
    { title: "Entrez votre code", text: "Il vous a été communiqué par l'organisateur, sur votre billet ou au retrait des dossards." },
    { title: "Retrouvez-vous", text: "Par numéro de dossard, par tableau ou par moment de la soirée. Ajoutez vos favorites au panier." },
    { title: "Téléchargez en HD", text: "Paiement sécurisé, puis téléchargement immédiat des fichiers haute définition, sans filigrane." },
  ],
  faq: [
    {
      q: "Je n'ai pas de code d'accès, comment faire ?",
      a: "Le code est transmis par l'organisateur (école de danse, club, organisation de la course). Sinon, écrivez-moi en précisant l'événement : je vous le renvoie.",
    },
    {
      q: "En quelle qualité sont livrées les photos ?",
      a: "En JPEG pleine résolution, retouchées, sans filigrane. Elles sont imprimables en grand format.",
    },
    {
      q: "Combien de temps puis-je télécharger mes photos ?",
      a: "Le lien de téléchargement reste actif 60 jours. Pensez à enregistrer vos fichiers ; il est aussi envoyé par e-mail. Lien perdu ? La page « Retrouver ma commande » vous le renvoie.",
    },
    {
      q: "Puis-je publier les photos sur les réseaux ?",
      a: "Oui, pour un usage personnel, en mentionnant le crédit photo. Pour un usage commercial ou presse, contactez-moi.",
    },
    {
      q: "Je souhaite qu'une photo de moi soit retirée.",
      a: "Écrivez-moi avec le lien ou le numéro de la photo : elle sera retirée de la galerie sous 48 h.",
    },
  ],
  legal: {
    publisher: "Lou Villard, photographe — entrepreneur individuel",
    siret: "SIRET à compléter",
    address: "Adresse à compléter",
    host: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  },
} as const;
