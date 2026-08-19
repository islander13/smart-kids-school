// Génère netlify/edge-functions/_generated-meta-map.json : pour chaque route
// indexable (pages statiques + articles de blog) × chaque langue, le titre et
// la description à poser dans le HTML AVANT que React ne s'exécute (voir
// netlify/edge-functions/meta-rewrite.ts). Lancé automatiquement avant chaque
// build via le hook npm "prebuild", juste après generate-sitemap.mjs.
//
// Source unique pour les pages statiques : src/data/pageMeta.json (le même
// fichier que les pages React importent pour document.title/meta au montage —
// aucune duplication, un seul endroit à modifier pour changer un titre).
// Pour le blog, le titre/la description viennent directement du frontmatter
// de chaque content/blog/<slug>/<locale>.md (déjà la source de vérité utilisée
// par src/lib/blog.ts côté client).
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const LOCALES = [
  { code: 'FR', prefix: '' },
  { code: 'EN', prefix: '/en' },
  { code: 'DE', prefix: '/de' },
];

function localizedPath(basePath, prefix) {
  return basePath === '/' ? (prefix || '/') : `${prefix}${basePath}`;
}

const pageMeta = JSON.parse(readFileSync(join(root, 'src', 'data', 'pageMeta.json'), 'utf-8'));

const map = {};

// ── Pages statiques ──
for (const [basePath, byLocale] of Object.entries(pageMeta)) {
  for (const { code, prefix } of LOCALES) {
    const entry = byLocale[code];
    if (!entry) continue;
    map[localizedPath(basePath, prefix)] = { title: entry.title, description: entry.description };
  }
}

// ── Articles de blog ──
function extractFrontmatterField(raw, field) {
  const match = raw.match(new RegExp(`^${field}:\\s*"(.*)"\\s*$`, 'm'));
  return match?.[1] || null;
}

const blogDir = join(root, 'content', 'blog');
let blogSlugs = [];
try {
  blogSlugs = readdirSync(blogDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
} catch {
  // Pas encore de dossier content/blog/ : pas d'article à ajouter.
}

const localeFile = { FR: 'fr', EN: 'en', DE: 'de' };
let articleCount = 0;
for (const slug of blogSlugs) {
  for (const { code, prefix } of LOCALES) {
    const filePath = join(blogDir, slug, `${localeFile[code]}.md`);
    let raw;
    try {
      raw = readFileSync(filePath, 'utf-8');
    } catch {
      continue; // pas de traduction pour cette langue
    }
    const title = extractFrontmatterField(raw, 'title');
    const description = extractFrontmatterField(raw, 'description');
    if (!title || !description) continue;
    map[localizedPath(`/blog/${slug}`, prefix)] = { title: `${title} | Smart Kids School`, description };
    articleCount++;
  }
}

const outDir = join(root, 'netlify', 'edge-functions');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, '_generated-meta-map.json'), JSON.stringify(map, null, 2), 'utf-8');
console.log(`_generated-meta-map.json régénéré : ${Object.keys(pageMeta).length} pages statiques + ${articleCount} traductions d'article = ${Object.keys(map).length} routes.`);
