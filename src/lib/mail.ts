import "server-only";
import { site } from "@/content/site";

/**
 * Envoi d'e-mails via l'API Resend (https://resend.com), uniquement si
 * RESEND_API_KEY est défini. Sans clé, les envois sont simplement ignorés.
 */
export const mailEnabled = Boolean(process.env.RESEND_API_KEY);

type Mail = { to: string; subject: string; html: string; replyTo?: string };

export async function sendMail({ to, subject, html, replyTo }: Mail) {
  if (!mailEnabled) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM ?? `${site.name} <onboarding@resend.dev>`,
      to,
      subject,
      html,
      reply_to: replyTo,
    }),
  });
  if (!res.ok) console.error("[mail] échec", res.status, await res.text().catch(() => ""));
  return res.ok;
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function layout(title: string, body: string) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#0d0c0b;font-family:Helvetica,Arial,sans-serif;color:#efe9df">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <p style="font-family:Georgia,serif;font-size:22px;letter-spacing:.08em;margin:0 0 32px">${escapeHtml(site.name.toUpperCase())}</p>
    <h1 style="font-family:Georgia,serif;font-weight:normal;font-size:28px;margin:0 0 16px">${escapeHtml(title)}</h1>
    ${body}
    <p style="color:#8f897f;font-size:12px;margin-top:40px">${escapeHtml(site.name)} — ${escapeHtml(site.tagline)}</p>
  </div></body></html>`;
}

export function button(href: string, label: string) {
  return `<p style="margin:28px 0"><a href="${href}" style="display:inline-block;background:#e3b464;color:#14110d;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:bold">${escapeHtml(label)}</a></p>`;
}
