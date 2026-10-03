import { NextResponse, type NextRequest } from "next/server";
import { site } from "@/content/site";
import { getEvent } from "@/lib/events";
import { button, escapeHtml, layout, mailEnabled, sendMail } from "@/lib/mail";
import { findOrdersByEmail, stripeEnabled } from "@/lib/orders";
import { formatPrice } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Renvoie par e-mail les liens de téléchargement d'une adresse.
 * Les liens ne sont jamais affichés à l'écran : seule la boîte mail du client les reçoit.
 */
export async function POST(req: NextRequest) {
  const limit = await rateLimit("recover", 5, 60 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Trop de demandes. Réessayez plus tard." }, { status: 429 });

  const { email } = (await req.json().catch(() => ({}))) as { email?: unknown };
  const address = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }
  if (!stripeEnabled || !mailEnabled) {
    return NextResponse.json({ error: `Écrivez à ${site.email} en indiquant l'événement et la date d'achat.` }, { status: 503 });
  }

  const orders = await findOrdersByEmail(address);
  if (orders.length) {
    const rows = await Promise.all(
      orders.map(async (o) => {
        const title = (await getEvent(o.slug))?.title ?? o.slug;
        const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(o.createdAt);
        return `<p style="line-height:1.6;margin:24px 0 0"><strong>${escapeHtml(title)}</strong><br><span style="color:#b9b2a6">${date} · ${formatPrice(o.amount)}</span></p>
          ${button(`${req.nextUrl.origin}/commande/${o.ref}`, "Télécharger")}`;
      }),
    );
    await sendMail({
      to: address,
      replyTo: site.email,
      subject: "Vos liens de téléchargement",
      html: layout("Vos photos", `<p style="line-height:1.6">Voici les liens de vos commandes encore actives.</p>${rows.join("")}`),
    });
  }
  // Réponse identique dans tous les cas : on ne révèle pas si l'adresse a commandé.
  return NextResponse.json({ ok: true });
}
