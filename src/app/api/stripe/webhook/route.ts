import { type NextRequest } from "next/server";
import type Stripe from "stripe";
import { site } from "@/content/site";
import { getEvent } from "@/lib/events";
import { button, escapeHtml, layout, sendMail } from "@/lib/mail";
import { constructWebhookEvent, DOWNLOAD_DAYS, orderFromSession } from "@/lib/orders";
import { formatPrice } from "@/lib/pricing";

/**
 * Webhook Stripe : à la confirmation du paiement, envoie le lien de
 * téléchargement au client et prévient Lou. (Le téléchargement fonctionne
 * aussi sans webhook, depuis la page de confirmation.)
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Signature manquante", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await constructWebhookEvent(await req.text(), signature);
  } catch (error) {
    console.error("[stripe] webhook invalide", error);
    return new Response("Signature invalide", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const order = orderFromSession(session);
    if (order?.paid) {
      const ev = await getEvent(order.slug);
      const link = `${req.nextUrl.origin}/commande/${order.ref}`;
      const title = ev?.title ?? order.slug;
      const count = order.all ? "la galerie complète" : `${order.photoIds.length} photo${order.photoIds.length > 1 ? "s" : ""}`;
      if (order.email) {
        await sendMail({
          to: order.email,
          replyTo: site.email,
          subject: `Vos photos — ${title}`,
          html: layout(
            "Merci pour votre commande !",
            `<p style="line-height:1.6">Vos photos HD (${escapeHtml(count)}) de <strong>${escapeHtml(title)}</strong> sont prêtes.</p>
             ${button(link, "Télécharger mes photos")}
             <p style="line-height:1.6;color:#b9b2a6;font-size:14px">Le lien reste actif ${DOWNLOAD_DAYS} jours. Pensez à enregistrer vos fichiers.</p>`,
          ),
        });
      }
      await sendMail({
        to: process.env.NOTIFY_EMAIL ?? site.email,
        subject: `Nouvelle vente : ${formatPrice(order.amount)} — ${title}`,
        html: layout(
          "Nouvelle vente",
          `<p style="line-height:1.6">${escapeHtml(order.email ?? "Client")} a acheté ${escapeHtml(count)} de <strong>${escapeHtml(title)}</strong> pour ${formatPrice(order.amount)}.</p>`,
        ),
      });
    }
  }
  return new Response("ok");
}
