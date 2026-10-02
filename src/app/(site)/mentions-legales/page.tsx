import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalPage() {
  return (
    <article className="container-page max-w-3xl pb-24 pt-32 sm:pt-40">
      <h1 className="font-display text-5xl sm:text-6xl">Mentions légales</h1>
      <div className="prose-lv mt-10">
        <h2>Éditeur</h2>
        <p>
          {site.legal.publisher}
          <br />
          {site.legal.siret}
          <br />
          {site.legal.address}
          <br />
          Contact : {site.email}
        </p>
        <h2>Hébergement</h2>
        <p>{site.legal.host}</p>
        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des photographies présentes sur ce site est protégé par le droit d&apos;auteur. Toute
          reproduction, même partielle, sans autorisation écrite est interdite.
        </p>
        <h2>Données personnelles</h2>
        <p>
          Les données collectées (e-mail lors d&apos;une commande ou d&apos;un message) servent uniquement à traiter votre
          demande et à vous livrer vos photos. Les paiements sont traités par Stripe. Vous pouvez demander l&apos;accès, la
          rectification ou la suppression de vos données à {site.email}.
        </p>
        <h2>Cookies</h2>
        <p>
          Le site utilise uniquement des cookies techniques : mémorisation des galeries déverrouillées et de votre
          sélection. Aucun cookie publicitaire ni de mesure d&apos;audience tierce.
        </p>
      </div>
    </article>
  );
}
