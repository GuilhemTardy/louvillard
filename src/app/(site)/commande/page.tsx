import type { Metadata } from "next";
import { RecoverForm } from "@/components/recover-form";
import { DOWNLOAD_DAYS } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Retrouver ma commande",
  description: "Recevez à nouveau vos liens de téléchargement par e-mail.",
};

export default function RecoverPage() {
  return (
    <section className="container-page flex min-h-[80svh] items-center pb-20 pt-32">
      <div className="mx-auto w-full max-w-xl">
        <p className="eyebrow">Commande</p>
        <h1 className="mt-4 font-display text-5xl leading-[0.95] sm:text-6xl">Lien de téléchargement perdu ?</h1>
        <p className="mt-6 leading-relaxed text-muted">
          Entrez l&apos;adresse e-mail utilisée lors du paiement : vous recevrez les liens de vos commandes des {DOWNLOAD_DAYS}{" "}
          derniers jours.
        </p>
        <div className="card mt-10 p-6 sm:p-8">
          <RecoverForm />
        </div>
      </div>
    </section>
  );
}
