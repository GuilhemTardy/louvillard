# Lou Villard — photographe d'événements

Site portfolio + **vente de photos par événement** (spectacles, galas, concerts, trails).

- **Portfolio public** : accueil, portfolio filtrable, à propos/prestations/FAQ, contact.
- **Galeries privées par code** : chaque événement est protégé par un code d'accès. Sans code, seule la couverture est visible.
- **Retrouvez-vous** : recherche par **numéro de dossard** (trail) ou par **moment/tableau** (spectacle, concert).
- **Panier & paiement** : prix unitaire, **lots dégressifs** et **galerie complète** — le meilleur prix est calculé automatiquement. Paiement **Stripe Checkout** (CB, Apple Pay, Google Pay, codes promo).
- **Livraison immédiate** : page de téléchargement (photo par photo ou ZIP) valable 60 jours + e-mail automatique. Lien perdu : la page `/commande` renvoie les liens par e-mail.
- **Protection** : les visiteurs ne voient que des aperçus réduits et **filigranés**, générés à l'import. Les originaux HD ne sont servis qu'après paiement vérifié.
- **Espace admin** (`/admin`) : créer un événement, importer les photos par glisser-déposer, taguer, saisir les dossards à la chaîne, choisir la couverture, QR code à imprimer, suivi des ventes.

Stack : Next.js 16 (App Router) · Tailwind CSS 4 · sharp · Stripe · Vercel Blob (privé) · Resend (optionnel). Aucune base de données : les événements sont des fichiers JSON dans le stockage, les commandes vivent dans Stripe.

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # renseigner au minimum ADMIN_PASSWORD
npm run dev
```

- Site : http://localhost:3000
- Admin : http://localhost:3000/admin
- Galeries de démo : codes `CRETES26` (trail, essayez les dossards 27, 115, 202), `ETOILE26` (gala de danse), `NUITS26` (concert). Le paiement y est **simulé**.

En local, les photos importées sont rangées dans `.data/` (ignoré par git).

## Mise en ligne sur Vercel

1. Importer le dépôt dans Vercel (framework détecté automatiquement).
2. **Storage → Blob → Create** : créer un store **privé** et le connecter au projet (ajoute `BLOB_READ_WRITE_TOKEN`).
3. Variables d'environnement : `ADMIN_PASSWORD`, `APP_SECRET` (`openssl rand -base64 48`), `NEXT_PUBLIC_SITE_URL`.
4. **Stripe** : récupérer la clé secrète (`STRIPE_SECRET_KEY`), puis créer un webhook vers `https://<domaine>/api/stripe/webhook` avec les événements `checkout.session.completed` et `checkout.session.async_payment_succeeded` → `STRIPE_WEBHOOK_SECRET`.
5. *(Optionnel)* **Resend** pour les e-mails : `RESEND_API_KEY`, `MAIL_FROM` (domaine vérifié), `NOTIFY_EMAIL`.
6. Redéployer. Le tableau de bord `/admin` affiche ce qui reste à configurer.

Quand les vraies galeries sont en ligne : `SHOW_DEMO_EVENTS=false`.

## Workflow de Lou après un événement

1. `/admin` → **Nouvel événement** : titre, date, lieu, catégorie, code d'accès (bouton « Générer »), tarifs.
2. Glisser les photos (JPEG pleine résolution, jusqu'à 80 Mo). Les aperçus filigranés sont créés automatiquement ; l'heure de prise de vue est lue dans l'EXIF.
3. **Trail** : bouton **Saisie des dossards** → photo en grand, taper `248 115`, Entrée → photo suivante. Astuce : un nom de fichier contenant `D248` ou `#248` pré-remplit le dossard.
   **Spectacle** : sélectionner des photos (Maj+clic pour une plage) → ajouter un tag (« Ouverture », « Final »…).
4. Choisir la photo de couverture (sélection d'une photo → « Couverture »).
5. Partager : copier le message pré-rédigé (lien + code) pour l'organisateur, ou **imprimer l'affiche QR** à poser à l'arrivée / au théâtre.
6. Suivre les ventes dans **Ventes** (et dans le tableau de bord Stripe).

## Personnaliser

| Quoi | Où |
| --- | --- |
| Textes, e-mail, Instagram, FAQ, prestations, mentions légales | `src/content/site.ts` |
| Images du portfolio | `public/portfolio/` + légendes dans `src/content/portfolio.json` |
| Couleurs, typographies | `src/app/globals.css`, `src/app/layout.tsx` |
| Filigrane | `assets/watermark.png` (motif répété sur les aperçus) |
| Durée de validité des téléchargements | `DOWNLOAD_DAYS` dans `src/lib/orders.ts` |

⚠️ À compléter avant d'ouvrir les ventes : SIRET et adresse (`site.legal`), vraie adresse e-mail, vraies photos du portfolio.

Les images de démonstration (portfolio et galeries) sont générées par `npm run demo:generate`.

## Vérifications

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Les mêmes vérifications tournent automatiquement sur GitHub à chaque push (`.github/workflows/ci.yml`).
La fréquentation est mesurée par Vercel Web Analytics et Speed Insights (à activer dans l'onglet *Analytics* du projet Vercel, sans cookie).

## Architecture

```
src/app/(site)/          pages publiques (accueil, portfolio, événements, commande…)
src/app/admin/           espace photographe
src/app/api/access       vérification des codes (limité à 10 essais / 10 min / IP)
src/app/api/photos       aperçus filigranés (cookie d'accès requis, sauf couverture)
src/app/api/checkout     calcul du prix côté serveur + session Stripe
src/app/api/orders       téléchargement HD / ZIP après paiement vérifié
src/app/api/stripe       webhook (e-mail client + alerte vente)
src/lib/                 stockage (Blob/local), événements, tarifs, commandes, signatures
seed/                    galeries de démonstration (lecture seule)
```

Sécurité : cookies d'accès et liens de commande signés HMAC (`APP_SECRET`) ; le prix est toujours recalculé côté serveur ; une commande Stripe n'ouvre que les photos qu'elle contient, et seulement si `payment_status = paid` ; les originaux sont dans un store Blob privé, jamais exposés directement.
