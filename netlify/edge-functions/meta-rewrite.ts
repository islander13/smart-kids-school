// ─────────────────────────────────────────────────────────────────────────
// Netlify Edge Function : meta-rewrite
// ─────────────────────────────────────────────────────────────────────────
// Le site est un SPA React 100% rendu côté client : index.html (le même
// fichier pour TOUTES les routes) ne contient qu'un titre/description/OG
// génériques — le vrai contenu par page n'est posé qu'après coup en
// JavaScript (document.title = ..., voir src/lib/pageMeta.ts). Un robot ou
// un aperçu de lien qui n'exécute pas de JS (Slack, WhatsApp, la plupart des
// crawlers hors Google) voit donc toujours la même page, quelle que soit
// l'URL demandée.
//
// Cette fonction réécrit <title>, meta description et les balises Open
// Graph/Twitter dans le HTML AVANT qu'il ne soit servi, à partir de
// netlify/edge-functions/_generated-meta-map.json (généré par
// scripts/generate-meta-map.mjs au build, à partir de src/data/pageMeta.json
// + du frontmatter des articles de blog — mêmes sources que le code React,
// jamais une copie séparée).
//
// Ne migre PAS vers du SSR : le contenu de la page (le <div id="root">)
// reste vide jusqu'à l'exécution de React, seul le <head> est corrigé. Si
// la route demandée n'est pas dans la table (ex: /espace, /admin, un
// deep-link /inscription, une page 404), la réponse d'origine repart
// inchangée — aucun risque de servir un titre incorrect faute
// d'entrée trouvée.
// ─────────────────────────────────────────────────────────────────────────

import metaMap from "./_generated-meta-map.json" with { type: "json" };

type MetaEntry = { title: string; description: string };
const META_MAP = metaMap as Record<string, MetaEntry>;

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceTag(html: string, pattern: RegExp, replacement: string): string {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const url = new URL(request.url);
  const meta = META_MAP[url.pathname];

  const response = await context.next();

  if (!meta) return response;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let html = await response.text();

  const title = escapeHtmlAttr(meta.title);
  const description = escapeHtmlAttr(meta.description);
  const pageUrl = escapeHtmlAttr(`https://smartkids-school.ch${url.pathname}`);

  html = replaceTag(html, /<title>.*?<\/title>/, `<title>${title}</title>`);
  html = replaceTag(html, /<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`);
  html = replaceTag(html, /<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`);
  html = replaceTag(html, /<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`);
  html = replaceTag(html, /<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${pageUrl}" />`);
  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${title}" />`);
  html = replaceTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${description}" />`);

  return new Response(html, {
    status: response.status,
    headers: response.headers,
  });
};

export const config = {
  path: "/*",
  excludedPath: [
    "/assets/*",
    "/.netlify/*",
    "/admin",
    "/admin/*",
    "/videos/*",
    "/resources/*",
    "/espace",
    "/en/espace",
    "/de/espace",
  ],
};
