import type { Metadata } from "next";
import { site } from "@/content/site";
import { DOWNLOAD_DAYS } from "@/lib/orders";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function CgvPage() {
  return (
    <article className="container-page max-w-3xl pb-24 pt-32 sm:pt-40">
      <p className="eyebrow">Mise à jour : 2026</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">Conditions générales de vente</h1>
      <div className="prose-lv mt-10">
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions régissent la vente de photographies numériques proposées par {site.legal.publisher}
          (ci-après « la photographe ») sur ce site, à destination de particuliers, pour un usage strictement personnel.
        </p>
        <h2>2. Produits</h2>
        <p>
          Les photographies sont vendues sous forme de fichiers numériques JPEG haute définition, retouchés et sans
          filigrane. Les aperçus en ligne sont volontairement réduits et filigranés.
        </p>
        <h2>3. Prix</h2>
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises, sur chaque galerie. Des tarifs dégressifs (lots, galerie
          complète) s&apos;appliquent automatiquement au moment de la commande.
        </p>
        <h2>4. Commande et paiement</h2>
        <p>
          La commande est validée après paiement sécurisé par carte bancaire via Stripe. La photographe n&apos;a jamais
          accès à vos données bancaires.
        </p>
        <h2>5. Livraison</h2>
        <p>
          Les fichiers sont disponibles immédiatement après le paiement, sur la page de confirmation et par e-mail. Le lien
          de téléchargement reste actif {DOWNLOAD_DAYS} jours ; il appartient au client d&apos;enregistrer ses fichiers.
        </p>
        <h2>6. Droit de rétractation</h2>
        <p>
          Conformément à l&apos;article L221-28 13° du Code de la consommation, le droit de rétractation ne peut être exercé
          pour la fourniture d&apos;un contenu numérique non fourni sur un support matériel dont l&apos;exécution a commencé
          avec l&apos;accord préalable exprès du consommateur, qui renonce ainsi à son droit de rétractation. Cet accord est
          recueilli avant le paiement.
        </p>
        <h2>7. Droits d&apos;auteur et usage</h2>
        <p>
          Les photographies restent la propriété intellectuelle de la photographe. L&apos;achat confère une licence
          d&apos;usage personnel et non commercial (impression, partage privé, réseaux sociaux personnels avec mention
          « Photo : {site.name} »). Toute utilisation commerciale, publicitaire ou de presse nécessite un accord écrit.
        </p>
        <h2>8. Droit à l&apos;image</h2>
        <p>
          Toute personne apparaissant sur une photographie peut demander son retrait de la galerie en écrivant à{" "}
          {site.email}. La demande est traitée sous 48 heures.
        </p>
        <h2>9. Réclamations</h2>
        <p>
          En cas de problème (fichier illisible, erreur de commande), contactez {site.email}. À défaut de solution amiable,
          le client peut recourir gratuitement à un médiateur de la consommation.
        </p>
      </div>
    </article>
  );
}
