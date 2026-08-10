import { marked } from 'marked';
import type { Locale } from '../i18n/routing';

// Chaque article vit dans content/blog/<slug>/{fr,en,de}.md (frontmatter +
// corps Markdown). Chargement paresseux (pas de eager: true) : chaque fichier
// devient son propre chunk Vite, récupéré uniquement quand il est réellement
// demandé. Avant ce changement, eager: true inlinait les 57 fichiers (19
// articles x 3 langues) dans un seul chunk partagé de ~243 Ko, téléchargé en
// entier même pour lire un seul article dans une seule langue.
const rawLoaders = import.meta.glob('../../content/blog/*/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

interface ArticleFrontmatter {
  title: string;
  description: string;
  excerpt: string;
  date: string; // format YYYY-MM-DD
  category?: string; // "local" pour les guides par ville (regroupés à part sur /blog)
}

export interface ArticleSummary extends ArticleFrontmatter {
  slug: string;
  locale: Locale;
  readTimeMinutes: number;
}

export interface Article extends ArticleSummary {
  html: string;
}

const LOCALE_BY_FILENAME: Record<string, Locale> = { fr: 'FR', en: 'EN', de: 'DE' };

interface FileRef {
  slug: string;
  locale: Locale;
  path: string;
  load: () => Promise<string>;
}

function readTimeFor(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// Frontmatter minimal (clé: "valeur entre guillemets"), volontairement pas de
// dépendance YAML complète (gray-matter) : ces libs s'appuient sur Buffer, une
// API Node absente du navigateur, ce qui faisait planter la page au chargement.
function parseFrontmatter(raw: string): { frontmatter: ArticleFrontmatter; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error("Frontmatter manquant en tête de l'article");
  const [, block, content] = match;
  const data: Record<string, string> = {};
  for (const line of block.split(/\r?\n/)) {
    const field = line.match(/^(\w+):\s*"(.*)"\s*$/);
    if (field) data[field[1]] = field[2];
  }
  return { frontmatter: data as unknown as ArticleFrontmatter, content: content.trim() };
}

const fileRefs: FileRef[] = Object.entries(rawLoaders).map(([path, load]) => {
  const match = path.match(/content\/blog\/([^/]+)\/(fr|en|de)\.md$/);
  if (!match) throw new Error(`Chemin d'article Markdown inattendu : ${path}`);
  const [, slug, filename] = match;
  return { slug, locale: LOCALE_BY_FILENAME[filename], path, load };
});

// Cache le résultat parsé (frontmatter + contenu) par fichier, pour ne
// télécharger et parser chaque fichier qu'une seule fois par session.
const parsedCache = new Map<string, Promise<{ frontmatter: ArticleFrontmatter; content: string }>>();
function loadParsed(ref: FileRef): Promise<{ frontmatter: ArticleFrontmatter; content: string }> {
  let cached = parsedCache.get(ref.path);
  if (!cached) {
    cached = ref.load().then(parseFrontmatter);
    parsedCache.set(ref.path, cached);
  }
  return cached;
}

export async function getAllArticles(locale: Locale): Promise<ArticleSummary[]> {
  const refs = fileRefs.filter(r => r.locale === locale);
  const parsed = await Promise.all(refs.map(async ref => ({ ref, ...(await loadParsed(ref)) })));
  return parsed
    .map(({ ref, frontmatter, content }) => ({
      slug: ref.slug,
      locale: ref.locale,
      ...frontmatter,
      readTimeMinutes: readTimeFor(content),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getArticle(slug: string, locale: Locale): Promise<Article | null> {
  const ref = fileRefs.find(r => r.slug === slug && r.locale === locale);
  if (!ref) return null;
  const { frontmatter, content } = await loadParsed(ref);
  return {
    slug: ref.slug,
    locale: ref.locale,
    ...frontmatter,
    readTimeMinutes: readTimeFor(content),
    html: marked.parse(content) as string,
  };
}
