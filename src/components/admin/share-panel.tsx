"use client";

import { useState } from "react";

export function SharePanel({ url, codes, title, qrSvg }: { url: string; codes: string[]; title: string; qrSvg: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const message = `Les photos de « ${title} » sont en ligne !\n\n👉 ${url}\nCode d'accès : ${codes[0] ?? ""}\n\nRetrouvez-vous, choisissez vos photos préférées et téléchargez-les en haute définition.`;

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

  function printQr() {
    const w = window.open("", "_blank", "width=600,height=800");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${esc(title)}</title><style>body{font-family:Georgia,serif;text-align:center;padding:48px}svg{width:320px;height:320px}p{font-family:Helvetica,sans-serif}</style></head><body>
      <h1 style="font-weight:normal">${esc(title)}</h1><p>Retrouvez vos photos</p>${qrSvg}
      <p style="font-size:20px">Code : <strong style="letter-spacing:4px">${esc(codes[0] ?? "")}</strong></p><p style="color:#666">${url}</p>
      <script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  }

  return (
    <div className="card grid gap-6 p-6 sm:grid-cols-[auto_1fr]">
      <div className="mx-auto h-36 w-36 rounded-lg bg-white p-2 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
      <div className="min-w-0 space-y-3 text-sm">
        <p className="font-medium">Partager la galerie</p>
        <p className="truncate text-muted">{url}</p>
        <p>
          Code : <span className="font-mono tracking-widest text-accent">{codes.join(" · ")}</span>
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(url, "url")}>{copied === "url" ? "Copié ✓" : "Copier le lien"}</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(message, "msg")}>{copied === "msg" ? "Copié ✓" : "Copier le message aux participants"}</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={printQr}>Imprimer l&apos;affiche QR</button>
        </div>
      </div>
    </div>
  );
}
