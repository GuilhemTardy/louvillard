import { NextResponse, type NextRequest } from "next/server";
import { site } from "@/content/site";
import { escapeHtml, layout, mailEnabled, sendMail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limit = await rateLimit("contact", 5, 60 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Trop de messages envoyés. Réessayez plus tard." }, { status: 429 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const field = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  const name = field("name", 120);
  const email = field("email", 200);
  const subject = field("subject", 120);
  const message = field("message", 5000);
  if (field("website", 100)) return NextResponse.json({ ok: true }); // pot de miel anti-spam
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
    return NextResponse.json({ error: "Merci de remplir votre nom, un e-mail valide et votre message." }, { status: 400 });
  }
  if (!mailEnabled) {
    return NextResponse.json({ error: `Le formulaire n'est pas encore relié. Écrivez directement à ${site.email}.` }, { status: 503 });
  }
  const ok = await sendMail({
    to: process.env.NOTIFY_EMAIL ?? site.email,
    replyTo: email,
    subject: `[Site] ${subject || "Nouveau message"} — ${name}`,
    html: layout(
      subject || "Nouveau message",
      `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p><p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</p>`,
    ),
  });
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: `L'envoi a échoué. Écrivez directement à ${site.email}.` }, { status: 502 });
}
