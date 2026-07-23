// Régénère public/sitemap.xml : pages statiques (liste figée ci-dessous) +
// articles de blog (déduits de content/blog/*/{fr,en,de}.md). Lancé
// automatiquement avant chaque build via le hook npm "prebuild".
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const origin = 'https://smartkids-school.ch';
const today = new Date().toISOString().slice(0, 10);

const LOCALES = [
  { code: 'FR', prefix: '', hreflang: 'fr-CH' },
  { code: 'EN', prefix: '/en', hreflang: 'en-CH' },
  { code: 'DE', prefix: '/de', hreflang: 'de-CH' },
];

// basePath (français, sans préfixe) → { changefreq, priority }
const STATIC_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0', lastmod: today },
  { path: '/tarifs', changefreq: 'weekly', priority: '0.9', lastmod: today },
  { path: '/stages', changefreq: 'weekly', priority: '0.9', lastmod: today },
  { path: '/premium', changefreq: 'monthly', priority: '0.8', lastmod: today },
  { path: '/faq', changefreq: 'monthly', priority: '0.7', lastmod: today },
  { path: '/blog', changefreq: 'weekly', priority: '0.7', lastmod: today },
  { path: '/cgv', changefreq: 'yearly', priority: '0.3', lastmod: today },
  { path: '/legal', changefreq: 'yearly', priority: '0.3', lastmod: today },
];

function localizedPath(basePath, prefix) {
  return basePath === '/' ? (prefix || '/') : `${prefix}${basePath}`;
}

function urlBlock({ basePath, changefreq, priority, lastmod }) {
  const alternates = LOCALES.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${origin}${localizedPath(basePath, l.prefix)}" />`
  ).join('\n');
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${localizedPath(basePath, '')}" />`;

  return LOCALES.map(l => `  <url>
    <loc>${origin}${localizedPath(basePath, l.prefix)}</loc>
${alternates}
${xDefault}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n\n');
}

// ── Articles de blog : un slug par sous-dossier de content/blog/ ──
const blogDir = join(root, 'content', 'blog');
let blogSlugs = [];
try {
  blogSlugs = readdirSync(blogDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
} catch {
  // Pas encore de dossier content/blog/ : sitemap sans articles.
}

const blogPages = blogSlugs.map(slug => {
  const frPath = join(blogDir, slug, 'fr.md');
  let lastmod = today;
  try {
    const { data } = matter(readFileSync(frPath, 'utf-8'));
    lastmod = data.date || today;
  } catch {
    lastmod = statSync(join(blogDir, slug)).mtime.toISOString().slice(0, 10);
  }
  return { path: `/blog/${slug}`, changefreq: 'monthly', priority: '0.6', lastmod };
});

// ── src/lib/blogSlugs.generated.ts : liste des slugs pour le routeur ──
// Généré ici plutôt que via import.meta.glob côté client, pour ne jamais
// entraîner gray-matter/marked ni le contenu Markdown dans le bundle principal
// (voir router/config.tsx, qui a besoin de la liste des slugs au démarrage,
// hors lazy-loading des pages /blog).
const slugsFile = `// Fichier généré automatiquement par scripts/generate-sitemap.mjs — ne pas éditer à la main.
export const ALL_SLUGS: string[] = ${JSON.stringify(blogSlugs)};
`;
writeFileSync(join(root, 'src', 'lib', 'blogSlugs.generated.ts'), slugsFile, 'utf-8');

const allPages = [...STATIC_PAGES, ...blogPages];

const body = allPages
  .map(p => `  <!-- ${p.path} -->\n${urlBlock({ basePath: p.path, changefreq: p.changefreq, priority: p.priority, lastmod: p.lastmod })}`)
  .join('\n\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">

${body}

</urlset>
`;

writeFileSync(join(root, 'public', 'sitemap.xml'), xml, 'utf-8');
console.log(`sitemap.xml régénéré : ${allPages.length} pages × 3 langues = ${allPages.length * 3} URLs.`);
